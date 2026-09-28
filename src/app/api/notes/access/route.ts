/**
 * /api/notes/access
 *
 * POST — Initiate a purchase / create a PENDING NoteAccess record.
 *         Returns the order details. Connect your payment gateway here.
 *
 * GET  — Check if a buyer email has ACTIVE access to a note.
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ── GET ?noteId=xxx&email=yyy — check access ──────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const noteId     = searchParams.get('noteId')
    const buyerEmail = searchParams.get('email')?.toLowerCase().trim()

    if (!noteId || !buyerEmail) {
      return NextResponse.json({ hasAccess: false, error: 'noteId and email required' }, { status: 400 })
    }

    // Check if the note is free
    const note = await db.note.findUnique({
      where: { id: noteId },
      select: { isFree: true, isPublished: true },
    })
    if (!note || !note.isPublished) {
      return NextResponse.json({ hasAccess: false })
    }
    if (note.isFree) {
      return NextResponse.json({ hasAccess: true, reason: 'free' })
    }

    const access = await db.noteAccess.findUnique({
      where: { noteId_buyerEmail: { noteId, buyerEmail } },
      select: { status: true, paymentId: true, createdAt: true },
    })

    return NextResponse.json({
      hasAccess: access?.status === 'ACTIVE',
      status:    access?.status ?? null,
    })
  } catch (err) {
    console.error('[notes/access GET]', err)
    return NextResponse.json({ hasAccess: false, error: 'Internal server error' }, { status: 500 })
  }
}

// ── POST — create a PENDING purchase record ───────────────────────────────────
// Body: { noteId, buyerEmail, buyerName? }
// Returns: { accessId, note: { title, price }, paymentGatewayReady: false }
// When a real payment gateway is configured:
//   1. Create a gateway order here (Razorpay / Stripe / etc.)
//   2. Return the gateway order ID / payment link to the client
//   3. On webhook confirmation, PATCH /api/notes/access/[id] to set status=ACTIVE
export async function POST(req: NextRequest) {
  try {
    const { noteId, buyerEmail, buyerName } = await req.json()

    if (!noteId || !buyerEmail) {
      return NextResponse.json({ error: 'noteId and buyerEmail are required' }, { status: 400 })
    }

    const email = buyerEmail.toLowerCase().trim()

    const note = await db.note.findUnique({
      where: { id: noteId, isPublished: true },
      select: { id: true, title: true, price: true, isFree: true },
    })
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    if (note.isFree) return NextResponse.json({ error: 'This note is free' }, { status: 400 })

    // Upsert so re-submitting the form doesn't create duplicates
    const access = await db.noteAccess.upsert({
      where: { noteId_buyerEmail: { noteId, buyerEmail: email } },
      create: {
        noteId,
        buyerEmail:  email,
        buyerName:   buyerName || null,
        amountPaid:  note.price,
        status:      'PENDING',
      },
      update: {
        buyerName:  buyerName || undefined,
        // Don't downgrade an ACTIVE access back to PENDING
      },
    })

    return NextResponse.json({
      accessId:            access.id,
      status:              access.status,
      note:                { title: note.title, price: note.price },
      paymentGatewayReady: false,
      message:
        'Purchase record created. Connect a payment gateway (Razorpay / Stripe) to complete checkout.',
    }, { status: 201 })
  } catch (err) {
    console.error('[notes/access POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
