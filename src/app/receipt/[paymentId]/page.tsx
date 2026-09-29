import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getStudentFromCookie } from '@/lib/student-auth'
import { summarizeFee } from '@/lib/fees'
import PrintButton from '@/components/receipt/PrintButton'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Fee Receipt — GoFire Tech', robots: { index: false, follow: false } }

const inr = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

export default async function ReceiptPage({ params }: { params: { paymentId: string } }) {
  const payment = await db.payment.findUnique({
    where: { id: params.paymentId },
    include: {
      feeRecord: {
        include: {
          payments: true,
          enrollment: {
            include: {
              student: { select: { id: true, name: true, email: true, enrollmentId: true } },
              batch: { select: { name: true, course: { select: { title: true } } } },
            },
          },
        },
      },
    },
  })
  if (!payment) notFound()

  // Authorization: admin, or the student who owns this receipt. Otherwise 404.
  const admin = await auth()
  const student = admin?.user ? null : await getStudentFromCookie()
  const owner = payment.feeRecord.enrollment.student
  if (!admin?.user && (!student || student.studentId !== owner.id)) notFound()

  const e = payment.feeRecord.enrollment
  // Balance as of this payment (payments made up to and including this one).
  const upTo = payment.feeRecord.payments.filter(p => p.paidAt <= payment.paidAt && p.createdAt <= payment.createdAt)
  const asOf = summarizeFee({ ...payment.feeRecord, payments: upTo })

  const rows: Array<[string, string]> = [
    ['Receipt No.', payment.receiptNumber],
    ['Payment Date', fmt(payment.paidAt)],
    ['Student Name', owner.name],
    ['Enrollment ID', owner.enrollmentId],
    ['Course', e.batch.course.title],
    ['Batch', e.batch.name],
    ['Payment Method', payment.method.replace('_', ' ')],
    ...(payment.notes ? [['Notes', payment.notes] as [string, string]] : []),
    ...(payment.reference ? [['Reference / Txn ID', payment.reference] as [string, string]] : []),
  ]

  return (
    <div className="min-h-screen bg-neutral-100 py-8 px-4 print:bg-white print:p-0">
      <div className="max-w-2xl mx-auto mb-4 flex justify-end print:hidden"><PrintButton /></div>
      <div className="max-w-2xl mx-auto bg-white text-neutral-900 rounded-xl shadow p-8 print:shadow-none print:rounded-none">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-light.webp" alt="GoFire Tech" className="h-11 w-auto" />
          <div className="text-right">
            <p className="text-lg font-bold">FEE RECEIPT</p>
            <p className="text-xs font-mono text-neutral-500">{payment.receiptNumber}</p>
          </div>
        </div>

        <table className="w-full text-sm mt-6">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k} className="border-b border-neutral-100">
                <td className="py-2 pr-4 text-neutral-500 w-44">{k}</td>
                <td className="py-2 font-medium">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 rounded-lg bg-neutral-50 border border-neutral-200 p-4 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-neutral-500">Total fee</span><span>{inr(asOf.totalFee)}</span></div>
          {asOf.discount > 0 && <div className="flex justify-between"><span className="text-neutral-500">Discount</span><span>−{inr(asOf.discount)}</span></div>}
          <div className="flex justify-between"><span className="text-neutral-500">Total payable</span><span>{inr(asOf.payable)}</span></div>
          <div className="flex justify-between text-base font-bold"><span>Amount paid</span><span>{inr(Number(payment.amount))}</span></div>
          <div className="flex justify-between"><span className="text-neutral-500">Total paid to date</span><span>{inr(asOf.paid)}</span></div>
          <div className="flex justify-between font-semibold"><span className="text-neutral-500">Remaining balance</span><span>{inr(asOf.pending)}</span></div>
        </div>

        <p className="mt-8 text-xs text-neutral-400">
          Recorded by {payment.recordedBy ?? 'GoFire Tech admin'}. This is a computer-generated receipt.
        </p>
      </div>
    </div>
  )
}
