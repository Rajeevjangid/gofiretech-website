'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2, Save, Globe, Phone, Mail, MapPin,
  Facebook, Twitter, Instagram, Linkedin, Youtube,
  Lock,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Settings keys managed on this page ────────────────────────────────────────
const GENERAL_KEYS = [
  { key: 'site_name',        label: 'Site Name',          placeholder: 'GoFire Tech', icon: Globe },
  { key: 'site_tagline',     label: 'Site Tagline',       placeholder: 'Learn. Grow. Succeed.', icon: Globe },
  { key: 'contact_email',    label: 'Contact Email',      placeholder: 'info@gofiretech.com', icon: Mail },
  { key: 'contact_phone',    label: 'Contact Phone',      placeholder: '+91 98765 43210', icon: Phone },
  { key: 'contact_whatsapp', label: 'WhatsApp Number',    placeholder: '+91 98765 43210', icon: Phone },
  { key: 'contact_address',  label: 'Office Address',     placeholder: 'Mumbai, Maharashtra, India', icon: MapPin },
]

const SOCIAL_KEYS = [
  { key: 'social_instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/gofiretech', icon: Instagram },
  { key: 'social_linkedin',  label: 'LinkedIn URL',  placeholder: 'https://linkedin.com/company/gofiretech', icon: Linkedin },
  { key: 'social_youtube',   label: 'YouTube URL',   placeholder: 'https://youtube.com/@gofiretech', icon: Youtube },
  { key: 'social_twitter',   label: 'Twitter / X URL', placeholder: 'https://twitter.com/gofiretech', icon: Twitter },
  { key: 'social_facebook',  label: 'Facebook URL',  placeholder: 'https://facebook.com/gofiretech', icon: Facebook },
]

const ALL_KEYS = [...GENERAL_KEYS, ...SOCIAL_KEYS].map(k => k.key)

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const [values,  setValues]  = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  // ── Load ───────────────────────────────────────────────────────────────────
  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/settings')
      const data = await res.json()
      if (res.ok) {
        const map: Record<string, string> = {}
        if (Array.isArray(data)) {
          data.forEach((row: { key: string; value: string }) => { map[row.key] = row.value })
        }
        setValues(map)
      } else {
        toast.error('Failed to load settings')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadSettings() }, [loadSettings])

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (res.ok) {
        toast.success('Settings saved!')
      } else {
        const d = await res.json()
        toast.error(d.error || 'Save failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const set = (key: string, value: string) =>
    setValues(prev => ({ ...prev, [key]: value }))

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="page-transition space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage site-wide configuration, contact details and social links.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#E8001C,#c50018)', boxShadow: '0 2px 8px rgba(232,0,28,0.30)' }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* General Info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6"
      >
        <h2 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" /> General Information
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {GENERAL_KEYS.map(({ key, label, placeholder, icon: Icon }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </span>
              </label>
              <input
                type={key.includes('email') ? 'email' : 'text'}
                value={values[key] || ''}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Social Links */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card rounded-2xl p-6"
      >
        <h2 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" /> Social Links
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {SOCIAL_KEYS.map(({ key, label, placeholder, icon: Icon }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </span>
              </label>
              <input
                type="url"
                value={values[key] || ''}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* SMTP note */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.10 }}
        className="glass-card rounded-2xl p-6"
      >
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-yellow-400" /> SMTP / Email Configuration
        </h2>
        <p className="text-sm text-muted-foreground mb-3">
          Email credentials are managed via environment variables for security.
          Edit your <code className="text-foreground bg-secondary px-1.5 py-0.5 rounded text-xs">.env</code> file
          to configure SMTP settings.
        </p>
        <div className="rounded-xl bg-secondary border border-border p-4 font-mono text-xs text-muted-foreground space-y-1">
          <p>SMTP_HOST=smtp.gmail.com</p>
          <p>SMTP_PORT=587</p>
          <p>SMTP_USER=your@email.com</p>
          <p>SMTP_PASS=your_app_password</p>
          <p>SMTP_FROM=&quot;GoFire Tech &lt;noreply@gofiretech.com&gt;&quot;</p>
          <p>CONTACT_EMAIL=admin@gofiretech.com</p>
        </div>
      </motion.div>
    </div>
  )
}
