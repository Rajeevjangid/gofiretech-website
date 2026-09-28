'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewBatchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([])
  const [form, setForm] = useState({ courseId: '', name: '', description: '', startDate: '', endDate: '', maxStudents: '', price: '', isActive: true, isPublished: false })

  useEffect(() => {
    fetch('/api/courses?limit=100').then(r => r.json()).then(d => setCourses(d.courses || [])).catch(console.error)
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/batches', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, maxStudents: form.maxStudents ? parseInt(form.maxStudents) : undefined, price: form.price ? parseFloat(form.price) : undefined }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to create batch'); return }
      toast.success('Batch created!')
      router.push(`/admin/batches/${data.id}`)
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-xl">
      <Link href="/admin/batches" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Batches</Link>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h1 className="text-xl font-bold text-foreground mb-6">Create New Batch</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Course *</label>
            <select required value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))} className="input-field w-full">
              <option value="">Select a course...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Batch Name *</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field w-full" placeholder="e.g. Cybersecurity \u2014 Sep 2026" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground mb-1.5">Start Date</label><input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input-field w-full" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1.5">End Date</label><input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="input-field w-full" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground mb-1.5">Max Students</label><input type="number" value={form.maxStudents} onChange={e => setForm(f => ({ ...f, maxStudents: e.target.value }))} className="input-field w-full" placeholder="Unlimited" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1.5">Price (\u20b9)</label><input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="input-field w-full" placeholder="0" /></div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded" /> Active
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
              <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="rounded" /> Published
            </label>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Batch'}
          </button>
        </form>
      </div>
    </div>
  )
}
