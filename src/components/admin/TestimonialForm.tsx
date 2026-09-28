'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Save, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import MediaPicker from '@/components/admin/MediaPicker'

const schema = z.object({
  name:       z.string().min(2, 'Name is required'),
  role:       z.string().optional(),
  company:    z.string().optional(),
  content:    z.string().min(10, 'Testimonial content is required'),
  rating:     z.number().min(1).max(5),
  isPublished: z.boolean(),
  order:      z.number().min(0),
})

type FormData = z.infer<typeof schema>

interface TestimonialFormProps {
  initialData?: any
  onSuccess: () => void
}

export default function TestimonialForm({ initialData, onSuccess }: TestimonialFormProps) {
  const isEditing = !!initialData
  const [saving, setSaving]   = useState(false)
  const [image, setImage]     = useState<string>(initialData?.image || '')
  const [hoveredStar, setHoveredStar] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:        initialData?.name        || '',
      role:        initialData?.role        || '',
      company:     initialData?.company     || '',
      content:     initialData?.content     || '',
      rating:      initialData?.rating      || 5,
      isPublished: initialData?.isPublished ?? true,
      order:       initialData?.order       || 0,
    },
  })

  const rating = watch('rating')

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    const payload = { ...data, image: image || null }
    const url    = isEditing ? `/api/admin/testimonials/${initialData.id}` : '/api/admin/testimonials'
    const method = isEditing ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success(isEditing ? 'Testimonial updated!' : 'Testimonial created!')
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

  const inputClass     = 'w-full h-11 px-4 rounded-xl border border-input bg-input/50 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#FF5A1F] transition-colors'
  const textareaClass  = 'w-full px-4 py-3 rounded-xl border border-input bg-input/50 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#FF5A1F] resize-none transition-colors'
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

        {/* ── Main content ───────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-white">Testimonial Details</h2>

            <Field label="Full Name *" error={errors.name?.message}>
              <input {...register('name')} className={inputClass} placeholder="e.g., Ravi Sharma" />
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Role / Position">
                <input {...register('role')} className={inputClass} placeholder="e.g., Software Engineer" />
              </Field>
              <Field label="Company">
                <input {...register('company')} className={inputClass} placeholder="e.g., TCS, Infosys" />
              </Field>
            </div>

            <Field label="Testimonial *" error={errors.content?.message}>
              <textarea
                {...register('content')}
                rows={5}
                className={textareaClass}
                placeholder="What did they say about GoFire Tech?..."
              />
            </Field>

            {/* Star rating */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setValue('rating', star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= (hoveredStar || rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sidebar ────────────────────────────── */}
        <div className="space-y-5">
          {/* Publish */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold text-white">Settings</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register('isPublished')} className="w-4 h-4 rounded accent-[#FF5A1F]" />
              <span className="text-sm text-foreground">Publish testimonial</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Display Order</label>
              <input
                {...register('order', { valueAsNumber: true })}
                type="number"
                min={0}
                className={inputClass}
                placeholder="0"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full btn-gf-primary py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving…</span></>
                : <><Save className="w-4 h-4" /><span>{isEditing ? 'Update' : 'Add Testimonial'}</span></>}
            </button>
          </div>

          {/* Profile Image */}
          <div className="glass-card rounded-2xl p-5">
            <MediaPicker
              label="Profile Photo"
              value={image || null}
              onChange={url => setImage(url ?? '')}
            />
          </div>
        </div>
      </div>
    </form>
  )
}
