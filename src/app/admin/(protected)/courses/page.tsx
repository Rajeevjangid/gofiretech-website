'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Loader2, X } from 'lucide-react'
import { formatCurrency, timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Course {
  id: string; title: string; slug: string; price?: number | null
  originalPrice?: number | null; level: string; category?: string | null
  isPublished: boolean; isFeatured: boolean; enrollmentCount: number
  createdAt: string; instructor?: string | null
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchCourses = () => {
    setLoading(true)
    fetch('/api/courses?published=all&limit=100')
      .then(r => r.json())
      .then(data => setCourses(data.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCourses() }, [])

  const togglePublish = async (id: string, current: boolean) => {
    const res = await fetch(`/api/courses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !current }),
    })
    if (res.ok) {
      toast.success(current ? 'Course unpublished' : 'Course published')
      fetchCourses()
    }
  }

  const deleteCourse = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Course deleted')
      fetchCourses()
    } else {
      toast.error('Failed to delete course')
    }
    setDeleting(null)
  }

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-transition space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Courses</h1>
          <p className="text-muted-foreground text-sm mt-1">{courses.length} total courses</p>
        </div>
        <Link href="/admin/courses/new"
          className="btn-gf-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold relative overflow-hidden">
          <Plus className="w-4 h-4 relative z-10" />
          <span className="relative z-10">New Course</span>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-input/50 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#FF5A1F] transition-colors"
        />
        {search && <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-muted-foreground" /></button>}
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF5A1F]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No courses found.</p>
            <Link href="/admin/courses/new" className="text-[#FF5A1F] text-sm mt-2 inline-block hover:underline">Create your first course →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Course', 'Level', 'Price', 'Status', 'Enrolled', 'Created', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((course, i) => (
                  <motion.tr key={course.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-foreground/[0.03] transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-sm text-foreground line-clamp-1">{course.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{course.category}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium text-muted-foreground">{course.level}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-foreground">{formatCurrency(course.price)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => togglePublish(course.id, course.isPublished)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                          course.isPublished
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                        }`}>
                        {course.isPublished ? <><Eye className="w-3 h-3" />Published</> : <><EyeOff className="w-3 h-3" />Draft</>}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-muted-foreground">{course.enrollmentCount.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-muted-foreground">{timeAgo(course.createdAt)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/courses/${course.id}/edit`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-foreground/[0.04] transition-colors">
                          <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Link>
                        <button onClick={() => deleteCourse(course.id, course.title)}
                          disabled={deleting === course.id}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors">
                          {deleting === course.id
                            ? <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                            : <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-400" />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
