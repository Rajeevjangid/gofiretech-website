'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Loader2, Users, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

interface Batch {
  id: string; name: string; slug: string; isActive: boolean; isPublished: boolean
  price?: number | null; startDate?: string | null; endDate?: string | null
  course: { id: string; title: string }
  _count: { enrollments: number; modules: number }
}

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBatches = () => {
    setLoading(true)
    fetch('/api/admin/batches')
      .then(r => r.json())
      .then(d => setBatches(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBatches() }, [])

  const deleteBatch = async (id: string, name: string) => {
    if (!confirm(`Delete batch "${name}"?`)) return
    const res = await fetch(`/api/admin/batches/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Batch deleted'); fetchBatches() } else toast.error('Failed to delete')
  }

  const grouped: Record<string, Batch[]> = {}
  batches.forEach(b => {
    const k = b.course.title
    if (!grouped[k]) grouped[k] = []
    grouped[k].push(b)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Batches</h1>
          <p className="text-muted-foreground text-sm mt-1">{batches.length} total batches</p>
        </div>
        <Link href="/admin/batches/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Batch
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : batches.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl text-center py-12 text-muted-foreground">No batches yet. Create one to get started.</div>
      ) : (
        Object.entries(grouped).map(([courseName, batchList]) => (
          <div key={courseName} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-foreground">{courseName}</h2>
            </div>
            <div className="divide-y divide-border">
              {batchList.map(b => (
                <div key={b.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-foreground">{b.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${b.isPublished ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-600'}`}>{b.isPublished ? 'Published' : 'Draft'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${b.isActive ? 'bg-blue-500/10 text-blue-500' : 'bg-foreground/10 text-muted-foreground'}`}>{b.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {b._count.enrollments} enrolled</span>
                      <span>{b._count.modules} modules</span>
                      {b.startDate && <span>Starts {new Date(b.startDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/batches/${b.id}`} className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1"><Edit className="w-3.5 h-3.5" /> Manage</Link>
                    <button onClick={() => deleteBatch(b.id, b.name)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
