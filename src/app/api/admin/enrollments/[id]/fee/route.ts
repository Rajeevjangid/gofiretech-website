import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { summarizeFee } from '@/lib/fees'
import { z } from 'zod'

const schema = z.object({
  totalFee: z.number().min(0).max(99999999),
  discount: z.number().min(0).default(0),
  dueDate: z.string().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
})

// Create or update the fee record for an enrollment.
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  const { totalFee, discount, dueDate, notes } = parsed.data
  if (discount > totalFee) return NextResponse.json({ error: 'Discount cannot exceed total fee' }, { status: 400 })

  const enrollment = await db.enrollment.findUnique({
    where: { id: params.id },
    include: { feeRecord: { include: { payments: true } } },
  })
  if (!enrollment) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })

  const alreadyPaid = (enrollment.feeRecord?.payments ?? []).reduce((s, p) => s + Number(p.amount), 0)
  if (totalFee - discount < alreadyPaid) {
    return NextResponse.json({ error: `Payable amount cannot be less than already paid (${alreadyPaid})` }, { status: 400 })
  }

  const data = {
    totalFee, discount,
    dueDate: dueDate ? new Date(dueDate) : null,
    notes: notes || null,
  }
  const fr = await db.feeRecord.upsert({
    where: { enrollmentId: params.id },
    create: { enrollmentId: params.id, ...data },
    update: data,
    include: { payments: true },
  })
  return NextResponse.json(summarizeFee(fr))
}
