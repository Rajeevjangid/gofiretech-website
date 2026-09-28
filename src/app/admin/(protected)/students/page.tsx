'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, Trash2, Eye, Loader2, Mail, MailCheck, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { timeAgo } from '@/lib/utils'

interface Student {
  id: string; enrollmentId: string; name: string; email: string; phone?: string | null
  isActive: boolean; credentialEmailSentAt?: string | null; createdAt: string
  _count: { enrollments: number }
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const limit = 20

  const fetchStudents = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) params.set('search', search)
    fetch(`/api/admin/students?${params}`)
      .then(r => r.json())
      .then(d => { setStudents(d.students || []); setTotal(d.total || 0) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, search])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  const deleteStudent = async (id: string, name: string) => {
    if (!confirm(`Delete student "${name}"? This will remove all their enrollments.`)) return
    const res = await fetch(`/api/admin/students/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Student deleted'); fetchStudents() }
    else toast.error('Failed to delete')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Students</h1>
          <p className="text-muted-foreground text-sm mt-1">{total} total students</p>
        </div>
        <Link href="/admin/students/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Student
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text" placeholder="Search students..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="input-field pl-9 w-full text-sm"
            />
            {search && <button onClick={() => { setSearch(''); setPage(1) }} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No students found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-muted-foreground border-b border-border">
                <th className="text-left px-4 py-3 font-medium">Enrollment ID</th>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Enrollments</th>
                <th className="text-left px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3"></th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-foreground/[0.02] transition-colors">
                    <td className="px-4 py-3"><span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{s.enrollmentId}</span></td>
                    <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.credentialEmailSentAt
                        ? <span title={new Date(s.credentialEmailSentAt).toLocaleString()}><MailCheck className="w-4 h-4 text-green-500" /></span>
                        : <Mail className="w-4 h-4 text-muted-foreground/40" />}
                    </td>
                    <td className="px-4 py-3 text-center">{s._count.enrollments}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{timeAgo(s.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/admin/students/${s.id}`} className="p-1.5 rounded-lg hover:bg-foreground/[0.06] text-muted-foreground hover:text-foreground transition-colors"><Eye className="w-4 h-4" /></Link>
                        <button onClick={() => deleteStudent(s.id, s.name)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > limit && (
          <div className="flex items-center justify-between p-4 border-t border-border text-sm text-muted-foreground">
            <span>Page {page} of {Math.ceil(total / limit)}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40">Previous</button>
              <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
