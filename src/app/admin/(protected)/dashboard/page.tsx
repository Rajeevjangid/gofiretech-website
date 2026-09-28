'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, FileText, MessageSquare, Users, TrendingUp, Eye, ArrowRight, Loader2, Clock, StickyNote } from 'lucide-react'
import { timeAgo } from '@/lib/utils'


interface Stats {
  courses: { total: number; published: number }
  blog: { total: number; published: number }
  notes: { total: number; published: number }
  contacts: { total: number; unread: number }
  testimonials: number
  placements: number
  recentContacts: Array<{ id: string; name: string; email: string; course?: string | null; createdAt: string; isRead: boolean }>
}

const statCards = [
  { key: 'courses',      icon: BookOpen,    label: 'Total Courses',  color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20',   href: '/admin/courses'      },
  { key: 'blog',         icon: FileText,    label: 'Blog Posts',     color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', href: '/admin/blog'         },
  { key: 'notes',        icon: StickyNote,  label: 'Notes',          color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20',    href: '/admin/notes'        },
  { key: 'contacts',     icon: MessageSquare, label: 'Inquiries',    color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', href: '/admin/contacts'     },
  { key: 'testimonials', icon: Users,       label: 'Testimonials',   color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20',  href: '/admin/testimonials' },
]


export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-[#FF5A1F]" />
    </div>
  )

  const getStatValue = (key: string) => {
    if (!stats) return 0
    if (key === 'courses')      return stats.courses.total
    if (key === 'blog')         return stats.blog.total
    if (key === 'notes')        return stats.notes.total
    if (key === 'contacts')     return stats.contacts.total
    if (key === 'testimonials') return stats.testimonials
    return 0
  }

  const getSubValue = (key: string) => {
    if (!stats) return ''
    if (key === 'courses')  return `${stats.courses.published} published`
    if (key === 'blog')     return `${stats.blog.published} published`
    if (key === 'notes')    return `${stats.notes.published} published`
    if (key === 'contacts') return `${stats.contacts.unread} unread`
    return ''
  }

  return (
    <div className="page-transition space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map(({ key, icon: Icon, label, color, bg, border, href }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Link href={href}>
              <div className="glass-card rounded-2xl p-5 hover:border-[#FF5A1F]/30 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <p className="text-3xl font-extrabold text-foreground mb-0.5">{getStatValue(key)}</p>
                <p className="text-sm font-medium text-foreground mb-1">{label}</p>
                {getSubValue(key) && (
                  <p className="text-xs text-muted-foreground">{getSubValue(key)}</p>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Contacts */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-foreground">Recent Inquiries</h2>
            <Link href="/admin/contacts" className="text-xs text-[#FF5A1F] hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {stats?.recentContacts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No inquiries yet</p>
            ) : (
              stats?.recentContacts.map(contact => (
                <div key={contact.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/[0.04] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-xs font-bold text-[#FF5A1F] shrink-0">
                    {contact.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
                      {!contact.isRead && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{contact.course || contact.email}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                    <Clock className="w-3 h-3" />
                    {timeAgo(contact.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-bold text-foreground mb-5">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'New Course', href: '/admin/courses/new', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/10' },
              { label: 'New Blog Post', href: '/admin/blog/new', icon: FileText, color: 'text-purple-400', bg: 'bg-purple-400/10' },
              { label: 'Upload Media', href: '/admin/media', icon: Eye, color: 'text-green-400', bg: 'bg-green-400/10' },
              { label: 'SEO Settings', href: '/admin/seo', icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
            ].map(({ label, href, icon: Icon, color, bg }) => (
              <Link key={label} href={href}>
                <div className="glass rounded-xl p-4 hover:bg-foreground/[0.04] transition-all group border border-border hover:border-[#FF5A1F]/30">
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
