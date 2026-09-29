'use client'
import { useEffect, useState } from 'react'
import { ListPlus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Field { label: string; value: string; visibleToStudent: boolean }

export default function CustomFieldsSection({ studentId }: { studentId: string }) {
  const [fields, setFields] = useState<Field[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/students/${studentId}/custom-fields`).then(r => r.json())
      .then((d: Field[]) => setFields(d.map(f => ({ label: f.label, value: f.value, visibleToStudent: f.visibleToStudent }))))
      .catch(() => {})
  }, [studentId])

  const update = (i: number, patch: Partial<Field>) => setFields(fs => fs.map((f, j) => j === i ? { ...f, ...patch } : f))

  const save = async () => {
    setSaving(true)
    const res = await fetch(`/api/admin/students/${studentId}/custom-fields`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: fields.filter(f => f.label.trim()) }),
    })
    setSaving(false)
    res.ok ? toast.success('Custom info saved') : toast.error('Failed to save')
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground flex items-center gap-2"><ListPlus className="w-4 h-4" /> Custom Information</h2>
        <button onClick={() => setFields(fs => [...fs, { label: '', value: '', visibleToStudent: true }])} className="btn-ghost text-xs px-3 py-1.5">+ Add field</button>
      </div>
      {fields.length === 0 && <p className="text-sm text-muted-foreground">No custom fields (e.g. Address, Guardian, Education).</p>}
      {fields.map((f, i) => (
        <div key={i} className="grid grid-cols-[1fr_1.5fr_auto_auto] gap-2 items-center">
          <input placeholder="Label" value={f.label} onChange={e => update(i, { label: e.target.value })} className="input-field" />
          <input placeholder="Value" value={f.value} onChange={e => update(i, { value: e.target.value })} className="input-field" />
          <label className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
            <input type="checkbox" checked={f.visibleToStudent} onChange={e => update(i, { visibleToStudent: e.target.checked })} /> Student can see
          </label>
          <button onClick={() => setFields(fs => fs.filter((_, j) => j !== i))} className="text-red-500" aria-label="Remove"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      {fields.length > 0 && <button onClick={save} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : 'Save Custom Info'}</button>}
    </div>
  )
}
