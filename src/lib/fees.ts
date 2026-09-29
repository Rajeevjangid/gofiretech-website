import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export type FeeStatus = 'PAID' | 'PARTIALLY_PAID' | 'PENDING' | 'OVERDUE'

type FeeRecordWithPayments = {
  id: string
  totalFee: Prisma.Decimal | number
  discount: Prisma.Decimal | number
  dueDate: Date | null
  notes: string | null
  payments: Array<{
    id: string; receiptNumber: string; amount: Prisma.Decimal | number; paidAt: Date
    method: string; reference: string | null; notes: string | null
  }>
}

const round2 = (n: number) => Math.round(n * 100) / 100

/** Single source of truth for fee math + status. */
export function summarizeFee(fr: FeeRecordWithPayments) {
  const totalFee = Number(fr.totalFee)
  const discount = Number(fr.discount)
  const payable = round2(Math.max(totalFee - discount, 0))
  const paid = round2(fr.payments.reduce((s, p) => s + Number(p.amount), 0))
  const pending = round2(Math.max(payable - paid, 0))
  let status: FeeStatus = 'PENDING'
  if (pending === 0 && payable > 0) status = 'PAID'
  else if (pending > 0 && fr.dueDate && fr.dueDate < new Date()) status = 'OVERDUE'
  else if (paid > 0) status = 'PARTIALLY_PAID'
  return {
    id: fr.id,
    totalFee, discount, payable, paid, pending, status,
    dueDate: fr.dueDate, notes: fr.notes,
    payments: fr.payments
      .map(p => ({
        id: p.id, receiptNumber: p.receiptNumber, amount: Number(p.amount), paidAt: p.paidAt,
        method: p.method, reference: p.reference, notes: p.notes,
      }))
      .sort((a, b) => +new Date(b.paidAt) - +new Date(a.paidAt)),
  }
}

export async function generateReceiptNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await db.payment.count({
    where: { createdAt: { gte: new Date(`${year}-01-01T00:00:00.000Z`), lt: new Date(`${year + 1}-01-01T00:00:00.000Z`) } },
  })
  return `RCT-${year}-${String(count + 1).padStart(5, '0')}`
}

const enrollmentFeeInclude = {
  batch: { select: { id: true, name: true, startDate: true, endDate: true, course: { select: { title: true } } } },
  feeRecord: { include: { payments: true } },
} satisfies Prisma.EnrollmentInclude

/** Fee overview per enrollment for ONE student (caller must have authorized studentId). */
export async function getStudentFees(studentId: string) {
  const enrollments = await db.enrollment.findMany({
    where: { studentId },
    include: enrollmentFeeInclude,
    orderBy: { enrolledAt: 'desc' },
  })
  return enrollments.map(e => ({
    enrollmentId: e.id,
    status: e.status,
    type: e.type,
    enrolledAt: e.enrolledAt,
    validUntil: e.validUntil,
    batch: {
      id: e.batch.id, name: e.batch.name, startDate: e.batch.startDate, endDate: e.batch.endDate,
      courseTitle: e.batch.course.title,
    },
    fee: e.feeRecord ? summarizeFee(e.feeRecord) : null,
  }))
}
