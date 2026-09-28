'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EditEnrollmentPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [enrollment, setEnrollment] = useState<any>(null)
  const [form, setForm] = useState({ status: '', validUntil: '', amountPaid: '', adminNotes: '' })

  useEffect(() => {
    fetch(`/api/admin/enrollments/${id}`).then(r => r.json()).then(d => {
      setEnrollment(d)
      setForm({ status: d.status, validUntil: d.validUntil ? d.validUntil.slice(0, 10) : '', amountPaid: d.amountPaid || '', adminNotes: d.adminNotes || '' })
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const save = async () => {
    setSaving(true)
    const res = await fetch(`/api/admin/enrollments/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amountPaid: form.amountPaid ? parseFloat(String(form.amountPaid)) : null, validUntil: form.validUntil || null }),
    })
    if (res.ok) { toast.success('Enrollment updated'); router.push('/admin/enrollments') } else toast.error('Failed to update')
    setSaving(false)
  }

  const deleteEnrollment = async () => {
    if (!confirm('Delete this enrollment?')) return
    await fetch(`/api/admin/enrollments/${id}`, { method: 'DELETE' })
    toast.success('Enrollment deleted')
    router.push('/admin/enrollments')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>

  return (
    <div className="max-w-xl">
      <Link href="/admin/enrollments" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"><ArrowLeft className="w-4 h-4" /> Back</Link>
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h1 className="text-xl font-bold text-foreground">Edit Enrollment</h1>
        {enrollment && (
          <div className="bg-foreground/[0.04] rounded-xl p-4 text-sm space-y-1">
            <p><span className="text-muted-foreground">Student: </span><span className="text-foreground font-medium">{enrollment.student?.name} ({enrollment.student?.enrollmentId})</span></p>
            <p><span className="text-muted-foreground">Batch: </span><span className="text-foreground">{enrollment.batch?.course?.title} \u2014 {enrollment.batch?.name}</span></p>
          </div>
        )}
        <div><label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field w-full">
            <option value="ACTIVE">ACTIVE</option><option value="SUSPENDED">SUSPENDED</option><option value="EXPIRED">EXPIRED</option><option value="PENDING">PENDING</option>
          </select></div>
        <div><label className="block text-sm font-medium text-foreground mb-1.5">Valid Until</label>
          <input type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} className="input-field w-full" /></div>
        <div><label className="block text-sm font-medium text-foreground mb-1.5">Amount Paid (\u20b9)</label>
          <input type="number" value={form.amountPaid} onChange={e => setForm(f => ({ ...f, amountPaid: e.target.value }))} className="input-field w-full" /></div>
        <div><label className="block text-sm font-medium text-foreground mb-1.5">Admin Notes</label>
          <textarea rows={2} value={form.adminNotes} onChange={e => setForm(f => ({ ...f, adminNotes: e.target.value }))} className="input-field w-full" /></div>
        <div className="flex gap-3">
          <button onClick={save} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
          <button onClick={deleteEnrollment} className="btn-ghost text-red-500 hover:bg-red-500/10 px-4">Delete</button>
        </div>
      </div>
    </div>
  )
}
