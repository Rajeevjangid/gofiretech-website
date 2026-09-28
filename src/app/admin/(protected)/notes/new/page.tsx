'use client'

import { useRouter } from 'next/navigation'
import NoteForm from '@/components/admin/NoteForm'

export default function NewNotePage() {
  const router = useRouter()
  return (
    <div className="page-transition">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground">Create New Note</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Fill in the note details. Set preview content (free) and full content (paid) separately.
        </p>
      </div>
      <NoteForm onSuccess={() => router.push('/admin/notes')} />
    </div>
  )
}
