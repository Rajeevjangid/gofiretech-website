/**
 * POST /api/notes/demo-checkout
 *
 * Initiates a demo payment session for a Note.
 * ─────────────────────────────────────────────────────────────────────────────
 * ARCHITECTURE NOTE (gateway-ready):
 *   When you add Razorpay / Stripe, replace this route's logic with:
 *     1. Create a gateway order (Razorpay) or PaymentIntent (Stripe)
 *     2. Return the gateway order ID + key to the client
 *     3. The confirm route becomes a webhook handler
 *
 * Security guarantees upheld here (same will apply to real gateway):
 *   - Price is ALWAYS read from the DB — never trusted from the client
 *   - NoteAccess status is set to PENDING here, never ACTIVE
 *   - Only the confirm route (server-side) may set ACTIVE
 *   - Duplicate submissions are handled via upsert (no double-charging risk)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function generateDemoOrderId(): string {
  const ts    = Date.now().toString(36).toUpperCase()
  const rand  = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `DEMO_${ts}_${rand}`
}

export async function POST(req: NextRequest) {
  try {
    const { noteId, buyerEmail, buyerName } = await req.json()

    if (!noteId || !buyerEmail) {
      return NextResponse.json(
        { error: 'noteId and buyerEmail are required' },
        { status: 400 }
      )
    }

    const email = buyerEmail.toLowerCase().trim()

    // ── Fetch note from DB — NEVER trust client price ──────────────────────
    const note = await db.note.findUnique({
      where: { id: noteId, isPublished: true },
      select: {
        id: true, title: true, slug: true,
        price: true, originalPrice: true, isFree: true,
      },
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    if (note.isFree) {
      return NextResponse.json(
        { error: 'This note is free — no payment required' },
        { status: 400 }
      )
    }

    // Check if already has ACTIVE access (idempotent)
    const existing = await db.noteAccess.findUnique({
      where: { noteId_buyerEmail: { noteId, buyerEmail: email } },
    })
    if (existing?.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'already_purchased', message: 'You already have access to this note.' },
        { status: 409 }
      )
    }

    const orderId = generateDemoOrderId()

    // Create / update to PENDING with the generated demo order ID
    const access = await db.noteAccess.upsert({
      where: { noteId_buyerEmail: { noteId, buyerEmail: email } },
      create: {
        noteId,
        buyerEmail:  email,
        buyerName:   buyerName?.trim() || null,
        paymentId:   orderId,
        gateway:     'demo',
        amountPaid:  note.price,
        currency:    'INR',
        status:      'PENDING',
      },
      update: {
        paymentId:  orderId,           // fresh order ID each attempt
        buyerName:  buyerName?.trim() || undefined,
        gateway:    'demo',
        amountPaid: note.price,
        status:     'PENDING',
        paidAt:     null,              // reset in case of retry
      },
    })

    return NextResponse.json({
      orderId,
      accessId:  access.id,
      noteTitle: note.title,
      noteSlug:  note.slug,
      amount:    note.price ? Number(note.price) : 0,
      currency:  'INR',
      isDemoPayment: true,
    })
  } catch (err) {
    console.error('[demo-checkout POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
