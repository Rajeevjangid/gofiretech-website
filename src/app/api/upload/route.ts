import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Create upload directory
    await mkdir(UPLOAD_DIR, { recursive: true })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = path.extname(file.name).toLowerCase() || '.jpg'
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase()
    const fileName = `${Date.now()}-${safeName}`
    const filePath = path.join(UPLOAD_DIR, fileName)

    let width: number | undefined
    let height: number | undefined

    // Process image with sharp if not SVG
    if (file.type !== 'image/svg+xml') {
      const processed = await sharp(buffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer()

      const metadata = await sharp(processed).metadata()
      width = metadata.width
      height = metadata.height

      const webpName = fileName.replace(ext, '.webp')
      await writeFile(path.join(UPLOAD_DIR, webpName), processed)

      const url = `/uploads/${webpName}`
      const mediaFile = await db.mediaFile.create({
        data: {
          filename: webpName,
          originalName: file.name,
          url,
          mimeType: 'image/webp',
          size: processed.length,
          width,
          height,
        },
      })

      return NextResponse.json({ url, id: mediaFile.id, width, height })
    }

    // SVG: save as-is
    await writeFile(filePath, buffer)
    const url = `/uploads/${fileName}`

    const mediaFile = await db.mediaFile.create({
      data: { filename: fileName, originalName: file.name, url, mimeType: file.type, size: file.size },
    })

    return NextResponse.json({ url, id: mediaFile.id })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')
    const skip = (page - 1) * limit

    const [files, total] = await Promise.all([
      db.mediaFile.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.mediaFile.count(),
    ])

    return NextResponse.json({ files, total })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
