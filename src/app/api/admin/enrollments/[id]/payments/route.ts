import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateReceiptNumber } from '@/lib/fees'
import { z } from 'zod'

const schema = z.object({
  amount: z.number().positive().max(99999999),
  paidAt: z.string().optional(),
  method: z.enum(['CASH', 'UPI', 'BANK_TRANSFER', 'CARD', 'CHEQUE', 'OTHER']).default('CASH'),
  reference: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
})

// Record a payment/installment (creates the receipt number).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  const d = parsed.data

  const fr = await db.feeRecord.findUnique({ where: { enrollmentId: params.id }, include: { payments: true } })
  if (!fr) return NextResponse.json({ error: 'Set the fee for this enrollment first' }, { status: 400 })

  const payable = Number(fr.totalFee) - Number(fr.discount)
  const paid = fr.payments.reduce((s, p) => s + Number(p.amount), 0)
  const pending = Math.round((payable - paid) * 100) / 100
  if (d.amount > pending) {
    return NextResponse.json({ error: `Amount exceeds pending balance (${pending})` }, { status: 400 })
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const payment = await db.payment.create({
        data: {
          feeRecordId: fr.id,
          receiptNumber: await generateReceiptNumber(),
          amount: d.amount,
          paidAt: d.paidAt ? new Date(d.paidAt) : new Date(),
          method: d.method,
          reference: d.reference || null,
          notes: d.notes || null,
          recordedBy: session.user.email ?? session.user.id ?? null,
        },
      })
      return NextResponse.json({ ...payment, amount: Number(payment.amount) }, { status: 201 })
    } catch (e: any) {
      if (e?.code !== 'P2002') throw e // retry only on receipt-number collision
    }
  }
  return NextResponse.json({ error: 'Could not allocate receipt number' }, { status: 500 })
}
