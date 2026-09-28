'use client'

import { useRef, useState, useCallback } from 'react'
import { Upload, Loader2, CheckCircle2, XCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg']
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

interface UploadResult {
  name: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

interface MediaUploaderProps {
  onUploadComplete: () => void
}

export default function MediaUploader({ onUploadComplete }: MediaUploaderProps) {
  const inputRef        = useRef<HTMLInputElement>(null)
  const [dragging, setDragging]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [results, setResults]     = useState<UploadResult[]>([])

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_MIME.includes(file.type)) {
      return `${file.name}: Invalid type. Allowed: JPG, PNG, WebP, SVG`
    }
    if (file.size > MAX_SIZE) {
      return `${file.name}: Exceeds 5 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB)`
    }
    return null
  }

  const uploadFiles = useCallback(async (fileList: FileList | File[]) => {
    const files = Array.from(fileList)
    if (!files.length) return

    // Client-side validation first
    const invalid: string[] = []
    const valid: File[] = []
    for (const f of files) {
      const err = validateFile(f)
      if (err) invalid.push(err)
      else valid.push(f)
    }

    if (invalid.length) {
      invalid.forEach(e => toast.error(e, { duration: 4000 }))
    }
    if (!valid.length) return

    setUploading(true)
    setResults(valid.map(f => ({ name: f.name, status: 'uploading' })))

    const formData = new FormData()
    for (const f of valid) formData.append('files', f)

    try {
      const res  = await fetch('/api/admin/media', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.results) {
        setResults(
          data.results.map((r: any) => ({
            name:   r.file?.originalName ?? r.name,
            status: r.success ? 'done' : 'error',
            error:  r.error,
          })),
        )
        if (data.succeeded > 0) {
          toast.success(
            `${data.succeeded} file${data.succeeded > 1 ? 's' : ''} uploaded successfully`,
          )
          onUploadComplete()
        }
        if (data.failed > 0) {
          toast.error(`${data.failed} file${data.failed > 1 ? 's' : ''} failed to upload`)
        }
      } else {
        toast.error(data.error || 'Upload failed')
        setResults(valid.map(f => ({ name: f.name, status: 'error', error: data.error })))
      }
    } catch {
      toast.error('Network error — upload failed')
      setResults(valid.map(f => ({ name: f.name, status: 'error', error: 'Network error' })))
    } finally {
      setUploading(false)
      // Reset file input
      if (inputRef.current) inputRef.current.value = ''
    }
  }, [onUploadComplete])

  // ── Drag handlers ────────────────────────────────────────
  const onDragEnter = (e: React.DragEvent) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragging(false) }
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault() }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (uploading) return
    uploadFiles(e.dataTransfer.files)
  }

  const clearResults = () => setResults([])

  return (
    <div className="space-y-3">
      {/* ── Drop Zone ─────────────────────────────────── */}
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={[
          'relative rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200',
          uploading
            ? 'cursor-not-allowed border-border opacity-60'
            : 'cursor-pointer',
          dragging
            ? 'border-[#FF5A1F] bg-orange-500/5 scale-[1.01]'
            : 'border-border hover:border-[#FF5A1F]/50 hover:bg-foreground/[0.02]',
        ].join(' ')}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-9 h-9 animate-spin text-[#FF5A1F]" />
            <p className="text-sm font-medium text-foreground">Uploading and optimizing…</p>
            <p className="text-xs text-muted-foreground">Please wait, do not close this page</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 pointer-events-none">
            <div className={[
              'w-14 h-14 rounded-2xl flex items-center justify-center transition-colors',
              dragging
                ? 'bg-orange-500/20 border border-orange-500/40'
                : 'bg-orange-500/10 border border-orange-500/20',
            ].join(' ')}>
              <Upload className={`w-7 h-7 ${dragging ? 'text-[#FF5A1F]' : 'text-[#FF5A1F]/70'}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {dragging ? 'Drop to upload' : 'Drag & drop files here'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or <span className="text-[#FF5A1F] font-medium">click to browse</span>
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5 mt-1">
              {ALLOWED_EXTENSIONS.map(ext => (
                <span
                  key={ext}
                  className="px-2 py-0.5 rounded-md bg-surface-2 border border-border text-[10px] font-mono text-muted-foreground uppercase"
                >
                  {ext.slice(1)}
                </span>
              ))}
              <span className="px-2 py-0.5 rounded-md bg-surface-2 border border-border text-[10px] text-muted-foreground">
                max 5 MB each
              </span>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_MIME.join(',')}
          multiple
          className="hidden"
          onChange={e => { if (e.target.files?.length) uploadFiles(e.target.files) }}
        />
      </div>

      {/* ── Per-file Results ──────────────────────────── */}
      {results.length > 0 && (
        <div className="glass-card rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Upload results
            </p>
            {!uploading && (
              <button
                type="button"
                onClick={clearResults}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-2.5">
              {r.status === 'uploading' && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF5A1F] shrink-0" />
              )}
              {r.status === 'done' && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
              {r.status === 'error' && (
                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              )}
              <p className="text-xs text-foreground truncate flex-1">{r.name}</p>
              {r.error && (
                <p className="text-[10px] text-red-400 shrink-0">{r.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
