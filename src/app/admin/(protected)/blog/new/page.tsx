'use client'

import { useRouter } from 'next/navigation'
import BlogForm from '@/components/admin/BlogForm'

export default function NewBlogPage() {
  const router = useRouter()

  return (
    <div className="page-transition space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">New Blog Post</h1>
        <p className="text-muted-foreground text-sm mt-1">Write a new article for the GoFire Tech blog</p>
      </div>
      <BlogForm onSuccess={() => router.push('/admin/blog')} />
    </div>
  )
}
