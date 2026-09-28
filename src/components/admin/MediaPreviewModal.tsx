'use client'

import { useEffect, useState } from 'react'
import { X, Copy, Trash2, Check, Calendar, Ruler, HardDrive, FileImage } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export interface MediaFileType {
  id: string
  filename: string
  originalName: string
  url: string
  mimeType: string
  size: number
  width: number | null
  height: number | null
  altText: string | null
  createdAt: string
  updatedAt: string
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

interface MediaPreviewModalProps {
  file: MediaFileType | null
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

export default function MediaPreviewModal({
  file,
  onClose,
  onDelete,
}: MediaPreviewModalProps) {
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // ── Close on Escape ───────────────────────────────
  useEffect(() => {
    if (!file) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [file, onClose])

  // ── Lock body scroll ──────────────────────────────
  useEffect(() => {
    if (file) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [file])

  if (!file) return null

  const fullUrl = (typeof window !== 'undefined' ? window.location.origin : '') + file.url

  const copyUrl = () => {
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    toast.success('URL copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${file.originalName}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await onDelete(file.id)
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6, 11, 20, 0.85)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="relative glass-card rounded-2xl overflow-hidden flex flex-col lg:flex-row w-full max-w-4xl max-h-[90vh] shadow-card"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Close button ─────────────────────────── */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── Image preview ────────────────────────── */}
        <div className="lg:w-3/5 bg-[#0a0f18] flex items-center justify-center min-h-[240px] lg:min-h-[400px]">
          <img
            src={file.url}
            alt={file.altText || file.originalName}
            className="max-w-full max-h-[60vh] lg:max-h-[80vh] object-contain"
          />
        </div>

        {/* ── Metadata panel ───────────────────────── */}
        <div className="lg:w-2/5 p-6 flex flex-col gap-5 overflow-y-auto border-t lg:border-t-0 lg:border-l border-border">
          {/* Filename */}
          <div>
            <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wide font-semibold">Filename</p>
            <p className="text-sm font-medium text-foreground break-all leading-snug">
              {file.originalName}
            </p>
          </div>

          {/* Meta rows */}
          <div className="space-y-3">
            {file.width && file.height && (
              <MetaRow icon={<Ruler className="w-3.5 h-3.5" />} label="Dimensions">
                {file.width} × {file.height} px
              </MetaRow>
            )}
            <MetaRow icon={<HardDrive className="w-3.5 h-3.5" />} label="File size">
              {formatBytes(file.size)}
            </MetaRow>
            <MetaRow icon={<FileImage className="w-3.5 h-3.5" />} label="Type">
              {file.mimeType}
            </MetaRow>
            <MetaRow icon={<Calendar className="w-3.5 h-3.5" />} label="Uploaded">
              {format(new Date(file.createdAt), 'dd MMM yyyy, HH:mm')}
            </MetaRow>
          </div>

          {/* URL copy */}
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Public URL</p>
            <div className="flex items-center gap-2 bg-surface-2 rounded-xl border border-border px-3 py-2">
              <code className="flex-1 text-[11px] text-muted-foreground truncate">
                {file.url}
              </code>
              <button
                onClick={copyUrl}
                title="Copy URL"
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
              >
                {copied
                  ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                  : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto flex flex-col gap-2 pt-2">
            <button
              onClick={copyUrl}
              className="w-full btn-gf-primary py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting…' : 'Delete File'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetaRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-xs text-foreground font-medium">{children}</p>
      </div>
    </div>
  )
}
