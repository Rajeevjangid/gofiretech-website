'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { slugify } from '@/lib/utils'
import MediaPicker from '@/components/admin/MediaPicker'

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  excerpt: z.string().optional(),
  content: z.string().min(10, 'Content is required'),
  category: z.string().optional(),
  tags: z.string().optional(),
  authorName: z.string().optional(),
  readTime: z.number().min(1),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface BlogFormProps {
  initialData?: any
  onSuccess: () => void
}

export default function BlogForm({ initialData, onSuccess }: BlogFormProps) {
  const isEditing = !!initialData
  const [saving, setSaving] = useState(false)
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || '')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      excerpt: initialData?.excerpt || '',
      content: initialData?.content || '',
      category: initialData?.category || '',
      tags: initialData?.tags || '',
      authorName: initialData?.authorName || 'GoFire Tech',
      readTime: initialData?.readTime || 5,
      isPublished: initialData?.isPublished || false,
      isFeatured: initialData?.isFeatured || false,
      metaTitle: initialData?.metaTitle || '',
      metaDescription: initialData?.metaDescription || '',
    },
  })

  const title = watch('title')
  useEffect(() => {
    if (!isEditing && title) {
      setValue('slug', slugify(title))
    }
  }, [title, isEditing, setValue])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    const payload = { ...data, thumbnail }
    const url = isEditing ? `/api/blog/${initialData.id}` : '/api/blog'
    const method = isEditing ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success(isEditing ? 'Post updated!' : 'Post created!')
        onSuccess()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to save')
      }
    } catch {
      toast.error('Network error')
    }
    setSaving(false)
  }

  const inputClass = "w-full h-11 px-4 rounded-xl border border-input bg-input/50 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#FF5A1F] transition-colors"
  const textareaClass = "w-full px-4 py-3 rounded-xl border border-input bg-input/50 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#FF5A1F] resize-none transition-colors"
  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-foreground">Post Details</h2>

            <Field label="Title *" error={errors.title?.message}>
              <input {...register('title')} className={inputClass} placeholder="Post title" />
            </Field>

            <Field label="Slug">
              <input {...register('slug')} className={inputClass} placeholder="post-slug" />
            </Field>

            <Field label="Excerpt">
              <textarea {...register('excerpt')} rows={3} className={textareaClass} placeholder="Brief summary shown in card views..." />
            </Field>

            <Field label="Content (HTML/Markdown) *" error={errors.content?.message}>
              <textarea {...register('content')} rows={16} className={textareaClass} placeholder="Write your full blog post content here. HTML supported." />
            </Field>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-foreground">SEO</h2>
            <Field label="Meta Title">
              <input {...register('metaTitle')} className={inputClass} placeholder="SEO title" />
            </Field>
            <Field label="Meta Description">
              <textarea {...register('metaDescription')} rows={3} className={textareaClass} placeholder="SEO description" />
            </Field>
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold text-foreground">Publish</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register('isPublished')} className="w-4 h-4 rounded accent-[#FF5A1F]" />
              <span className="text-sm text-foreground">Publish post</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register('isFeatured')} className="w-4 h-4 rounded accent-[#FF5A1F]" />
              <span className="text-sm text-foreground">Feature post</span>
            </label>
            <button type="submit" disabled={saving}
              className="w-full btn-gf-primary py-2.5 rounded-xl text-sm font-semibold relative overflow-hidden disabled:opacity-70 flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin relative z-10" /><span className="relative z-10">Saving...</span></> : <><Save className="w-4 h-4 relative z-10" /><span className="relative z-10">{isEditing ? 'Update Post' : 'Publish Post'}</span></>}
            </button>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold text-foreground">Meta</h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
              <input {...register('category')} className={inputClass} placeholder="e.g., Cybersecurity" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Tags</label>
              <input {...register('tags')} className={inputClass} placeholder="tag1, tag2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Author</label>
              <input {...register('authorName')} className={inputClass} placeholder="Author name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Read Time (mins)</label>
              <input {...register('readTime', { valueAsNumber: true })} type="number" min={1} max={60} className={inputClass} />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <MediaPicker
              label="Feature Image"
              value={thumbnail || null}
              onChange={url => setThumbnail(url ?? '')}
            />
          </div>
        </div>
      </div>
    </form>
  )
}
