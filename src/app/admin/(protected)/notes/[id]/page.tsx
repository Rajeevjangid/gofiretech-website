'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import NoteForm from '@/components/admin/NoteForm'

export default function EditNotePage() {
  const router = useRouter()
  const params = useParams()
  const id     = params.id as string

  const [note,    setNote]    = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetch(`/api/notes/${id}?admin=true`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setNote(d)
      })
      .catch(() => setError('Failed to load note'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-7 h-7 animate-spin text-primary" />
    </div>
  )

  if (error || !note) return (
    <div className="text-center py-20">
      <p className="text-red-400 font-semibold">{error || 'Note not found'}</p>
      <button onClick={() => router.push('/admin/notes')} className="text-sm text-primary hover:underline mt-3 block mx-auto">
        ← Back to Notes
      </button>
    </div>
  )

  return (
    <div className="page-transition">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground">Edit Note</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Updating: <span className="text-foreground font-medium">{String(note.title)}</span>
        </p>
      </div>
      <NoteForm initialData={note} onSuccess={() => router.push('/admin/notes')} />
    </div>
  )
}
