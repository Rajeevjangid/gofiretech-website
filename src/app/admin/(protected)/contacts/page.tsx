'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, X, Loader2, Mail, Phone, BookOpen, Clock, CheckCircle2, Trash2 } from 'lucide-react'
import { formatDate, timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Contact {
  id: string; name: string; email: string; phone?: string | null
  course?: string | null; message: string; isRead: boolean; createdAt: string
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Contact | null>(null)

  const fetchContacts = () => {
    setLoading(true)
    fetch('/api/contact?limit=100')
      .then(r => r.json())
      .then(data => setContacts(data.submissions || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchContacts() }, [])

  const markAsRead = async (id: string) => {
    await fetch(`/api/contact/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: true }),
    })
    setContacts(prev => prev.map(c => c.id === id ? { ...c, isRead: true } : c))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, isRead: true } : null)
    toast.success('Marked as read')
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete inquiry from "${name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Inquiry deleted')
      setContacts(prev => prev.filter(c => c.id !== id))
      if (selected?.id === id) setSelected(null)
    } else {
      toast.error('Failed to delete')
    }
  }

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.course?.toLowerCase().includes(search.toLowerCase())
  )

  const unread = contacts.filter(c => !c.isRead).length

  return (
    <div className="page-transition space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Inquiries</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {contacts.length} total {unread > 0 && <span className="text-[#FF5A1F] font-semibold">• {unread} unread</span>}
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or course..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-input/50 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#FF5A1F] transition-colors"
        />
        {search && <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-muted-foreground" /></button>}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-[#FF5A1F]" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">No inquiries yet</p>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((contact, i) => (
                <motion.button key={contact.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  onClick={() => setSelected(contact)}
                  className={`w-full text-left p-4 hover:bg-foreground/[0.04] transition-colors ${
                    selected?.id === contact.id ? 'bg-foreground/[0.04]' : ''
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-sm font-bold text-[#FF5A1F] shrink-0">
                      {contact.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
                        {!contact.isRead && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{contact.course || contact.email}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(contact.createdAt)}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selected.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{formatDate(selected.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  {!selected.isRead && (
                    <button onClick={() => markAsRead(selected.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400 hover:bg-green-500/20 transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Read
                    </button>
                  )}
                  <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-foreground/[0.04]">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail className="w-4 h-4 text-[#FF5A1F]" />
                  <a href={`mailto:${selected.email}`} className="text-foreground hover:text-[#FF5A1F] transition-colors">{selected.email}</a>
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <Phone className="w-4 h-4 text-[#FF5A1F]" />
                    <a href={`tel:${selected.phone}`} className="text-foreground">{selected.phone}</a>
                  </div>
                )}
                {selected.course && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <BookOpen className="w-4 h-4 text-[#FF5A1F]" />
                    <span className="text-foreground">{selected.course}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-sm">
                  <Clock className="w-4 h-4 text-[#FF5A1F]" />
                  <span className="text-muted-foreground">{timeAgo(selected.createdAt)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-3">Message</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <a href={`mailto:${selected.email}`}
                  className="flex-1 btn-gf-primary text-center py-2.5 rounded-xl text-sm font-semibold relative overflow-hidden">
                  <span className="relative z-10">Reply via Email</span>
                </a>
                {selected.phone && (
                  <a href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors">
                    WhatsApp
                  </a>
                )}
                <button
                  onClick={() => handleDelete(selected.id, selected.name)}
                  className="px-3 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete inquiry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (

            <div className="glass-card rounded-2xl p-6 h-full flex items-center justify-center">
              <p className="text-muted-foreground">Select an inquiry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
