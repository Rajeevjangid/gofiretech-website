'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Search, ChevronLeft, ChevronRight, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import MediaUploader from '@/components/admin/MediaUploader'
import MediaGrid from '@/components/admin/MediaGrid'
import MediaPreviewModal from '@/components/admin/MediaPreviewModal'
import type { MediaFileType } from '@/components/admin/MediaPreviewModal'

const PAGE_SIZE = 24

export default function AdminMediaPage() {
  // ── State ────────────────────────────────────────
  const [files, setFiles]               = useState<MediaFileType[]>([])
  const [total, setTotal]               = useState(0)
  const [page, setPage]                 = useState(1)
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [debouncedSearch, setDebSearch] = useState('')
  const [selectedFile, setSelectedFile] = useState<MediaFileType | null>(null)
  const [showUploader, setShowUploader] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // ── Debounce search ──────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setDebSearch(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  // ── Fetch files ──────────────────────────────────
  const fetchFiles = useCallback(async (p = page, q = debouncedSearch) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page:   String(p),
        limit:  String(PAGE_SIZE),
        ...(q ? { search: q } : {}),
      })
      const res  = await fetch(`/api/admin/media?${params}`)
      const data = await res.json()
      setFiles(data.files  ?? [])
      setTotal(data.total  ?? 0)
    } catch {
      toast.error('Failed to load media library')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => { fetchFiles(page, debouncedSearch) }, [page, debouncedSearch])

  // ── Delete ───────────────────────────────────────
  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('File deleted')
      setFiles(prev => prev.filter(f => f.id !== id))
      setTotal(prev => prev - 1)
    } else {
      const err = await res.json()
      toast.error(err.error || 'Delete failed')
    }
  }

  // ── After upload ─────────────────────────────────
  const handleUploadComplete = () => {
    fetchFiles(1, debouncedSearch)
    setPage(1)
    // Keep uploader open so admin can upload more
  }

  return (
    <div className="page-transition space-y-6">

      {/* ── Header ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Media Library</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {loading ? 'Loading…' : `${total} file${total !== 1 ? 's' : ''} stored`}
          </p>
        </div>
        <button
          onClick={() => setShowUploader(v => !v)}
          className="btn-gf-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 self-start sm:self-auto"
        >
          {showUploader ? (
            <><X className="w-4 h-4" /> Hide Uploader</>
          ) : (
            <><Upload className="w-4 h-4" /> Upload Files</>
          )}
        </button>
      </div>

      {/* ── Uploader (collapsible) ─────────────────── */}
      {showUploader && (
        <div className="glass-card rounded-2xl p-6">
          <MediaUploader onUploadComplete={handleUploadComplete} />
        </div>
      )}

      {/* ── Search + stats bar ────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by filename…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-input bg-input/50 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#FF5A1F] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Pagination info */}
        {!loading && total > 0 && (
          <p className="text-xs text-muted-foreground sm:ml-auto">
            Page {page} of {totalPages} · {total} items
          </p>
        )}
      </div>

      {/* ── Grid ──────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 animate-spin text-[#FF5A1F]" />
        </div>
      ) : (
        <MediaGrid
          files={files}
          search={debouncedSearch}
          onCardClick={setSelectedFile}
          onDelete={handleDelete}
        />
      )}

      {/* ── Pagination ────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 rounded-xl border border-border bg-surface-2 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[#FF5A1F]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page number pills */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
            .reduce<(number | '…')[]>((acc, n, idx, arr) => {
              if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push('…')
              acc.push(n)
              return acc
            }, [])
            .map((item, idx) =>
              item === '…' ? (
                <span key={`ellipsis-${idx}`} className="text-muted-foreground text-sm px-1">…</span>
              ) : (
                <button
                  key={item}
                  onClick={() => setPage(item as number)}
                  className={[
                    'w-9 h-9 rounded-xl text-sm font-medium transition-colors',
                    page === item
                      ? 'bg-[#FF5A1F] text-white'
                      : 'border border-border bg-surface-2 text-muted-foreground hover:text-foreground hover:border-[#FF5A1F]/40',
                  ].join(' ')}
                >
                  {item}
                </button>
              ),
            )}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-9 h-9 rounded-xl border border-border bg-surface-2 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[#FF5A1F]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Preview Modal ─────────────────────────── */}
      <MediaPreviewModal
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
        onDelete={handleDelete}
      />
    </div>
  )
}
