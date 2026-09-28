'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Plus, Trash2, GripVertical, FileText, Video, File, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

interface BatchDetail {
  id: string; name: string; slug: string; description?: string | null
  startDate?: string | null; endDate?: string | null; maxStudents?: number | null
  price?: number | null; isActive: boolean; isPublished: boolean; order: number
  course: { id: string; title: string; slug: string }
  modules: Array<{
    id: string; title: string; description?: string | null; order: number; isPublished: boolean
    resources: Array<{ id: string; type: string; title: string; isPublished: boolean; order: number }>
  }>
  _count: { enrollments: number }
}

interface NewModuleForm { title: string; description: string; order: string }
interface NewResourceForm { title: string; type: string; url: string; description: string; duration: string }

const RESOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = { NOTE: FileText, PDF: File, RECORDED_LECTURE: Video, STUDY_MATERIAL: BookOpen }
const ResourceIcon = ({ type }: { type: string }) => { const I = RESOURCE_ICONS[type] || File; return <I className="w-3.5 h-3.5" /> }

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [batch, setBatch] = useState<BatchDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'details' | 'modules' | 'enrollments'>('modules')
  const [saving, setSaving] = useState(false)
  const [addingModule, setAddingModule] = useState(false)
  const [newModule, setNewModule] = useState<NewModuleForm>({ title: '', description: '', order: '0' })
  const [addingResource, setAddingResource] = useState<string | null>(null)
  const [newResource, setNewResource] = useState<NewResourceForm>({ title: '', type: 'NOTE', url: '', description: '', duration: '' })

  const fetchBatch = () => {
    setLoading(true)
    fetch(`/api/admin/batches/${id}`)
      .then(r => r.json()).then(setBatch).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { fetchBatch() }, [id])

  const saveDetails = async () => {
    if (!batch) return
    setSaving(true)
    const res = await fetch(`/api/admin/batches/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: batch.name, description: batch.description, startDate: batch.startDate, endDate: batch.endDate, maxStudents: batch.maxStudents, price: batch.price, isActive: batch.isActive, isPublished: batch.isPublished }),
    })
    if (res.ok) { toast.success('Batch updated') } else { toast.error('Failed to update') }
    setSaving(false)
  }

  const createModule = async () => {
    const res = await fetch('/api/admin/modules', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId: id, title: newModule.title, description: newModule.description || undefined, order: parseInt(newModule.order) || 0 }),
    })
    if (res.ok) { toast.success('Module created'); setAddingModule(false); setNewModule({ title: '', description: '', order: '0' }); fetchBatch() }
    else toast.error('Failed to create module')
  }

  const deleteModule = async (moduleId: string, title: string) => {
    if (!confirm(`Delete module "${title}"? This will delete all its resources.`)) return
    const res = await fetch(`/api/admin/modules/${moduleId}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Module deleted'); fetchBatch() } else toast.error('Failed')
  }

  const toggleModulePublish = async (moduleId: string, isPublished: boolean) => {
    await fetch(`/api/admin/modules/${moduleId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPublished: !isPublished }) })
    fetchBatch()
  }

  const createResource = async (moduleId: string) => {
    const res = await fetch('/api/admin/resources', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleId, ...newResource, order: 0 }),
    })
    if (res.ok) { toast.success('Resource added'); setAddingResource(null); setNewResource({ title: '', type: 'NOTE', url: '', description: '', duration: '' }); fetchBatch() }
    else toast.error('Failed')
  }

  const deleteResource = async (resourceId: string) => {
    if (!confirm('Delete this resource?')) return
    const res = await fetch(`/api/admin/resources/${resourceId}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Resource deleted'); fetchBatch() } else toast.error('Failed')
  }

  const toggleResourcePublish = async (resourceId: string, isPublished: boolean) => {
    await fetch(`/api/admin/resources/${resourceId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPublished: !isPublished }) })
    fetchBatch()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  if (!batch) return <div className="text-muted-foreground">Batch not found.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/batches" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">{batch.name}</h1>
          <p className="text-xs text-muted-foreground">{batch.course.title} \u00b7 {batch._count.enrollments} enrolled</p>
        </div>
      </div>

      <div className="flex gap-1 bg-foreground/[0.04] rounded-xl p-1 w-fit">
        {(['modules', 'details', 'enrollments'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{t}</button>
        ))}
      </div>

      {tab === 'modules' && (
        <div className="space-y-4">
          {batch.modules.map(m => (
            <div key={m.id} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground/40" />
                  <div>
                    <p className="font-semibold text-foreground">{m.title}</p>
                    {m.description && <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleModulePublish(m.id, m.isPublished)} className={`text-xs px-2 py-1 rounded-lg transition-colors ${m.isPublished ? 'bg-green-500/10 text-green-500' : 'bg-foreground/10 text-muted-foreground'}`}>{m.isPublished ? 'Published' : 'Draft'}</button>
                  <button onClick={() => deleteModule(m.id, m.title)} className="p-1.5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {m.resources.map(r => (
                  <div key={r.id} className="flex items-center justify-between px-3 py-2.5 bg-foreground/[0.02] rounded-xl border border-border/50">
                    <div className="flex items-center gap-2.5">
                      <span className="text-muted-foreground"><ResourceIcon type={r.type} /></span>
                      <span className="text-sm text-foreground">{r.title}</span>
                      <span className="text-xs text-muted-foreground bg-foreground/5 px-1.5 py-0.5 rounded">{r.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleResourcePublish(r.id, r.isPublished)} className={`text-xs px-2 py-0.5 rounded transition-colors ${r.isPublished ? 'text-green-500' : 'text-muted-foreground'}`}>{r.isPublished ? '\u2713 Live' : 'Draft'}</button>
                      <button onClick={() => deleteResource(r.id)} className="p-1 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded transition-colors"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
                {addingResource === m.id ? (
                  <div className="border border-border rounded-xl p-3 space-y-2 bg-foreground/[0.02]">
                    <div className="grid grid-cols-2 gap-2">
                      <input placeholder="Resource title" value={newResource.title} onChange={e => setNewResource(r => ({ ...r, title: e.target.value }))} className="input-field text-sm" />
                      <select value={newResource.type} onChange={e => setNewResource(r => ({ ...r, type: e.target.value }))} className="input-field text-sm">
                        {['NOTE', 'PDF', 'RECORDED_LECTURE', 'STUDY_MATERIAL', 'ASSIGNMENT', 'QUIZ', 'LINK', 'OTHER'].map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                      </select>
                    </div>
                    <input placeholder="URL (video link, PDF URL, etc.)" value={newResource.url} onChange={e => setNewResource(r => ({ ...r, url: e.target.value }))} className="input-field text-sm w-full" />
                    <input placeholder="Duration (e.g. 45 mins)" value={newResource.duration} onChange={e => setNewResource(r => ({ ...r, duration: e.target.value }))} className="input-field text-sm w-full" />
                    <div className="flex gap-2">
                      <button onClick={() => createResource(m.id)} className="btn-primary text-xs px-3 py-1.5">Add Resource</button>
                      <button onClick={() => setAddingResource(null)} className="btn-ghost text-xs px-3 py-1.5">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setAddingResource(m.id); setNewResource({ title: '', type: 'NOTE', url: '', description: '', duration: '' }) }} className="w-full text-left text-xs text-muted-foreground hover:text-foreground px-3 py-2 rounded-xl hover:bg-foreground/[0.04] transition-colors flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5" /> Add resource
                  </button>
                )}
              </div>
            </div>
          ))}

          {addingModule ? (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <input placeholder="Module title" value={newModule.title} onChange={e => setNewModule(m => ({ ...m, title: e.target.value }))} className="input-field w-full" />
              <input placeholder="Description (optional)" value={newModule.description} onChange={e => setNewModule(m => ({ ...m, description: e.target.value }))} className="input-field w-full" />
              <div className="flex gap-2">
                <button onClick={createModule} className="btn-primary text-sm">Create Module</button>
                <button onClick={() => setAddingModule(false)} className="btn-ghost text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingModule(true)} className="w-full bg-card border border-border border-dashed rounded-2xl py-4 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors flex items-center justify-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add Module
            </button>
          )}
        </div>
      )}

      {tab === 'details' && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 max-w-xl">
          <div><label className="block text-sm font-medium text-foreground mb-1.5">Batch Name</label>
            <input value={batch.name} onChange={e => setBatch(b => b ? ({ ...b, name: e.target.value }) : b)} className="input-field w-full" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea rows={3} value={batch.description || ''} onChange={e => setBatch(b => b ? ({ ...b, description: e.target.value }) : b)} className="input-field w-full" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground mb-1.5">Start Date</label>
              <input type="date" value={batch.startDate ? batch.startDate.slice(0, 10) : ''} onChange={e => setBatch(b => b ? ({ ...b, startDate: e.target.value }) : b)} className="input-field w-full" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1.5">End Date</label>
              <input type="date" value={batch.endDate ? batch.endDate.slice(0, 10) : ''} onChange={e => setBatch(b => b ? ({ ...b, endDate: e.target.value }) : b)} className="input-field w-full" /></div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={batch.isActive} onChange={e => setBatch(b => b ? ({ ...b, isActive: e.target.checked }) : b)} className="rounded" /> Active
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={batch.isPublished} onChange={e => setBatch(b => b ? ({ ...b, isPublished: e.target.checked }) : b)} className="rounded" /> Published
            </label>
          </div>
          <button onClick={saveDetails} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
        </div>
      )}

      {tab === 'enrollments' && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h2 className="font-semibold text-foreground">Enrollments ({batch._count.enrollments})</h2>
            <Link href={`/admin/enrollments/new?batchId=${id}`} className="btn-primary text-xs px-3 py-1.5">+ Enroll Student</Link>
          </div>
          <EnrollmentList batchId={id} />
        </div>
      )}
    </div>
  )
}

function EnrollmentList({ batchId }: { batchId: string }) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/enrollments?batchId=${batchId}&limit=50`)
      .then(r => r.json()).then(d => setData(d.enrollments || [])).catch(console.error).finally(() => setLoading(false))
  }, [batchId])

  if (loading) return <div className="flex items-center justify-center h-24"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
  if (!data.length) return <div className="text-center py-8 text-muted-foreground text-sm">No enrollments for this batch.</div>

  const statusColor = (s: string) => ({ ACTIVE: 'text-green-500 bg-green-500/10', SUSPENDED: 'text-red-500 bg-red-500/10', EXPIRED: 'text-orange-500 bg-orange-500/10', PENDING: 'text-yellow-500 bg-yellow-500/10' } as Record<string, string>)[s] || ''

  return (
    <div className="divide-y divide-border">
      {data.map((e: any) => (
        <div key={e.id} className="px-6 py-3 flex items-center justify-between">
          <div>
            <p className="font-medium text-sm text-foreground">{e.student.name}</p>
            <p className="text-xs text-muted-foreground">{e.student.enrollmentId} \u00b7 {e.student.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(e.status)}`}>{e.status}</span>
            <Link href={`/admin/enrollments/${e.id}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Edit</Link>
          </div>
        </div>
      ))}
    </div>
  )
}
