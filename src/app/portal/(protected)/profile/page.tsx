'use client'
import { useEffect, useState } from 'react'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PortalProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPass, setChangingPass] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [info, setInfo] = useState<{ email?: string; enrollmentId?: string; customFields: Array<{ id: string; label: string; value: string }> }>({ customFields: [] })
  const [batches, setBatches] = useState<Array<{ enrollmentId: string; status: string; validUntil?: string | null; batch: { name: string; courseTitle: string; startDate?: string | null; endDate?: string | null } }>>([])

  useEffect(() => {
    fetch('/api/portal/me').then(r => r.json())
      .then(d => {
        setForm({ name: d.name || '', phone: d.phone || '' })
        setInfo({ email: d.email, enrollmentId: d.enrollmentId, customFields: d.customFields || [] })
      })
      .finally(() => setLoading(false))
    fetch('/api/portal/fees').then(r => r.ok ? r.json() : []).then(setBatches).catch(() => {})
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    const res = await fetch('/api/portal/me', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    if (res.ok) { toast.success('Profile updated') } else { toast.error('Failed to update') }
    setSaving(false)
  }

  const changePassword = async () => {
    if (passForm.newPass !== passForm.confirm) { toast.error('Passwords do not match'); return }
    if (passForm.newPass.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setChangingPass(true)
    const res = await fetch('/api/portal/auth/change-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: passForm.current, newPassword: passForm.newPass }),
    })
    const d = await res.json()
    if (res.ok) { toast.success('Password changed!'); setPassForm({ current: '', newPass: '', confirm: '' }) }
    else toast.error(d.error || 'Failed')
    setChangingPass(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-extrabold text-foreground">My Profile</h1>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
        <h2 className="font-semibold text-foreground">Account &amp; Batch</h2>
        <dl className="text-sm space-y-2">
          <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Email</dt><dd className="text-foreground">{info.email}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Enrollment ID</dt><dd className="font-mono text-primary">{info.enrollmentId}</dd></div>
          {info.customFields.map(f => (
            <div key={f.id} className="flex justify-between gap-4"><dt className="text-muted-foreground">{f.label}</dt><dd className="text-foreground text-right">{f.value}</dd></div>
          ))}
        </dl>
        {batches.length > 0 && (
          <div className="border-t border-border pt-3 space-y-3">
            {batches.map(b => (
              <div key={b.enrollmentId} className="text-sm">
                <p className="font-medium text-foreground">{b.batch.courseTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {b.batch.name} · {b.status}
                  {b.batch.startDate ? ` · Starts ${new Date(b.batch.startDate).toLocaleDateString('en-IN')}` : ''}
                  {b.batch.endDate ? ` · Ends ${new Date(b.batch.endDate).toLocaleDateString('en-IN')}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Personal Information</h2>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field w-full" />
        </div>
        <button onClick={saveProfile} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Change Password</h2>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Current Password</label>
          <input type="password" value={passForm.current}
            onChange={e => setPassForm(f => ({ ...f, current: e.target.value }))} className="input-field w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} value={passForm.newPass}
              onChange={e => setPassForm(f => ({ ...f, newPass: e.target.value }))} className="input-field w-full pr-10" />
            <button type="button" onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Confirm New Password</label>
          <input type="password" value={passForm.confirm}
            onChange={e => setPassForm(f => ({ ...f, confirm: e.target.value }))} className="input-field w-full" />
        </div>
        <button onClick={changePassword} disabled={changingPass} className="btn-primary flex items-center gap-2">
          {changingPass ? <><Loader2 className="w-4 h-4 animate-spin" /> Changing...</> : 'Change Password'}
        </button>
      </div>
    </div>
  )
}
