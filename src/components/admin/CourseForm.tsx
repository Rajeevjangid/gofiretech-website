'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { slugify } from '@/lib/utils'
import RichTextEditor from '@/components/admin/RichTextEditor'
import MediaPicker from '@/components/admin/MediaPicker'

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3),
  description: z.string().min(10),
  price: z.string().optional(),
  originalPrice: z.string().optional(),
  duration: z.string().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  category: z.string().optional(),
  tags: z.string().optional(),
  instructor: z.string().optional(),
  instructorBio: z.string().optional(),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface CourseFormProps {
  initialData?: any
  onSuccess: () => void
}

export default function CourseForm({ initialData, onSuccess }: CourseFormProps) {
  const isEditing = !!initialData
  const [saving, setSaving] = useState(false)
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || '')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      price: initialData?.price?.toString() || '',
      originalPrice: initialData?.originalPrice?.toString() || '',
      duration: initialData?.duration || '',
      level: initialData?.level || 'BEGINNER',
      category: initialData?.category || '',
      tags: initialData?.tags || '',
      instructor: initialData?.instructor || '',
      instructorBio: initialData?.instructorBio || '',
      isFeatured: initialData?.isFeatured || false,
      isPublished: initialData?.isPublished || false,
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

    // price and originalPrice come from <input type="number"> as strings.
    // The backend schema expects z.number(), so convert before sending.
    const payload = {
      ...data,
      thumbnail,
      price: data.price !== '' && data.price !== undefined
        ? Number(data.price)
        : undefined,
      originalPrice: data.originalPrice !== '' && data.originalPrice !== undefined
        ? Number(data.originalPrice)
        : undefined,
    }

    const url = isEditing ? `/api/courses/${initialData.id}` : '/api/courses'
    const method = isEditing ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success(isEditing ? 'Course updated!' : 'Course created!')
        onSuccess()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to save course')
      }
    } catch {
      toast.error('Network error')
    }
    setSaving(false)
  }

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )

  const inputClass = "w-full h-11 px-4 rounded-xl border border-input bg-input/50 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#FF5A1F] transition-colors"
  const textareaClass = "w-full px-4 py-3 rounded-xl border border-input bg-input/50 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#FF5A1F] resize-none transition-colors"

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-foreground">Course Details</h2>

            <Field label="Course Title *" error={errors.title?.message}>
              <input {...register('title')} className={inputClass} placeholder="e.g., Ethical Hacking & Cybersecurity" />
            </Field>

            <Field label="Slug" error={errors.slug?.message}>
              <input {...register('slug')} className={inputClass} placeholder="e.g., ethical-hacking-cybersecurity" />
            </Field>

            <Field label="Description *" error={errors.description?.message}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="A compelling description of what students will learn..."
                  />
                )}
              />
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Level">
                <select {...register('level')} className={inputClass}>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </Field>
              <Field label="Duration">
                <input {...register('duration')} className={inputClass} placeholder="e.g., 12 Weeks" />
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Category">
                <input {...register('category')} className={inputClass} placeholder="e.g., Cybersecurity" />
              </Field>
              <Field label="Tags (comma-separated)">
                <input {...register('tags')} className={inputClass} placeholder="hacking, security, CEH" />
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Price (₹)">
                <input {...register('price')} type="number" className={inputClass} placeholder="39999" />
              </Field>
              <Field label="Original Price (₹)">
                <input {...register('originalPrice')} type="number" className={inputClass} placeholder="59999" />
              </Field>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-foreground">Instructor</h2>
            <Field label="Instructor Name">
              <input {...register('instructor')} className={inputClass} placeholder="Full name" />
            </Field>
            <Field label="Instructor Bio">
              <textarea {...register('instructorBio')} rows={3} className={textareaClass} placeholder="Short bio..." />
            </Field>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-foreground">SEO</h2>
            <Field label="Meta Title">
              <input {...register('metaTitle')} className={inputClass} placeholder="SEO title (50-60 chars)" />
            </Field>
            <Field label="Meta Description">
              <textarea {...register('metaDescription')} rows={3} className={textareaClass} placeholder="SEO description (150-160 chars)" />
            </Field>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold text-foreground">Publish</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register('isPublished')} className="w-4 h-4 rounded border border-border accent-[#FF5A1F]" />
              <span className="text-sm text-foreground">Publish course</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register('isFeatured')} className="w-4 h-4 rounded border border-border accent-[#FF5A1F]" />
              <span className="text-sm text-foreground">Feature on homepage</span>
            </label>
            <button type="submit" disabled={saving}
              className="w-full btn-gf-primary py-2.5 rounded-xl text-sm font-semibold relative overflow-hidden disabled:opacity-70 flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin relative z-10" /><span className="relative z-10">Saving...</span></> : <><Save className="w-4 h-4 relative z-10" /><span className="relative z-10">{isEditing ? 'Update Course' : 'Create Course'}</span></>}
            </button>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <MediaPicker
              label="Thumbnail"
              value={thumbnail || null}
              onChange={url => setThumbnail(url ?? '')}
            />
          </div>
        </div>
      </div>
    </form>
  )
}
