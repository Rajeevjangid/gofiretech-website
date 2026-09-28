'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  Search,
  Upload,
  X,
  Check,
  RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Shared type ──────────────────────────────────────────────────
export interface PickedMedia {
  id: string
  url: string
  originalName: string
}

interface MediaFileRecord {
  id: string
  url: string
  originalName: string
  filename: string
  mimeType: string
  size: number
  width: number | null
  height: number | null
  createdAt: string
}

// ── Props ────────────────────────────────────────────────────────
export interface MediaPickerProps {
  value?: string | null
  onChange: (url: string | null) => void
  label?: string
  /** 'logo' uses object-contain preview (no cropping). Default: 'photo' (aspect-video, object-cover) */
  variant?: 'photo' | 'logo'
}

const PAGE_SIZE = 20
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
const MAX_SIZE = 5 * 1024 * 1024

function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}

// ════════════════════════════════════════════════════════════════
//  MediaPicker
// ════════════════════════════════════════════════════════════════
export default function MediaPicker({ value, onChange, label, variant = 'photo' }: MediaPickerProps) {
  const [open, setOpen] = useState(false)

  const openModal  = () => setOpen(true)
  const closeModal = () => setOpen(false)

  const handleSelect = (url: string) => {
    onChange(url)
    closeModal()
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm font-medium text-foreground">{label}</p>
      )}

      {value ? (
        /* ── Selected state ───────────────────────────────── */
        <div className="relative rounded-xl overflow-hidden border border-border group">
          <img
            src={value}
            alt="Selected media"
            className={variant === 'logo'
              ? 'w-full h-28 object-contain p-2 bg-[hsl(214_28%_5%)]'
              : 'w-full aspect-video object-cover'
            }
          />
          {/* Overlay actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={openModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-red-200 text-xs font-medium transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        /* ── Empty state ──────────────────────────────────── */
        <button
          type="button"
          onClick={openModal}
          className="w-full aspect-video rounded-xl border-2 border-dashed border-border hover:border-[#FF5A1F]/50 hover:bg-foreground/[0.02] flex flex-col items-center justify-center gap-3 transition-all duration-200 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center group-hover:border-[#FF5A1F]/30 transition-colors">
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Choose Image</p>
            <p className="text-xs text-muted-foreground mt-0.5">Select from Media Library</p>
          </div>
        </button>
      )}

      {/* Modal portal */}
      {open && (
        <MediaPickerModal
          currentUrl={value ?? null}
          onSelect={handleSelect}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
//  MediaPickerModal — inner modal
// ════════════════════════════════════════════════════════════════
function MediaPickerModal({
  currentUrl,
  onSelect,
  onClose,
}: {
  currentUrl: string | null
  onSelect: (url: string) => void
  onClose: () => void
}) {
  const [files, setFiles]       = useState<MediaFileRecord[]>([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [debSearch, setDeb]     = useState('')
  const [highlighted, setHL]    = useState<string | null>(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [uploadResults, setUplRes] = useState<{ name: string; ok: boolean }[]>([])
  const fileInputRef            = useRef<HTMLInputElement>(null)
  const gridRef                 = useRef<HTMLDivElement>(null)
  const totalPages              = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // ── Debounce search ────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => { setDeb(search); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  // ── Fetch ──────────────────────────────────────────
  const fetchFiles = useCallback(async (p = page, q = debSearch) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page:  String(p),
        limit: String(PAGE_SIZE),
        ...(q ? { search: q } : {}),
      })
      const res  = await fetch(`/api/admin/media?${params}`)
      const data = await res.json()
      setFiles(data.files ?? [])
      setTotal(data.total ?? 0)
    } catch {
      toast.error('Failed to load media')
    } finally {
      setLoading(false)
    }
  }, [page, debSearch])

  useEffect(() => { fetchFiles(page, debSearch) }, [page, debSearch])

  // ── Escape closes ──────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Enter' && highlighted) {
        onSelect(highlighted)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [highlighted, onClose, onSelect])

  // ── Body scroll lock ───────────────────────────────
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // ── Arrow key navigation ───────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
      e.preventDefault()
      const idx = files.findIndex(f => f.url === highlighted)
      if (idx < 0) { if (files[0]) setHL(files[0].url); return }
      const cols = 4 // approximate grid columns
      let next = idx
      if (e.key === 'ArrowRight') next = Math.min(files.length - 1, idx + 1)
      if (e.key === 'ArrowLeft')  next = Math.max(0, idx - 1)
      if (e.key === 'ArrowDown')  next = Math.min(files.length - 1, idx + cols)
      if (e.key === 'ArrowUp')    next = Math.max(0, idx - cols)
      if (files[next]) setHL(files[next].url)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [files, highlighted])

  // ── Upload handler ─────────────────────────────────
  const handleUpload = async (fileList: FileList) => {
    const arr = Array.from(fileList)
    const valid: File[] = []
    const errs: string[] = []

    for (const f of arr) {
      if (!ALLOWED_MIME.includes(f.type)) { errs.push(`${f.name}: invalid type`); continue }
      if (f.size > MAX_SIZE)             { errs.push(`${f.name}: exceeds 5 MB`); continue }
      valid.push(f)
    }
    errs.forEach(e => toast.error(e, { duration: 3500 }))
    if (!valid.length) return

    setUploading(true)
    setUplRes(valid.map(f => ({ name: f.name, ok: false })))

    const fd = new FormData()
    valid.forEach(f => fd.append('files', f))

    try {
      const res  = await fetch('/api/admin/media', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.results) {
        setUplRes(data.results.map((r: any) => ({ name: r.file?.originalName ?? r.name, ok: r.success })))
        if (data.succeeded) {
          toast.success(`${data.succeeded} file${data.succeeded > 1 ? 's' : ''} uploaded`)
          // Auto-select the last uploaded file
          const lastOk = [...data.results].reverse().find((r: any) => r.success)
          if (lastOk?.file?.url) setHL(lastOk.file.url)
          // Refresh grid and go to page 1
          setPage(1)
          fetchFiles(1, debSearch)
        }
        if (data.failed) toast.error(`${data.failed} file${data.failed > 1 ? 's' : ''} failed`)
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Confirm selection ──────────────────────────────
  const confirmSelect = () => {
    if (highlighted) onSelect(highlighted)
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(6, 11, 20, 0.90)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="glass-card rounded-2xl flex flex-col w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-card"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Media Picker"
      >
        {/* ── Header ──────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">Media Library</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {total} file{total !== 1 ? 's' : ''} · click to select · press Enter to confirm
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Toolbar ─────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-border bg-surface-2/50 shrink-0">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search images…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-input/50 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#FF5A1F] transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface-2 text-sm font-medium text-foreground hover:border-[#FF5A1F]/40 hover:text-white disabled:opacity-50 transition-colors"
          >
            {uploading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Upload className="w-3.5 h-3.5" />}
            {uploading ? 'Uploading…' : 'Upload New'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_MIME.join(',')}
            multiple
            className="hidden"
            onChange={e => { if (e.target.files?.length) handleUpload(e.target.files) }}
          />
        </div>

        {/* ── Upload progress strip ────────────────── */}
        {uploadResults.length > 0 && (
          <div className="flex flex-wrap gap-2 px-6 py-2 border-b border-border bg-surface-2/30 shrink-0">
            {uploadResults.map((r, i) => (
              <span
                key={i}
                className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${
                  r.ok
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : uploading
                      ? 'border-border bg-surface-2 text-muted-foreground'
                      : 'border-red-500/30 bg-red-500/10 text-red-400'
                }`}
              >
                {r.ok
                  ? <Check className="w-2.5 h-2.5" />
                  : uploading
                    ? <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    : <X className="w-2.5 h-2.5" />}
                <span className="max-w-[120px] truncate">{r.name}</span>
              </span>
            ))}
          </div>
        )}

        {/* ── Grid area ───────────────────────────── */}
        <div ref={gridRef} className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-[#FF5A1F]" />
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <ImageIcon className="w-10 h-10 text-muted-foreground opacity-40" />
              <p className="text-sm font-medium text-foreground">
                {search ? `No results for "${search}"` : 'No images yet'}
              </p>
              <p className="text-xs text-muted-foreground">
                {search ? 'Clear the search or upload a new image' : 'Upload an image using the button above'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {files.map(file => {
                const isSelected = highlighted === file.url
                return (
                  <PickerThumb
                    key={file.id}
                    file={file}
                    isSelected={isSelected}
                    onSelect={() => setHL(file.url)}
                    onDoubleClick={() => onSelect(file.url)}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* ── Pagination ───────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-6 py-3 border-t border-border bg-surface-2/30 shrink-0">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-white hover:border-[#FF5A1F]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-white hover:border-[#FF5A1F]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── Footer actions ───────────────────────── */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-border bg-surface-2/50 shrink-0">
          {/* Selected preview */}
          <div className="flex items-center gap-3 min-w-0">
            {highlighted ? (
              <>
                <img
                  src={highlighted}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                />
                <p className="text-xs text-muted-foreground truncate">
                  {files.find(f => f.url === highlighted)?.originalName ?? 'Selected'}
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No image selected</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmSelect}
              disabled={!highlighted}
              className="px-5 py-2 rounded-xl btn-gf-primary text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Select Image
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Individual thumb card inside modal ───────────────────────────
const PickerThumb = ({
  file,
  isSelected,
  onSelect,
  onDoubleClick,
}: {
  file: MediaFileRecord
  isSelected: boolean
  onSelect: () => void
  onDoubleClick: () => void
}) => (
  <button
    type="button"
    onClick={onSelect}
    onDoubleClick={onDoubleClick}
    tabIndex={0}
    className={[
      'relative group rounded-xl overflow-hidden border-2 transition-all duration-150 focus:outline-none',
      isSelected
        ? 'border-[#FF5A1F] shadow-glow-sm scale-[0.98]'
        : 'border-border hover:border-[#FF5A1F]/40',
    ].join(' ')}
  >
    {/* Thumbnail */}
    <div className="aspect-square bg-surface-2">
      <img
        src={file.url}
        alt={file.originalName}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>

    {/* Selection tick */}
    {isSelected && (
      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#FF5A1F] flex items-center justify-center shadow-md">
        <Check className="w-3 h-3 text-white" />
      </div>
    )}

    {/* Info tooltip on hover */}
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
      <p className="text-[10px] text-white font-medium truncate">{file.originalName}</p>
      <p className="text-[9px] text-white/60">{fmtBytes(file.size)}</p>
    </div>
  </button>
)
