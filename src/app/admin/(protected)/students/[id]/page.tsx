'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, RefreshCw, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import FeesSection from '@/components/admin/student/FeesSection'
import CustomFieldsSection from '@/components/admin/student/CustomFieldsSection'
import DocumentsSection from '@/components/admin/student/DocumentsSection'

interface StudentDetail {
  id: string; enrollmentId: string; name: string; email: string; phone?: string | null
  isActive: boolean; credentialEmailSentAt?: string | null; createdAt: string
  enrollments: Array<{
    id: string; status: string; type: string; enrolledAt: string; validUntil?: string | null
    batch: { id: string; name: string; course: { title: string } }
  }>
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [resetting, setResetting] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', isActive: true })

  const fetchStudent = () => {
    setLoading(true)
    fetch(`/api/admin/students/${id}`)
      .then(r => r.json())
      .then(d => { setStudent(d); setForm({ name: d.name, phone: d.phone || '', isActive: d.isActive }) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchStudent() }, [id])

  const save = async () => {
    setSaving(true)
    const res = await fetch(`/api/admin/students/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    if (res.ok) { toast.success('Student updated'); fetchStudent() } else toast.error('Failed to update')
    setSaving(false)
  }

  const resetPassword = async () => {
    if (!confirm('Reset password and send new credentials to student email?')) return
    setResetting(true)
    const res = await fetch(`/api/admin/students/${id}/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sendEmail: true }) })
    const data = await res.json()
    if (res.ok) {
      toast.success(`Password reset! ${data.emailSent ? 'Email sent.' : 'Check SMTP config.'}`)
      if (data.newPassword) alert(`New password (save this): ${data.newPassword}`)
    } else toast.error('Failed to reset password')
    setResetting(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  if (!student) return <div className="text-muted-foreground">Student not found.</div>

  const statusColor = (s: string) => ({ ACTIVE: 'text-green-500 bg-green-500/10', SUSPENDED: 'text-red-500 bg-red-500/10', EXPIRED: 'text-orange-500 bg-orange-500/10', PENDING: 'text-yellow-500 bg-yellow-500/10' } as Record<string, string>)[s] || 'text-muted-foreground bg-foreground/5'

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/admin/students" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Students</Link>

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">{student.name}</h1>
            <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded mt-1 inline-block">{student.enrollmentId}</span>
          </div>
          <button onClick={resetPassword} disabled={resetting} className="btn-ghost flex items-center gap-2 text-sm">
            {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Reset Password
          </button>
        </div>

        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field w-full" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field w-full" /></div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-foreground">Active</label>
            <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-green-500' : 'bg-foreground/20'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground flex items-center gap-2"><BookOpen className="w-4 h-4" /> Enrollments ({student.enrollments.length})</h2>
          <Link href={`/admin/enrollments/new?studentId=${id}`} className="btn-primary text-xs px-3 py-1.5">+ Enroll in Batch</Link>
        </div>
        {student.enrollments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No enrollments yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {student.enrollments.map(e => (
              <div key={e.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground text-sm">{e.batch.course.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{e.batch.name} \u00b7 {e.type}</p>
                  {e.validUntil && <p className="text-xs text-muted-foreground">Valid until {new Date(e.validUntil).toLocaleDateString()}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(e.status)}`}>{e.status}</span>
                  <Link href={`/admin/enrollments/${e.id}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Edit</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FeesSection studentId={id} />
      <CustomFieldsSection studentId={id} />
      <DocumentsSection studentId={id} />
    </div>
  )
}
