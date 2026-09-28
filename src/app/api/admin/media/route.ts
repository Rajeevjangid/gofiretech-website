import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
]

// ── GET /api/admin/media ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page   = Math.max(1, parseInt(searchParams.get('page')  || '1'))
    const limit  = Math.min(48, parseInt(searchParams.get('limit') || '24'))
    const search = searchParams.get('search')?.trim() || ''
    const skip   = (page - 1) * limit

    const where = search
      ? { originalName: { contains: search } }
      : {}

    const [files, total] = await Promise.all([
      db.mediaFile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.mediaFile.count({ where }),
    ])

    return NextResponse.json({ files, total, page, limit })
  } catch (error) {
    console.error('[media GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── POST /api/admin/media ────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const files    = formData.getAll('files') as File[]

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    const results = []

    for (const file of files) {
      // ── Validate ─────────────────────────────────────────
      if (file.size > MAX_FILE_SIZE) {
        results.push({ success: false, name: file.name, error: 'File exceeds 5 MB limit' })
        continue
      }
      if (!ALLOWED_MIME.includes(file.type)) {
        results.push({ success: false, name: file.name, error: 'Invalid file type' })
        continue
      }

      try {
        const bytes  = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const ext      = path.extname(file.name).toLowerCase() || '.jpg'
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase()
        const baseName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safeName}`

        let filename: string
        let url: string
        let mimeType: string
        let size: number
        let width: number | undefined
        let height: number | undefined

        if (file.type === 'image/svg+xml') {
          // SVGs: save as-is
          filename = baseName
          await writeFile(path.join(UPLOAD_DIR, filename), buffer)
          url      = `/uploads/${filename}`
          mimeType = 'image/svg+xml'
          size     = file.size
        } else {
          // Raster images: convert to WebP with sharp
          const processed  = await sharp(buffer)
            .resize({ width: 1920, withoutEnlargement: true })
            .webp({ quality: 85 })
            .toBuffer()

          const meta   = await sharp(processed).metadata()
          width        = meta.width
          height       = meta.height

          filename     = baseName.replace(ext, '.webp')
          await writeFile(path.join(UPLOAD_DIR, filename), processed)
          url          = `/uploads/${filename}`
          mimeType     = 'image/webp'
          size         = processed.length
        }

        const record = await db.mediaFile.create({
          data: {
            filename,
            originalName: file.name,
            url,
            mimeType,
            size,
            width:  width  ?? null,
            height: height ?? null,
          },
        })

        results.push({ success: true, file: record })
      } catch (uploadErr) {
        console.error('[media upload item]', uploadErr)
        results.push({ success: false, name: file.name, error: 'Processing failed' })
      }
    }

    const succeeded = results.filter(r => r.success)
    const failed    = results.filter(r => !r.success)

    return NextResponse.json(
      { results, succeeded: succeeded.length, failed: failed.length },
      { status: succeeded.length ? 200 : 400 },
    )
  } catch (error) {
    console.error('[media POST]', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
