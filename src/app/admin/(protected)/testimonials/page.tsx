'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Loader2, Pencil, Trash2, Star,
  Eye, EyeOff, User,
} from 'lucide-react'
import toast from 'react-hot-toast'
import TestimonialForm from '@/components/admin/TestimonialForm'

interface Testimonial {
  id: string
  name: string
  role: string | null
  company: string | null
  image: string | null
  content: string
  rating: number
  isPublished: boolean
  order: number
  createdAt: string
}

type View = 'list' | 'new' | 'edit'

export default function AdminTestimonialsPage() {
  const [items, setItems]     = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView]       = useState<View>('list')
  const [editing, setEditing] = useState<Testimonial | null>(null)

  const fetchAll = () => {
    setLoading(true)
    fetch('/api/admin/testimonials')
      .then(r => r.json())
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load testimonials'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete testimonial by "${name}"?`)) return
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Testimonial deleted')
      setItems(prev => prev.filter(t => t.id !== id))
    } else {
      toast.error('Delete failed')
    }
  }

  const handleTogglePublish = async (item: Testimonial) => {
    const res = await fetch(`/api/admin/testimonials/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, isPublished: !item.isPublished }),
    })
    if (res.ok) {
      toast.success(item.isPublished ? 'Hidden' : 'Published')
      setItems(prev =>
        prev.map(t => t.id === item.id ? { ...t, isPublished: !t.isPublished } : t),
      )
    } else {
      toast.error('Update failed')
    }
  }

  const openEdit = (item: Testimonial) => {
    setEditing(item)
    setView('edit')
  }

  const onFormSuccess = () => {
    fetchAll()
    setView('list')
    setEditing(null)
  }

  if (view === 'new' || view === 'edit') {
    return (
      <div className="page-transition space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setView('list'); setEditing(null) }}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
          >
            ← Back to Testimonials
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {view === 'new' ? 'Add Testimonial' : 'Edit Testimonial'}
          </h1>
        </div>
        <TestimonialForm
          initialData={view === 'edit' ? editing : undefined}
          onSuccess={onFormSuccess}
        />
      </div>
    )
  }

  return (
    <div className="page-transition space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Testimonials</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {items.length} testimonial{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setView('new')}
          className="btn-gf-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF5A1F]" />
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <p className="text-foreground font-medium">No testimonials yet</p>
          <p className="text-muted-foreground text-sm mt-1">Add your first testimonial to get started</p>
          <button
            onClick={() => setView('new')}
            className="mt-5 btn-gf-primary px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Testimonial
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence initial={false}>
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.18, delay: i * 0.03 }}
                className="glass-card rounded-2xl p-5 flex flex-col gap-4"
              >
                {/* Person */}
                <div className="flex items-start gap-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-full object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-surface-2 border border-border flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{item.name}</p>
                    {(item.role || item.company) && (
                      <p className="text-xs text-muted-foreground truncate">
                        {[item.role, item.company].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {/* Stars */}
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${s <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Status badge */}
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    item.isPublished
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-border bg-surface-2 text-muted-foreground'
                  }`}>
                    {item.isPublished ? 'Published' : 'Hidden'}
                  </span>
                </div>

                {/* Content */}
                <p className="text-sm text-muted-foreground line-clamp-3 italic">
                  "{item.content}"
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-border">
                  <button
                    onClick={() => openEdit(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground hover:text-foreground border border-border hover:border-foreground/20 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleTogglePublish(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground hover:text-foreground border border-border hover:border-foreground/20 transition-colors"
                  >
                    {item.isPublished
                      ? <><EyeOff className="w-3.5 h-3.5" /> Hide</>
                      : <><Eye className="w-3.5 h-3.5" /> Publish</>}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
