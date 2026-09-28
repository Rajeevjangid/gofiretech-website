'use client'

import { useRouter } from 'next/navigation'
import CourseForm from '@/components/admin/CourseForm'

export default function NewCoursePage() {
  const router = useRouter()

  return (
    <div className="page-transition space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">New Course</h1>
        <p className="text-muted-foreground text-sm mt-1">Create a new course to publish on GoFire Tech</p>
      </div>
      <CourseForm onSuccess={() => router.push('/admin/courses')} />
    </div>
  )
}
