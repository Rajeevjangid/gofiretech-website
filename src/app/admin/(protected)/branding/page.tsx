'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2, Save, Palette, Monitor, Globe, Smartphone,
  RefreshCw, Upload, CheckCircle2, X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MediaPicker from '@/components/admin/MediaPicker'

// ── Branding keys ────────────────────────────────────────────────────────────
const BRANDING_KEYS = [
  'branding.header_logo',
  'branding.footer_logo',
  'branding.admin_logo',
  'branding.favicon',
] as const

type BrandingKey = typeof BRANDING_KEYS[number]

const DEFAULTS: Record<BrandingKey, string> = {
  'branding.header_logo': '/logo.png',
  'branding.footer_logo': '/logo.png',
  'branding.admin_logo':  '',
  'branding.favicon':     '/favicon.ico',
}

const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
const MAX_SIZE = 5 * 1024 * 1024

// ── Save button ───────────────────────────────────────────────────────────────
function SaveBtn({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
      style={{ background: 'linear-gradient(135deg,#E8001C,#c50018)', boxShadow: '0 2px 8px rgba(232,0,28,0.25)' }}
    >
      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
      {saving ? 'Saving…' : 'Save Changes'}
    </button>
  )
}

// ── Inline drop-upload for logos ──────────────────────────────────────────────
function LogoDrop({
  valueKey,
  onUploaded,
}: {
  valueKey: BrandingKey
  onUploaded: (key: BrandingKey, url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [lastResult, setLastResult] = useState<{ name: string; ok: boolean } | null>(null)

  const upload = async (file: File) => {
    if (!ALLOWED_MIME.includes(file.type)) {
      toast.error(`${file.name}: unsupported format. Use JPG, PNG, WebP or SVG.`); return
    }
    if (file.size > MAX_SIZE) {
      toast.error(`${file.name}: exceeds 5 MB limit.`); return
    }
    setUploading(true)
    setLastResult(null)
    const fd = new FormData()
    fd.append('files', file)
    try {
      const res  = await fetch('/api/admin/media', { method: 'POST', body: fd })
      const data = await res.json()
      const first = data.results?.[0]
      if (first?.success && first.file?.url) {
        setLastResult({ name: file.name, ok: true })
        onUploaded(valueKey, first.file.url)
        toast.success('Logo uploaded — click Save Changes to apply.')
      } else {
        setLastResult({ name: file.name, ok: false })
        toast.error(first?.error || 'Upload failed')
      }
    } catch {
      toast.error('Network error')
      setLastResult({ name: file.name, ok: false })
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Upload New Logo
      </p>
      <div
        onDragEnter={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={e => { e.preventDefault(); setDragging(false) }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault(); setDragging(false)
          const f = e.dataTransfer.files[0]
          if (f) upload(f)
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        className={[
          'flex items-center justify-center gap-3 rounded-xl border-2 border-dashed py-4 px-5 cursor-pointer transition-all duration-200',
          dragging ? 'border-[#FF5A1F] bg-orange-500/5' : 'border-border hover:border-[#FF5A1F]/40 hover:bg-foreground/[0.02]',
          uploading ? 'opacity-60 cursor-not-allowed' : '',
        ].join(' ')}
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#FF5A1F]" />
        ) : (
          <Upload className="w-4 h-4 text-muted-foreground" />
        )}
        <span className="text-xs text-muted-foreground">
          {uploading ? 'Uploading…' : 'Drop file or click to upload · JPG PNG WebP SVG · max 5 MB'}
        </span>
        {lastResult && (
          lastResult.ok
            ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            : <X className="w-4 h-4 text-red-400 shrink-0" />
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_MIME.join(',')}
        className="hidden"
        onChange={e => { if (e.target.files?.[0]) upload(e.target.files[0]) }}
      />
    </div>
  )
}

// ── Logo card ─────────────────────────────────────────────────────────────────
interface LogoCardProps {
  label:        string
  description:  string
  valueKey:     BrandingKey
  value:        string
  saving:       boolean
  onSave:       (key: BrandingKey, val: string) => Promise<void>
  onChange:     (key: BrandingKey, val: string) => void
  recommended:  string
  format:       string
  previewBg?:   'dark' | 'light'
  canReset?:    boolean
  defaultValue?: string
}

function LogoCard({
  label, description, valueKey, value, saving, onSave, onChange,
  recommended, format, previewBg = 'dark', canReset, defaultValue,
}: LogoCardProps) {
  const resolvedSrc = value || defaultValue || ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h3 className="text-sm font-bold text-foreground">{label}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <SaveBtn saving={saving} onClick={() => onSave(valueKey, value)} />
      </div>

      <div className="p-6 grid md:grid-cols-2 gap-6">
        {/* Preview */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Current Preview</p>
          <div
            className="rounded-xl overflow-hidden flex items-center justify-center p-5"
            style={{
              minHeight: 140,
              background: previewBg === 'dark' ? 'hsl(214 28% 5%)' : 'hsl(0 0% 96%)',
              border: '1px solid hsl(var(--border))',
            }}
          >
            {resolvedSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolvedSrc}
                alt={label}
                className="w-full max-h-32 object-contain"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <div className="text-center px-6 py-4">
                <Palette className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-xs text-muted-foreground">No image selected</p>
              </div>
            )}
          </div>

          {value && (
            <p className="text-[11px] text-muted-foreground mt-2 truncate" title={value}>
              {value}
            </p>
          )}
          {canReset && value && value !== defaultValue && (
            <button
              onClick={() => onChange(valueKey, defaultValue ?? '')}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
            >
              <RefreshCw className="w-3 h-3" />
              Reset to default logo
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-5">
          {/* Direct upload */}
          <LogoDrop valueKey={valueKey} onUploaded={onChange} />

          {/* Or pick from library */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Or Select from Media Library
            </p>
            <MediaPicker
              value={value}
              onChange={(url: string | null) => onChange(valueKey, url ?? '')}
              variant="logo"
            />
          </div>

          {/* Specs */}
          <div
            className="section-card rounded-xl p-4 space-y-2"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Specifications
            </p>
            <div className="flex gap-2 items-start">
              <Monitor className="w-3 h-3 mt-0.5 shrink-0 text-muted-foreground" />
              <p className="text-[11.5px] text-muted-foreground">{recommended}</p>
            </div>
            <div className="flex gap-2 items-start">
              <Globe className="w-3 h-3 mt-0.5 shrink-0 text-muted-foreground" />
              <p className="text-[11.5px] text-muted-foreground">Format: {format}</p>
            </div>
            <p className="text-[11px] text-amber-400/70 mt-1">
              💡 Use transparent background PNG or SVG for best results on dark backgrounds.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Favicon card ──────────────────────────────────────────────────────────────
function FaviconCard({
  value, saving, onSave, onChange,
}: {
  value: string; saving: boolean;
  onSave: (key: BrandingKey, val: string) => Promise<void>;
  onChange: (key: BrandingKey, val: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.08 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h3 className="text-sm font-bold text-foreground">Favicon</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            The tiny icon shown in browser tabs and bookmarks
          </p>
        </div>
        <SaveBtn saving={saving} onClick={() => onSave('branding.favicon', value)} />
      </div>

      <div className="p-6 grid md:grid-cols-2 gap-6">
        {/* Preview */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Preview</p>
          <div className="flex items-center gap-4">
            {/* Browser tab mockup */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg"
              style={{
                background: 'hsl(var(--surface-2))',
                border: '1px solid hsl(var(--border))',
                minWidth: 140,
              }}
            >
              {value ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={value} alt="favicon" className="w-4 h-4 object-contain rounded-sm" />
              ) : (
                <Smartphone className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-[11px] text-muted-foreground truncate">GoFire Tech</span>
            </div>
            {/* 48px preview */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'hsl(214 28% 5%)', border: '1px solid hsl(var(--border))' }}
            >
              {value ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={value} alt="favicon" className="w-8 h-8 object-contain" />
              ) : (
                <Smartphone className="w-5 h-5 text-muted-foreground opacity-40" />
              )}
            </div>
          </div>
          {value && (
            <p className="text-[11px] text-muted-foreground mt-3 truncate" title={value}>
              {value}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <LogoDrop valueKey="branding.favicon" onUploaded={onChange} />

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Or Select from Media Library
            </p>
            <MediaPicker
              value={value}
              onChange={(url: string | null) => onChange('branding.favicon', url ?? '')}
              variant="logo"
            />
          </div>

          {value && (
            <button
              onClick={() => onChange('branding.favicon', '/favicon.ico')}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reset to default
            </button>
          )}

          <div
            className="section-card rounded-xl p-4 space-y-2"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Specifications
            </p>
            <div className="flex gap-2 items-start">
              <Monitor className="w-3 h-3 mt-0.5 shrink-0 text-muted-foreground" />
              <p className="text-[11.5px] text-muted-foreground">32×32 px or 64×64 px recommended</p>
            </div>
            <div className="flex gap-2 items-start">
              <Globe className="w-3 h-3 mt-0.5 shrink-0 text-muted-foreground" />
              <p className="text-[11.5px] text-muted-foreground">Format: .ico, .png, or .svg</p>
            </div>
            <p className="text-[11px] text-amber-400/70 mt-1">
              ℹ After saving, do a hard refresh (Ctrl+Shift+R) to see the updated favicon in your browser tab.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminBrandingPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [data, setData]       = useState<Record<BrandingKey, string>>({ ...DEFAULTS })

  useEffect(() => {
    fetch('/api/admin/branding')
      .then(r => r.json())
      .then(d => setData({ ...DEFAULTS, ...d }))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const onChange = useCallback((key: BrandingKey, val: string) => {
    setData(prev => ({ ...prev, [key]: val }))
  }, [])

  const onSave = useCallback(async (key: BrandingKey, val: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/branding', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ [key]: val }),
      })
      if (res.ok) {
        toast.success('Saved! Refresh the website to see the updated logo.')
      } else {
        const d = await res.json().catch(() => ({}))
        toast.error(d.error || 'Failed to save')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF5A1F]" />
      </div>
    )
  }

  return (
    <div className="page-transition">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(232,0,28,0.10)', border: '1px solid rgba(232,0,28,0.18)' }}
          >
            <Palette className="w-4 h-4 text-red-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Branding &amp; Logo</h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1 ml-11">
          Upload or change logos for the website header, footer, admin panel and favicon.
          Each section is independent — you can use a different logo in the header and footer.
          After saving, refresh the website to see your changes.
        </p>
      </div>

      <div className="space-y-6">
        {/* Header Logo */}
        <LogoCard
          label="Header Logo"
          description="Shown in the public website navbar on every page."
          valueKey="branding.header_logo"
          value={data['branding.header_logo']}
          saving={saving}
          onSave={onSave}
          onChange={onChange}
          recommended="Recommended: 300×80 px or larger at 2× resolution."
          format="PNG (transparent background) or SVG"
          previewBg="dark"
          canReset
          defaultValue="/logo.png"
        />

        {/* Footer Logo */}
        <LogoCard
          label="Footer Logo"
          description="Shown in the website footer. Fully independent from the Header Logo."
          valueKey="branding.footer_logo"
          value={data['branding.footer_logo']}
          saving={saving}
          onSave={onSave}
          onChange={onChange}
          recommended="Recommended: 200×56 px. Light/white version works best on dark footer."
          format="PNG (transparent background) or SVG"
          previewBg="dark"
          canReset
          defaultValue="/logo.png"
        />

        {/* Admin Logo */}
        <LogoCard
          label="Admin Panel Logo"
          description="Shown in the admin sidebar header. Leave empty to use the default flame icon."
          valueKey="branding.admin_logo"
          value={data['branding.admin_logo']}
          saving={saving}
          onSave={onSave}
          onChange={onChange}
          recommended="Recommended: 160×40 px. Must be readable on dark backgrounds."
          format="PNG (transparent background) or SVG"
          previewBg="dark"
          canReset
          defaultValue=""
        />

        {/* Favicon */}
        <FaviconCard
          value={data['branding.favicon']}
          saving={saving}
          onSave={onSave}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
