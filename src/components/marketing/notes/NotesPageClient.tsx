'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, BookOpen, Lock, Tag, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Note {
  id: string; slug: string; title: string; description: string | null
  thumbnail: string | null; price: number | null; originalPrice: number | null
  isFree: boolean; subject: string | null; category: string | null
  pageCount: number | null; isFeatured: boolean
}

const card = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

export default function NotesPageClient() {
  const [notes,          setNotes]          = useState<Note[]>([])
  const [activeSubject,  setActiveSubject]  = useState('All')
  const [searchQuery,    setSearchQuery]    = useState('')
  const [loading,        setLoading]        = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/notes?limit=60')
      .then(r => r.json())
      .then(d => { if (d.notes?.length) setNotes(d.notes) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const subjects = ['All', ...Array.from(new Set(notes.map(n => n.subject).filter(Boolean))) as string[]]

  const filtered = notes.filter(n => {
    const matchSubject = activeSubject === 'All' || n.subject === activeSubject
    const matchSearch  = !searchQuery ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchSubject && matchSearch
  })

  const featured = notes.find(n => n.isFeatured)

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ── */}
      <div className="relative pt-32 pb-16 border-b border-border overflow-hidden">
        <div className="absolute inset-0 grid-dots opacity-[0.22]" />
        <div className="container-gf relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="badge-gf mb-4">GoFire Tech Notes</div>
            {/* FIX: text-white → text-foreground so "Study notes for" is visible in light mode */}
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">
              Study notes for{' '}
              <span className="text-gradient-red">every tech course</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Concise, well-structured notes prepared by industry experts. Preview for free, unlock the full content instantly.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-gf py-12">

        {/* ── Featured note ── */}
        {featured && !searchQuery && activeSubject === 'All' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mb-10 rounded-2xl overflow-hidden border border-border group bg-card"
          >
            <div className="grid md:grid-cols-2">
              {featured.thumbnail && (
                <div className="h-56 md:h-auto overflow-hidden">
                  <img
                    src={featured.thumbnail} alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              )}
              <div className="p-8 flex flex-col justify-center">
                <div className="badge-gf mb-3 w-fit">Featured Note</div>
                {featured.subject && (
                  <span className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {featured.subject}
                  </span>
                )}
                {/* FIX: text-white → text-foreground so title is visible in light mode */}
                <h2 className="text-2xl font-bold text-foreground mb-3">{featured.title}</h2>
                {featured.description && (
                  <p className="text-muted-foreground text-sm mb-5 line-clamp-3">{featured.description}</p>
                )}
                <div className="flex items-center gap-4 mb-6">
                  {featured.isFree ? (
                    <span className="text-emerald-500 font-bold text-lg">Free</span>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      {/* FIX: text-white → text-foreground */}
                      <span className="text-foreground font-bold text-xl">
                        {featured.price ? formatCurrency(Number(featured.price)) : 'Paid'}
                      </span>
                      {featured.originalPrice && (
                        <span className="text-muted-foreground line-through text-sm">
                          {formatCurrency(Number(featured.originalPrice))}
                        </span>
                      )}
                    </div>
                  )}
                  {featured.pageCount && (
                    <span className="text-xs text-muted-foreground">{featured.pageCount} pages</span>
                  )}
                </div>
                <Link
                  href={`/notes/${featured.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white w-fit"
                  style={{ background: 'linear-gradient(135deg,#E8001C,#c50018)', boxShadow: '0 2px 10px rgba(232,0,28,0.30)' }}
                >
                  <BookOpen className="w-4 h-4" />
                  {featured.isFree ? 'Read Notes' : 'Preview Notes'}
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Filters + Search ── */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Subject pills */}
          <div className="flex flex-wrap gap-2 flex-1">
            {subjects.map(s => (
              <button
                key={s}
                onClick={() => setActiveSubject(s)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  activeSubject === s
                    ? 'bg-[#E8001C] text-white shadow-[0_0_12px_rgba(232,0,28,0.35)]'
                    // FIX: hover:text-white hover:bg-white/5 → hover:text-foreground hover:bg-foreground/[0.06]
                    : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] border border-border'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notes…"
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* ── Notes Grid ── */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              // FIX: bg-white/5 → bg-foreground/[0.05] for visible skeletons in light mode
              <div key={i} className="rounded-2xl border border-border overflow-hidden animate-pulse bg-card">
                <div className="h-44 bg-foreground/[0.05]" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-foreground/[0.05] rounded w-3/4" />
                  <div className="h-3 bg-foreground/[0.05] rounded w-full" />
                  <div className="h-3 bg-foreground/[0.05] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            {/* FIX: text-white → text-foreground */}
            <p className="text-foreground font-semibold text-lg mb-2">
              {searchQuery ? 'No notes match your search' : 'No notes available yet'}
            </p>
            <p className="text-muted-foreground text-sm">Check back soon for new study material.</p>
          </div>
        ) : (
          <motion.div
            initial="initial" animate="animate"
            variants={{ animate: { transition: { staggerChildren: 0.07 } } }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map(note => (
              <motion.div key={note.id} variants={card}>
                <Link
                  href={`/notes/${note.slug}`}
                  // FIX: rgba(255,255,255,0.02) → bg-card for visible card surface in light mode
                  className="group flex flex-col h-full rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 bg-card"
                >
                  {/* Cover */}
                  {note.thumbnail ? (
                    <div className="h-44 overflow-hidden">
                      <img
                        src={note.thumbnail} alt={note.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  ) : (
                    <div className="h-44 flex items-center justify-center"
                      style={{ background: 'rgba(232,0,28,0.06)' }}>
                      <BookOpen className="w-10 h-10 text-red-400/40" />
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    {/* Subject tag */}
                    {note.subject && (
                      <span className="text-[10px] font-semibold text-primary/80 uppercase tracking-widest mb-2">
                        {note.subject}
                      </span>
                    )}

                    {/* Title — FIX: text-white → text-foreground */}
                    <h3 className="font-bold text-foreground text-sm leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {note.title}
                    </h3>

                    {/* Description */}
                    {note.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
                        {note.description}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between">
                      {/* Price */}
                      {note.isFree ? (
                        <span className="text-sm font-bold text-emerald-500">Free</span>
                      ) : (
                        <div className="flex items-baseline gap-1.5">
                          {/* FIX: text-white → text-foreground */}
                          <span className="text-sm font-bold text-foreground">
                            {note.price ? formatCurrency(Number(note.price)) : 'Paid'}
                          </span>
                          {note.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatCurrency(Number(note.originalPrice))}
                            </span>
                          )}
                        </div>
                      )}

                      {/* CTA */}
                      <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                        {note.isFree
                          ? <><BookOpen className="w-3 h-3" /> Read</>
                          : <><Lock className="w-3 h-3" /> Preview</>
                        }
                      </span>
                    </div>

                    {/* Pages pill */}
                    {note.pageCount && (
                      <p className="text-[10px] text-muted-foreground mt-2">{note.pageCount} pages</p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
