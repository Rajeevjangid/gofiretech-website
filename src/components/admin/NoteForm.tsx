'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Save, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { slugify } from '@/lib/utils'
import RichTextEditor from '@/components/admin/RichTextEditor'
import MediaPicker from '@/components/admin/MediaPicker'

const schema = z.object({
  title:           z.string().min(3, 'Title must be at least 3 characters'),
  slug:            z.string().min(3, 'Slug required'),
  description:     z.string().optional(),
  subject:         z.string().optional(),
  category:        z.string().optional(),
  tags:            z.string().optional(),
  price:           z.string().optional(),
  originalPrice:   z.string().optional(),
  isFree:          z.boolean(),
  pageCount:       z.string().optional(),
  previewPages:    z.number().min(1).max(99),
  isPublished:     z.boolean(),
  isFeatured:      z.boolean(),
  metaTitle:       z.string().optional(),
  metaDescription: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface NoteFormProps {
  initialData?: Record<string, unknown>
  onSuccess: () => void
}

export default function NoteForm({ initialData, onSuccess }: NoteFormProps) {
  const isEditing = !!initialData
  const [saving,         setSaving]         = useState(false)
  const [thumbnail,      setThumbnail]      = useState<string>(String(initialData?.thumbnail || ''))
  const [previewContent, setPreviewContent] = useState<string>(String(initialData?.previewContent || ''))
  const [fullContent,    setFullContent]    = useState<string>(String(initialData?.fullContent   || ''))

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:           String(initialData?.title           || ''),
      slug:            String(initialData?.slug            || ''),
      description:     String(initialData?.description     || ''),
      subject:         String(initialData?.subject         || ''),
      category:        String(initialData?.category        || ''),
      tags:            String(initialData?.tags            || ''),
      price:           initialData?.price != null ? String(initialData.price) : '',
      originalPrice:   initialData?.originalPrice != null ? String(initialData.originalPrice) : '',
      isFree:          Boolean(initialData?.isFree),
      pageCount:       initialData?.pageCount != null ? String(initialData.pageCount) : '',
      previewPages:    Number(initialData?.previewPages)   || 2,
      isPublished:     Boolean(initialData?.isPublished),
      isFeatured:      Boolean(initialData?.isFeatured),
      metaTitle:       String(initialData?.metaTitle       || ''),
      metaDescription: String(initialData?.metaDescription || ''),
    },
  })

  const title   = watch('title')
  const isFree  = watch('isFree')

  // Auto-fill slug from title on create
  useEffect(() => {
    if (!isEditing && title) setValue('slug', slugify(title))
  }, [title, isEditing, setValue])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const payload = {
        ...data,
        thumbnail,
        previewContent,
        fullContent,
        price:         data.price         ? parseFloat(data.price)         : null,
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
        pageCount:     data.pageCount     ? parseInt(data.pageCount)        : null,
      }

      const url    = isEditing ? `/api/notes/${initialData!.id}` : '/api/notes'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(isEditing ? 'Note updated!' : 'Note created!')
        onSuccess()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Failed to save note')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const fieldCls = 'w-full px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50'
  const labelCls = 'block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5'
  const errCls   = 'text-xs text-red-400 mt-1'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* ── Basic Info ── */}
      <section className="glass-card rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-foreground border-b border-border pb-3">Basic Information</h2>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Title *</label>
            <input {...register('title')} placeholder="e.g. Ethical Hacking Complete Notes" className={fieldCls} />
            {errors.title && <p className={errCls}>{errors.title.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Slug (URL)</label>
            <input {...register('slug')} placeholder="auto-generated from title" className={fieldCls} />
            {errors.slug && <p className={errCls}>{errors.slug.message}</p>}
          </div>
        </div>

        <div>
          <label className={labelCls}>Short Description</label>
          <textarea {...register('description')} rows={3} placeholder="Brief description shown on the notes listing page…" className={fieldCls} />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Subject / Course</label>
            <input {...register('subject')} placeholder="e.g. Cybersecurity, AI & ML, Web Dev" className={fieldCls} />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <input {...register('category')} placeholder="e.g. Beginner, Advanced, Exam Prep" className={fieldCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Tags (comma-separated)</label>
          <input {...register('tags')} placeholder="hacking, networking, CEH" className={fieldCls} />
        </div>
      </section>

      {/* ── Cover Image ── */}
      <section className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-foreground border-b border-border pb-3">Cover / Thumbnail</h2>
        <MediaPicker value={thumbnail} onChange={v => setThumbnail(v ?? '')} />
      </section>

      {/* ── Pricing ── */}
      <section className="glass-card rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-foreground border-b border-border pb-3">Pricing</h2>

        <label className="flex items-center gap-3 cursor-pointer w-fit">
          <input type="checkbox" {...register('isFree')} className="w-4 h-4 rounded accent-primary" />
          <span className="text-sm font-medium text-foreground">This note is FREE (no payment required)</span>
        </label>

        {!isFree && (
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Price (₹)</label>
              <input {...register('price')} type="number" step="0.01" min="0" placeholder="e.g. 299" className={fieldCls} />
            </div>
            <div>
              <label className={labelCls}>Original Price (₹) — for strikethrough</label>
              <input {...register('originalPrice')} type="number" step="0.01" min="0" placeholder="e.g. 499" className={fieldCls} />
            </div>
          </div>
        )}
      </section>

      {/* ── Content ── */}
      <section className="glass-card rounded-2xl p-6 space-y-6">
        <h2 className="text-sm font-bold text-foreground border-b border-border pb-3">Content</h2>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Total Pages</label>
            <input {...register('pageCount')} type="number" min="1" placeholder="e.g. 45" className={fieldCls} />
          </div>
          <div>
            <label className={labelCls}>Free Preview Pages</label>
            <input {...register('previewPages', { valueAsNumber: true })} type="number" min="1" max="99" className={fieldCls} />
            <p className="text-[11px] text-muted-foreground mt-1">Number of preview "sections" freely visible before the paywall.</p>
          </div>
        </div>

        {/* Preview content */}
        <div>
          <label className={labelCls}>Preview Content (FREE — visible to everyone)</label>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(59,130,246,0.25)', boxShadow: '0 0 0 1px rgba(59,130,246,0.08)' }}
          >
            <div className="bg-blue-500/5 px-4 py-2 flex items-center gap-2 border-b border-blue-500/10">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs text-blue-400 font-medium">This content is publicly visible as a free preview</span>
            </div>
            <div className="p-4">
              <RichTextEditor value={previewContent} onChange={setPreviewContent} placeholder="Add the free preview section of the notes…" />
            </div>
          </div>
        </div>

        {/* Paid / full content */}
        <div>
          <label className={labelCls}>Full / Paid Content (🔒 server-gated — only delivered after payment)</label>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(232,0,28,0.20)', boxShadow: '0 0 0 1px rgba(232,0,28,0.06)' }}
          >
            <div className="bg-red-500/5 px-4 py-2 flex items-center gap-2 border-b border-red-500/10">
              <Info className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs text-red-400 font-medium">This content is NEVER sent to users who haven&apos;t purchased</span>
            </div>
            <div className="p-4">
              <RichTextEditor value={fullContent} onChange={setFullContent} placeholder="Add the complete paid notes content…" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Visibility & SEO ── */}
      <section className="glass-card rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-foreground border-b border-border pb-3">Visibility & SEO</h2>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('isPublished')} className="w-4 h-4 rounded accent-primary" />
            <span className="text-sm text-foreground">Published (visible on website)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('isFeatured')} className="w-4 h-4 rounded accent-primary" />
            <span className="text-sm text-foreground">Featured</span>
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Meta Title</label>
            <input {...register('metaTitle')} placeholder="SEO title (defaults to note title)" className={fieldCls} />
          </div>
          <div>
            <label className={labelCls}>Meta Description</label>
            <input {...register('metaDescription')} placeholder="SEO description" className={fieldCls} />
          </div>
        </div>
      </section>

      {/* ── Submit ── */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-foreground disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#E8001C,#c50018)', boxShadow: '0 2px 8px rgba(232,0,28,0.25)' }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : isEditing ? 'Update Note' : 'Create Note'}
        </button>
      </div>
    </form>
  )
}
