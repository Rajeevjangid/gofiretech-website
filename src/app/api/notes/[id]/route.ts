import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

type Ctx = { params: { id: string } }

// ── GET a single note ─────────────────────────────────────────────────────────
// Public: returns only previewContent (never fullContent)
// Admin (?admin=true + session): returns everything
// Buyer (?email=xxx): checks NoteAccess → if ACTIVE, returns fullContent
export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const { searchParams } = new URL(req.url)
    const adminMode  = searchParams.get('admin') === 'true'
    const buyerEmail = searchParams.get('email')?.toLowerCase().trim()

    // ── Admin mode ────────────────────────────────────────────────
    if (adminMode) {
      const session = await auth()
      if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const note = await db.note.findFirst({
        where: { OR: [{ id: params.id }, { slug: params.id }] },
      })
      if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })
      return NextResponse.json(note)
    }

    // ── Public / buyer mode ───────────────────────────────────────
    const note = await db.note.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }], isPublished: true },
      select: {
        id: true, title: true, slug: true, description: true,
        thumbnail: true, price: true, originalPrice: true, isFree: true,
        subject: true, category: true, tags: true,
        previewContent: true,         // always returned
        // fullContent deliberately excluded here
        isPublished: true, pageCount: true, previewPages: true,
        metaTitle: true, metaDescription: true,
        createdAt: true, updatedAt: true,
      },
    })
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

    // Check if buyer has ACTIVE access
    let hasAccess = note.isFree
    if (!hasAccess && buyerEmail) {
      const access = await db.noteAccess.findUnique({
        where: { noteId_buyerEmail: { noteId: note.id, buyerEmail } },
      })
      hasAccess = access?.status === 'ACTIVE'
    }

    if (hasAccess) {
      // Fetch and attach fullContent only for verified buyers
      const full = await db.note.findUnique({
        where: { id: note.id },
        select: { fullContent: true },
      })
      return NextResponse.json({ ...note, fullContent: full?.fullContent, hasAccess: true })
    }

    return NextResponse.json({ ...note, fullContent: null, hasAccess: false })
  } catch (err) {
    console.error('[notes/[id] GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── PATCH — update a note (admin only) ───────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { price, originalPrice, isPublished, previewPages, pageCount, ...rest } = body

    const data: Record<string, unknown> = { ...rest }
    if (price         !== undefined) data.price         = price ? parseFloat(price) : null
    if (originalPrice !== undefined) data.originalPrice = originalPrice ? parseFloat(originalPrice) : null
    if (isPublished   !== undefined) data.isPublished   = isPublished
    if (previewPages  !== undefined) data.previewPages  = parseInt(String(previewPages), 10) || 2
    if (pageCount     !== undefined) data.pageCount     = pageCount ? parseInt(String(pageCount), 10) : null

    const note = await db.note.update({ where: { id: params.id }, data })
    return NextResponse.json(note)
  } catch (err) {
    console.error('[notes/[id] PATCH]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── PUT — full replace (admin only) ──────────────────────────────────────────
export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { title, price, originalPrice, ...rest } = body

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const note = await db.note.update({
      where: { id: params.id },
      data: {
        title,
        price:          price         ? parseFloat(price)         : null,
        originalPrice:  originalPrice ? parseFloat(originalPrice) : null,
        description:    rest.description    ?? null,
        thumbnail:      rest.thumbnail      ?? null,
        isFree:         Boolean(rest.isFree),
        subject:        rest.subject        ?? null,
        category:       rest.category       ?? null,
        tags:           rest.tags           ?? null,
        previewContent: rest.previewContent ?? null,
        fullContent:    rest.fullContent    ?? null,
        isPublished:    Boolean(rest.isPublished),
        isFeatured:     Boolean(rest.isFeatured),
        order:          rest.order          ?? 0,
        pageCount:      rest.pageCount      ?? null,
        previewPages:   rest.previewPages   ?? 2,
        metaTitle:      rest.metaTitle      ?? null,
        metaDescription: rest.metaDescription ?? null,
      },
    })

    return NextResponse.json(note)
  } catch (err) {
    console.error('[notes/[id] PUT]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── DELETE (admin only) ───────────────────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await db.note.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[notes/[id] DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
