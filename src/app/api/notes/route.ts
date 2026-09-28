import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { slugify } from '@/lib/utils'

// ── Public + Admin GET ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const all      = searchParams.get('all')       // admin: include unpublished
    const featured = searchParams.get('featured')
    const subject  = searchParams.get('subject')
    const page     = parseInt(searchParams.get('page')  || '1')
    const limit    = parseInt(searchParams.get('limit') || '12')
    const skip     = (page - 1) * limit

    // Admin requests require auth
    if (all) {
      const session = await auth()
      if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const where: Record<string, unknown> = {}
    if (!all)              where.isPublished = true
    if (featured === 'true') where.isFeatured = true
    if (subject)           where.subject     = subject

    const [notes, total] = await Promise.all([
      db.note.findMany({
        where,
        orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        // ⚠️ SECURITY: never send fullContent in list view
        select: {
          id: true, title: true, slug: true, description: true,
          thumbnail: true, price: true, originalPrice: true, isFree: true,
          subject: true, category: true, tags: true,
          isPublished: true, isFeatured: true, order: true,
          pageCount: true, previewPages: true,
          metaTitle: true, metaDescription: true,
          createdAt: true, updatedAt: true,
        },
      }),
      db.note.count({ where }),
    ])

    return NextResponse.json({ notes, total, page, limit })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── Admin POST — create note ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { title, ...rest } = body

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const baseSlug = slugify(title)
    const existing = await db.note.findUnique({ where: { slug: baseSlug } })
    const slug     = existing ? `${baseSlug}-${Date.now()}` : baseSlug

    const note = await db.note.create({
      data: {
        title,
        slug,
        price:         rest.price         ? parseFloat(rest.price)         : null,
        originalPrice: rest.originalPrice ? parseFloat(rest.originalPrice) : null,
        description:   rest.description   || null,
        thumbnail:     rest.thumbnail     || null,
        isFree:        Boolean(rest.isFree),
        subject:       rest.subject       || null,
        category:      rest.category      || null,
        tags:          rest.tags          || null,
        previewContent: rest.previewContent || null,
        fullContent:   rest.fullContent   || null,
        isPublished:   Boolean(rest.isPublished),
        isFeatured:    Boolean(rest.isFeatured),
        order:         rest.order         ?? 0,
        pageCount:     rest.pageCount     ?? null,
        previewPages:  rest.previewPages  ?? 2,
        metaTitle:     rest.metaTitle     || null,
        metaDescription: rest.metaDescription || null,
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (err) {
    console.error('[notes POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
