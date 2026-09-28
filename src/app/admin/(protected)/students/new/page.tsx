'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewStudentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [result, setResult] = useState<{ enrollmentId: string; temporaryPassword?: string; emailSent: boolean } | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', sendEmail: true })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, password: form.password || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to create student'); return }
      setResult({ enrollmentId: data.student.enrollmentId, temporaryPassword: data.temporaryPassword, emailSent: data.emailSent })
      toast.success('Student created!')
    } finally { setLoading(false) }
  }

  if (result) return (
    <div className="max-w-lg">
      <div className="bg-card border border-border rounded-2xl p-8 space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-xl font-bold text-foreground">Student Created</h2>
        </div>
        <div className="bg-foreground/[0.04] rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Enrollment ID</span><span className="font-mono font-bold text-primary">{result.enrollmentId}</span></div>
          {result.temporaryPassword && <div className="flex justify-between"><span className="text-muted-foreground">Temp Password</span><span className="font-mono">{result.temporaryPassword}</span></div>}
          <div className="flex justify-between"><span className="text-muted-foreground">Credentials Email</span><span className={result.emailSent ? 'text-green-500' : 'text-yellow-500'}>{result.emailSent ? 'Sent \u2713' : 'Not sent (check SMTP)'}</span></div>
        </div>
        <div className="flex gap-3 pt-2">
          <Link href="/admin/students" className="btn-ghost flex-1 text-center text-sm">Back to Students</Link>
          <Link href="/admin/enrollments/new" className="btn-primary flex-1 text-center text-sm">Enroll in Batch</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-lg">
      <Link href="/admin/students" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Students</Link>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h1 className="text-xl font-bold text-foreground mb-6">Create New Student</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field w-full" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
            <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field w-full" placeholder="john@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field w-full" placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Password <span className="text-muted-foreground font-normal">(leave blank to auto-generate)</span></label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input-field w-full pr-10" placeholder="Min 8 characters" />
              <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.sendEmail} onChange={e => setForm(f => ({ ...f, sendEmail: e.target.checked }))} className="rounded" />
            <span className="text-sm text-foreground">Send login credentials to student&apos;s email</span>
          </label>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Student'}
          </button>
        </form>
      </div>
    </div>
  )
}
