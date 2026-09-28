/**
 * POST /api/notes/demo-checkout/confirm
 *
 * Confirms or fails a demo payment session.
 * ─────────────────────────────────────────────────────────────────────────────
 * ARCHITECTURE NOTE (gateway-ready):
 *   For Razorpay: replace this with a webhook route that verifies the
 *     razorpay_payment_id + razorpay_signature, then sets ACTIVE.
 *   For Stripe: replace with webhook handler verifying payment_intent.succeeded.
 *   The NoteAccess update logic (lines below) remains identical.
 *
 * Security guarantees:
 *   - Client cannot set its own status to ACTIVE — this server route does it
 *   - We verify the orderId matches what we stored (prevents replay/forgery)
 *   - fullContent is only returned after DB confirms ACTIVE status
 *   - The gateway='demo' guard prevents this route from activating real gateway orders
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { orderId, buyerEmail, success } = await req.json()

    if (!orderId || !buyerEmail) {
      return NextResponse.json(
        { error: 'orderId and buyerEmail are required' },
        { status: 400 }
      )
    }

    const email = buyerEmail.toLowerCase().trim()

    // ── Find the access record by email + orderId ──────────────────────────
    const access = await db.noteAccess.findFirst({
      where: {
        buyerEmail: email,
        paymentId:  orderId,
        gateway:    'demo',           // guard: only demo orders handled here
      },
      include: {
        note: {
          select: {
            id: true, title: true, slug: true,
            isPublished: true, price: true,
          },
        },
      },
    })

    if (!access) {
      return NextResponse.json(
        { error: 'Order not found. Please start a new checkout.' },
        { status: 404 }
      )
    }

    if (access.status === 'ACTIVE') {
      // Idempotent — already paid, return full content
      const full = await db.note.findUnique({
        where: { id: access.noteId },
        select: { fullContent: true },
      })
      return NextResponse.json({
        status: 'ACTIVE',
        message: 'Already purchased',
        fullContent: full?.fullContent ?? null,
        noteSlug: access.note.slug,
      })
    }

    // ── Simulate failed payment ─────────────────────────────────────────────
    if (!success) {
      // Do NOT change status — leave as PENDING so user can retry
      return NextResponse.json({
        status: 'FAILED',
        message: 'Demo payment failed. Your order was not charged. Please try again.',
      })
    }

    // ── Confirm payment → set ACTIVE ────────────────────────────────────────
    const demoPaymentId = `DEMOPAY_${Date.now().toString(36).toUpperCase()}`

    await db.noteAccess.update({
      where: { id: access.id },
      data: {
        status:    'ACTIVE',
        paymentId: demoPaymentId,    // replace orderId with "payment" ID
        paidAt:    new Date(),
      },
    })

    // Fetch and return full content now that access is confirmed
    const full = await db.note.findUnique({
      where: { id: access.noteId },
      select: { fullContent: true },
    })

    return NextResponse.json({
      status:     'ACTIVE',
      message:    'Demo payment successful! Full content unlocked.',
      paymentId:  demoPaymentId,
      paidAt:     new Date().toISOString(),
      fullContent: full?.fullContent ?? null,
      noteSlug:   access.note.slug,
      amount:     access.amountPaid ? Number(access.amountPaid) : 0,
      currency:   access.currency,
      isDemoPayment: true,
    })
  } catch (err) {
    console.error('[demo-checkout/confirm POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
