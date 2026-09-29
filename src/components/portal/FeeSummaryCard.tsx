import Link from 'next/link'
import type { getStudentFees } from '@/lib/fees'

type Row = Awaited<ReturnType<typeof getStudentFees>>[number]

export const inr = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
export const feeStatusStyle: Record<string, string> = {
  PAID: 'bg-green-500/10 text-green-500',
  PARTIALLY_PAID: 'bg-blue-500/10 text-blue-500',
  PENDING: 'bg-yellow-500/10 text-yellow-600',
  OVERDUE: 'bg-red-500/10 text-red-500',
}
const label = (s: string) => s.replace('_', ' ')

export default function FeeSummaryCard({ row, detailed = false }: { row: Row; detailed?: boolean }) {
  const fee = row.fee
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground text-sm">{row.batch.courseTitle}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{row.batch.name}</p>
        </div>
        {fee && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${feeStatusStyle[fee.status]}`}>{label(fee.status)}</span>}
      </div>

      {!fee ? (
        <p className="text-sm text-muted-foreground mt-4">Fee details have not been set yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div><p className="text-xs text-muted-foreground">Payable</p><p className="font-bold text-foreground text-sm">{inr(fee.payable)}</p></div>
            <div><p className="text-xs text-muted-foreground">Paid</p><p className="font-bold text-green-500 text-sm">{inr(fee.paid)}</p></div>
            <div><p className="text-xs text-muted-foreground">Pending</p><p className="font-bold text-foreground text-sm">{inr(fee.pending)}</p></div>
          </div>
          {fee.pending > 0 && fee.dueDate && (
            <p className="text-xs text-muted-foreground mt-3">Due by {new Date(fee.dueDate).toLocaleDateString('en-IN')}</p>
          )}
          {detailed && fee.discount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">Total fee {inr(fee.totalFee)} − discount {inr(fee.discount)}</p>
          )}
          {detailed && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="text-xs font-semibold text-foreground mb-2">Payment history</p>
              {fee.payments.length === 0 ? (
                <p className="text-xs text-muted-foreground">No payments recorded yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {fee.payments.map(p => (
                    <div key={p.id} className="py-2 flex items-center justify-between gap-3 text-sm">
                      <div>
                        <p className="font-medium text-foreground">{inr(p.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(p.paidAt).toLocaleDateString('en-IN')} · {p.method.replace('_', ' ')}
                          {p.reference ? ` · ${p.reference}` : ''}
                        </p>
                      </div>
                      <Link href={`/receipt/${p.id}`} className="text-xs text-primary font-medium whitespace-nowrap">
                        {p.receiptNumber} ↗
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
