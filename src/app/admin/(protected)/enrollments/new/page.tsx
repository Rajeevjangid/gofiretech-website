'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewEnrollmentPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<Array<{ id: string; name: string; email: string; enrollmentId: string }>>([])
  const [batches, setBatches] = useState<Array<{ id: string; name: string; course: { title: string } }>>([])
  const [form, setForm] = useState({ studentId: sp.get('studentId') || '', batchId: sp.get('batchId') || '', type: 'OFFLINE', status: 'ACTIVE', amountPaid: '', validUntil: '', adminNotes: '' })

  useEffect(() => {
    fetch('/api/admin/students?limit=200').then(r => r.json()).then(d => setStudents(d.students || [])).catch(console.error)
    fetch('/api/admin/batches').then(r => r.json()).then(d => setBatches(Array.isArray(d) ? d : [])).catch(console.error)
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/enrollments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amountPaid: form.amountPaid ? parseFloat(form.amountPaid) : undefined, validUntil: form.validUntil || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed'); return }
      toast.success('Enrollment created!')
      router.push('/admin/enrollments')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-xl">
      <Link href="/admin/enrollments" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"><ArrowLeft className="w-4 h-4" /> Back</Link>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h1 className="text-xl font-bold text-foreground mb-6">Create Enrollment</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Student *</label>
            <select required value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} className="input-field w-full">
              <option value="">Select student...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.enrollmentId})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Batch *</label>
            <select required value={form.batchId} onChange={e => setForm(f => ({ ...f, batchId: e.target.value }))} className="input-field w-full">
              <option value="">Select batch...</option>
              {batches.map(b => <option key={b.id} value={b.id}>{(b as any).course?.title} \u2014 {b.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground mb-1.5">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field w-full">
                <option value="OFFLINE">OFFLINE</option><option value="ONLINE">ONLINE</option>
              </select></div>
            <div><label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field w-full">
                <option value="ACTIVE">ACTIVE</option><option value="PENDING">PENDING</option><option value="SUSPENDED">SUSPENDED</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground mb-1.5">Amount Paid (\u20b9)</label>
              <input type="number" value={form.amountPaid} onChange={e => setForm(f => ({ ...f, amountPaid: e.target.value }))} className="input-field w-full" placeholder="0" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1.5">Valid Until</label>
              <input type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} className="input-field w-full" /></div>
          </div>
          <div><label className="block text-sm font-medium text-foreground mb-1.5">Admin Notes</label>
            <textarea rows={2} value={form.adminNotes} onChange={e => setForm(f => ({ ...f, adminNotes: e.target.value }))} className="input-field w-full" placeholder="Internal notes..." /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Enrollment'}
          </button>
        </form>
      </div>
    </div>
  )
}
