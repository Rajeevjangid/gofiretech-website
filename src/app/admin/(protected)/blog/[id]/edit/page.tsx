'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import BlogForm from '@/components/admin/BlogForm'

export default function EditBlogPage() {
  const router = useRouter()
  const params = useParams()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/blog/${params.id}?admin=true`)
      .then(r => r.json())
      .then(data => setPost(data))
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
        <h1 className="text-2xl font-extrabold text-foreground">Edit Blog Post</h1>
        <p className="text-muted-foreground text-sm mt-1">Update article content and metadata</p>
      </div>
      {post && (
        <BlogForm
          initialData={post}
          onSuccess={() => router.push('/admin/blog')}
        />
      )}
    </div>
  )
}
