'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Plus, Search, Edit, Trash2, Eye, EyeOff,
  Loader2, X, BookOpen, Lock,
} from 'lucide-react'
import { formatCurrency, timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Note {
  id: string; title: string; slug: string; subject?: string | null
  price?: number | null; isFree: boolean
  isPublished: boolean; isFeatured: boolean
  pageCount?: number | null; createdAt: string
}

export default function AdminNotesPage() {
  const [notes,    setNotes]   = useState<Note[]>([])
  const [loading,  setLoading] = useState(true)
  const [search,   setSearch]  = useState('')
  const [deleting, setDeleting]= useState<string | null>(null)

  const fetchNotes = () => {
    setLoading(true)
    fetch('/api/notes?all=true&limit=100')
      .then(r => r.json())
      .then(d => setNotes(d.notes || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchNotes() }, [])

  const togglePublish = async (id: string, current: boolean) => {
    await fetch(`/api/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !current }),
    })
    toast.success(current ? 'Note unpublished' : 'Note published')
    fetchNotes()
  }

  const deleteNote = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Note deleted'); fetchNotes() }
    else toast.error('Failed to delete note')
    setDeleting(null)
  }

  const filtered = notes.filter(n =>
    !search ||
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.subject?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Notes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage study notes — set price, preview content and paid content separately.
          </p>
        </div>
        <Link
          href="/admin/notes/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg,#E8001C,#c50018)', boxShadow: '0 2px 8px rgba(232,0,28,0.25)' }}
        >
          <Plus className="w-4 h-4" /> Add Note
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search notes…"
          className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total',     value: notes.length },
          { label: 'Published', value: notes.filter(n => n.isPublished).length },
          { label: 'Free',      value: notes.filter(n => n.isFree).length },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-foreground mb-1">
            {search ? 'No notes match your search' : 'No notes yet'}
          </p>
          {!search && (
            <Link href="/admin/notes/new" className="text-sm text-primary hover:underline mt-1 inline-block">
              Create your first note
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card rounded-xl p-4 flex items-center gap-4"
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(232,0,28,0.10)', border: '1px solid rgba(232,0,28,0.18)' }}
              >
                <BookOpen className="w-5 h-5 text-red-400" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground truncate text-sm">{note.title}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    note.isPublished
                      ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                      : 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                  }`}>
                    {note.isPublished ? 'Published' : 'Draft'}
                  </span>
                  {note.isFree ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400 border border-blue-400/20 font-medium">
                      Free
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-400/10 text-orange-400 border border-orange-400/20 font-medium flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      {note.price ? formatCurrency(Number(note.price)) : 'Paid'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {note.subject && <span className="mr-2">📚 {note.subject}</span>}
                  {note.pageCount && <span className="mr-2">{note.pageCount} pages</span>}
                  <span>{timeAgo(note.createdAt)}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePublish(note.id, note.isPublished)}
                  title={note.isPublished ? 'Unpublish' : 'Publish'}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  {note.isPublished
                    ? <EyeOff className="w-4 h-4 text-muted-foreground hover:text-yellow-400" />
                    : <Eye    className="w-4 h-4 text-muted-foreground hover:text-emerald-400" />
                  }
                </button>
                <Link
                  href={`/admin/notes/${note.id}`}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </Link>
                <button
                  onClick={() => deleteNote(note.id, note.title)}
                  disabled={deleting === note.id}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                  title="Delete"
                >
                  {deleting === note.id
                    ? <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                    : <Trash2  className="w-4 h-4 text-muted-foreground hover:text-red-400" />
                  }
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
