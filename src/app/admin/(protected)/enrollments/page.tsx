'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Loader2 } from 'lucide-react'

interface Enrollment {
  id: string; type: string; status: string; enrolledAt: string; validUntil?: string | null; amountPaid?: number | null
  student: { id: string; name: string; email: string; enrollmentId: string }
  batch: { id: string; name: string; course: { title: string } }
}

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const fetchEnrollments = () => {
    setLoading(true)
    const p = new URLSearchParams({ limit: '50' })
    if (statusFilter) p.set('status', statusFilter)
    fetch(`/api/admin/enrollments?${p}`)
      .then(r => r.json()).then(d => setEnrollments(d.enrollments || []))
      .catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { fetchEnrollments() }, [statusFilter])

  const statusColor = (s: string) => ({ ACTIVE: 'text-green-500 bg-green-500/10', SUSPENDED: 'text-red-500 bg-red-500/10', EXPIRED: 'text-orange-500 bg-orange-500/10', PENDING: 'text-yellow-500 bg-yellow-500/10' } as Record<string, string>)[s] || ''

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-foreground">Enrollments</h1><p className="text-muted-foreground text-sm mt-1">{enrollments.length} shown</p></div>
        <Link href="/admin/enrollments/new" className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> New Enrollment</Link>
      </div>
      <div className="flex gap-2">
        {['', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'PENDING'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${statusFilter === s ? 'bg-primary text-white' : 'bg-foreground/5 text-muted-foreground hover:text-foreground'}`}>{s || 'All'}</button>
        ))}
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No enrollments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-muted-foreground border-b border-border">
                <th className="text-left px-4 py-3 font-medium">Student</th>
                <th className="text-left px-4 py-3 font-medium">Batch</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Valid Until</th>
                <th className="text-left px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3"></th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {enrollments.map(e => (
                  <tr key={e.id} className="hover:bg-foreground/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{e.student.name}</p>
                      <p className="text-xs text-muted-foreground">{e.student.enrollmentId}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground">{e.batch.course.title}</p>
                      <p className="text-xs text-muted-foreground">{e.batch.name}</p>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs bg-foreground/5 px-2 py-0.5 rounded">{e.type}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(e.status)}`}>{e.status}</span></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{e.validUntil ? new Date(e.validUntil).toLocaleDateString() : '\u2014'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.amountPaid ? `\u20b9${e.amountPaid}` : '\u2014'}</td>
                    <td className="px-4 py-3"><Link href={`/admin/enrollments/${e.id}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Edit</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
