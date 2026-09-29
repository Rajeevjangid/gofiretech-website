'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface Doc { id: string; title: string; category: string; fileName: string; size: number; createdAt: string }
const CATEGORIES = ['IDENTITY', 'PHOTOGRAPH', 'EDUCATION', 'CERTIFICATE', 'RECEIPT', 'OTHER']

export default function DocumentsSection({ studentId }: { studentId: string }) {
  const [docs, setDocs] = useState<Doc[]>([])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('OTHER')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(() => {
    fetch(`/api/admin/students/${studentId}/documents`).then(r => r.json()).then(setDocs).catch(() => {})
  }, [studentId])
  useEffect(() => { load() }, [load])

  const upload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) { toast.error('Choose a file'); return }
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file); fd.append('title', title); fd.append('category', category)
    const res = await fetch(`/api/admin/students/${studentId}/documents`, { method: 'POST', body: fd })
    const d = await res.json().catch(() => ({}))
    setUploading(false)
    if (!res.ok) { toast.error(d.error || 'Upload failed'); return }
    toast.success('Document uploaded')
    setTitle(''); if (fileRef.current) fileRef.current.value = ''
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this document?')) return
    const res = await fetch(`/api/admin/documents/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Deleted'); load() } else toast.error('Failed')
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <h2 className="font-semibold text-foreground flex items-center gap-2"><FileText className="w-4 h-4" /> Documents</h2>
      <div className="grid sm:grid-cols-[1fr_auto_auto] gap-2">
        <input placeholder="Title (optional)" value={title} onChange={e => setTitle(e.target.value)} className="input-field" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <button onClick={upload} disabled={uploading} className="btn-primary text-sm">{uploading ? 'Uploading...' : 'Upload'}</button>
      </div>
      <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="text-xs text-muted-foreground" />
      <p className="text-xs text-muted-foreground">PDF, JPG, PNG or WebP up to 10 MB. Files are private — only you and this student can open them.</p>
      {docs.length > 0 && (
        <div className="divide-y divide-border border border-border rounded-xl">
          {docs.map(d => (
            <div key={d.id} className="px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
              <div><p className="font-medium text-foreground">{d.title}</p><p className="text-xs text-muted-foreground">{d.category} · {(d.size / 1024).toFixed(0)} KB</p></div>
              <div className="flex items-center gap-3 text-xs">
                <a href={`/api/documents/${d.id}`} target="_blank" rel="noopener noreferrer" className="text-primary font-medium">View</a>
                <button onClick={() => remove(d.id)} className="text-red-500">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
