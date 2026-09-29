'use client'
import { useEffect, useState, useCallback } from 'react'
import { Loader2, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'

interface Payment { id: string; receiptNumber: string; amount: number; paidAt: string; method: string; reference: string | null }
interface Fee { totalFee: number; discount: number; payable: number; paid: number; pending: number; status: string; dueDate: string | null; notes: string | null; payments: Payment[] }
interface Row { enrollmentId: string; batch: { name: string; courseTitle: string }; fee: Fee | null }

const inr = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const METHODS = ['CASH', 'UPI', 'BANK_TRANSFER', 'CARD', 'CHEQUE', 'OTHER']
const today = () => new Date().toISOString().slice(0, 10)

function EnrollmentFees({ row, onChange }: { row: Row; onChange: () => void }) {
  const f = row.fee
  const [fee, setFee] = useState({ totalFee: String(f?.totalFee ?? ''), discount: String(f?.discount ?? 0), dueDate: f?.dueDate?.slice(0, 10) ?? '', notes: f?.notes ?? '' })
  const [pay, setPay] = useState({ amount: '', paidAt: today(), method: 'CASH', reference: '', notes: '' })
  const [busy, setBusy] = useState(false)

  const call = async (url: string, method: string, body?: unknown, ok?: string) => {
    setBusy(true)
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
    const d = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) { toast.error(typeof d.error === 'string' ? d.error : 'Failed'); return false }
    if (ok) toast.success(ok)
    onChange()
    return true
  }

  const saveFee = () => call(`/api/admin/enrollments/${row.enrollmentId}/fee`, 'PUT', {
    totalFee: Number(fee.totalFee), discount: Number(fee.discount || 0), dueDate: fee.dueDate || null, notes: fee.notes || null,
  }, 'Fee saved')

  const addPayment = async () => {
    const ok = await call(`/api/admin/enrollments/${row.enrollmentId}/payments`, 'POST', {
      amount: Number(pay.amount), paidAt: pay.paidAt, method: pay.method, reference: pay.reference || null, notes: pay.notes || null,
    }, 'Payment recorded')
    if (ok) setPay({ amount: '', paidAt: today(), method: 'CASH', reference: '', notes: '' })
  }

  return (
    <div className="px-6 py-5 space-y-4">
      <div>
        <p className="font-medium text-foreground text-sm">{row.batch.courseTitle}</p>
        <p className="text-xs text-muted-foreground">{row.batch.name}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <input type="number" min="0" placeholder="Total fee" value={fee.totalFee} onChange={e => setFee(x => ({ ...x, totalFee: e.target.value }))} className="input-field" />
        <input type="number" min="0" placeholder="Discount" value={fee.discount} onChange={e => setFee(x => ({ ...x, discount: e.target.value }))} className="input-field" />
        <input type="date" value={fee.dueDate} onChange={e => setFee(x => ({ ...x, dueDate: e.target.value }))} className="input-field" title="Due date" />
        <button onClick={saveFee} disabled={busy || fee.totalFee === ''} className="btn-primary text-sm">{f ? 'Update Fee' : 'Set Fee'}</button>
      </div>
      <input placeholder="Fee notes (optional)" value={fee.notes} onChange={e => setFee(x => ({ ...x, notes: e.target.value }))} className="input-field w-full" />

      {f && (
        <>
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            <div><p className="text-xs text-muted-foreground">Payable</p><p className="font-bold">{inr(f.payable)}</p></div>
            <div><p className="text-xs text-muted-foreground">Paid</p><p className="font-bold text-green-500">{inr(f.paid)}</p></div>
            <div><p className="text-xs text-muted-foreground">Pending</p><p className="font-bold">{inr(f.pending)}</p></div>
            <div><p className="text-xs text-muted-foreground">Status</p><p className="font-bold text-xs mt-1">{f.status.replace('_', ' ')}</p></div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs font-semibold text-foreground mb-2">Record payment / installment</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <input type="number" min="0" placeholder="Amount" value={pay.amount} onChange={e => setPay(x => ({ ...x, amount: e.target.value }))} className="input-field" />
              <input type="date" value={pay.paidAt} onChange={e => setPay(x => ({ ...x, paidAt: e.target.value }))} className="input-field" />
              <select value={pay.method} onChange={e => setPay(x => ({ ...x, method: e.target.value }))} className="input-field">
                {METHODS.map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
              </select>
              <input placeholder="Reference / Txn ID" value={pay.reference} onChange={e => setPay(x => ({ ...x, reference: e.target.value }))} className="input-field" />
            </div>
            <button onClick={addPayment} disabled={busy || !pay.amount || f.pending <= 0} className="btn-primary text-sm mt-2">Record Payment</button>
          </div>

          {f.payments.length > 0 && (
            <div className="divide-y divide-border border border-border rounded-xl">
              {f.payments.map(p => (
                <div key={p.id} className="px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium">{inr(p.amount)} <span className="text-xs text-muted-foreground font-normal">· {new Date(p.paidAt).toLocaleDateString('en-IN')} · {p.method.replace('_', ' ')}{p.reference ? ` · ${p.reference}` : ''}</span></p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <a href={`/receipt/${p.id}`} target="_blank" rel="noopener noreferrer" className="text-primary font-medium">{p.receiptNumber} ↗</a>
                    <button onClick={() => confirm('Delete this payment and its receipt?') && call(`/api/admin/payments/${p.id}`, 'DELETE', undefined, 'Payment deleted')} className="text-red-500">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function FeesSection({ studentId }: { studentId: string }) {
  const [rows, setRows] = useState<Row[] | null>(null)
  const load = useCallback(() => {
    fetch(`/api/admin/students/${studentId}/fees`).then(r => r.json()).then(setRows).catch(() => setRows([]))
  }, [studentId])
  useEffect(() => { load() }, [load])

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="font-semibold text-foreground flex items-center gap-2"><Wallet className="w-4 h-4" /> Fees &amp; Payments</h2>
      </div>
      {rows === null ? <div className="p-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        : rows.length === 0 ? <div className="text-center py-8 text-muted-foreground text-sm">Enroll the student in a batch to manage fees.</div>
        : <div className="divide-y divide-border">{rows.map(r => <EnrollmentFees key={r.enrollmentId + JSON.stringify(r.fee)} row={r} onChange={load} />)}</div>}
    </div>
  )
}
