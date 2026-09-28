'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import CourseForm from '@/components/admin/CourseForm'

export default function EditCoursePage() {
  const router = useRouter()
  const params = useParams()
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/courses/${params.id}?admin=true`)
      .then(r => r.json())
      .then(data => setCourse(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF5A1F]" />
      </div>
    )
  }

  return (
    <div className="page-transition space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Edit Course</h1>
        <p className="text-muted-foreground text-sm mt-1">Update course details and content</p>
      </div>
      {course && (
        <CourseForm
          initialData={course}
          onSuccess={() => router.push('/admin/courses')}
        />
      )}
    </div>
  )
}
