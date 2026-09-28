'use client'

import { useState } from 'react'
import { Copy, Trash2, Check, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import type { MediaFileType } from './MediaPreviewModal'

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

interface MediaCardProps {
  file: MediaFileType
  onClick: () => void
  onDelete: (id: string) => Promise<void>
}

export default function MediaCard({ file, onClick, onDelete }: MediaCardProps) {
  const [copied, setCopied]     = useState(false)
  const [deleting, setDeleting] = useState(false)

  const copyUrl = (e: React.MouseEvent) => {
    e.stopPropagation()
    const fullUrl = window.location.origin + file.url
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    toast.success('URL copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm(`Delete "${file.originalName}"?`)) return
    setDeleting(true)
    try {
      await onDelete(file.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      onClick={onClick}
      className="group relative glass-card rounded-xl overflow-hidden border border-border hover:border-[#FF5A1F]/30 cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
    >
      {/* ── Thumbnail ──────────────────────────────── */}
      <div className="aspect-square overflow-hidden bg-surface-2">
        <img
          src={file.url}
          alt={file.altText || file.originalName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* ── Hover overlay ──────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2.5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={copyUrl}
            title="Copy URL"
            className="flex-1 flex items-center justify-center gap-1 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-medium transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ── Info bar ───────────────────────────────── */}
      <div className="p-2.5 space-y-0.5 border-t border-border">
        <p
          className="text-xs font-medium text-foreground truncate leading-tight"
          title={file.originalName}
        >
          {file.originalName}
        </p>
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] text-muted-foreground">{formatBytes(file.size)}</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" />
            {format(new Date(file.createdAt), 'dd MMM yy')}
          </span>
        </div>
        {file.width && file.height && (
          <p className="text-[10px] text-muted-foreground/70">
            {file.width}×{file.height}
          </p>
        )}
      </div>
    </div>
  )
}
