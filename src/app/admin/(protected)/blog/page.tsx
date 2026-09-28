'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Loader2, X, Clock } from 'lucide-react'
import { timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

interface BlogPost {
  id: string; title: string; slug: string; category?: string | null
  isPublished: boolean; isFeatured: boolean; readTime: number
  views: number; authorName?: string | null; createdAt: string
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchPosts = () => {
    setLoading(true)
    fetch('/api/blog?all=true&limit=100')
      .then(r => r.json())
      .then(data => setPosts(data.posts || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPosts() }, [])

  const togglePublish = async (id: string, current: boolean) => {
    await fetch(`/api/blog/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !current }),
    })
    toast.success(current ? 'Post unpublished' : 'Post published')
    fetchPosts()
  }

  const deletePost = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return
    setDeleting(id)
    await fetch(`/api/blog/${id}`, { method: 'DELETE' })
    toast.success('Post deleted')
    fetchPosts()
    setDeleting(null)
  }

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-transition space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Blog Posts</h1>
          <p className="text-muted-foreground text-sm mt-1">{posts.length} total posts</p>
        </div>
        <Link href="/admin/blog/new"
          className="btn-gf-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold relative overflow-hidden">
          <Plus className="w-4 h-4 relative z-10" />
          <span className="relative z-10">New Post</span>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search posts..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-input/50 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#FF5A1F] transition-colors"
        />
        {search && <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-muted-foreground" /></button>}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF5A1F]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No posts found.</p>
            <Link href="/admin/blog/new" className="text-[#FF5A1F] text-sm mt-2 inline-block hover:underline">Create your first post →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Title', 'Category', 'Author', 'Status', 'Views', 'Created', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((post, i) => (
                  <motion.tr key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-foreground/[0.03] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2">
                        <div>
                          <p className="font-medium text-sm text-foreground line-clamp-1">{post.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />{post.readTime} min read
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><span className="text-xs text-muted-foreground">{post.category}</span></td>
                    <td className="px-5 py-4"><span className="text-xs text-muted-foreground">{post.authorName}</span></td>
                    <td className="px-5 py-4">
                      <button onClick={() => togglePublish(post.id, post.isPublished)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          post.isPublished
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-secondary border-border text-muted-foreground'
                        }`}>
                        {post.isPublished ? <><Eye className="w-3 h-3" />Published</> : <><EyeOff className="w-3 h-3" />Draft</>}
                      </button>
                    </td>
                    <td className="px-5 py-4"><span className="text-sm text-muted-foreground">{post.views.toLocaleString()}</span></td>
                    <td className="px-5 py-4"><span className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</span></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/blog/${post.id}/edit`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-foreground/[0.04] transition-colors">
                          <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Link>
                        <button onClick={() => deletePost(post.id, post.title)}
                          disabled={deleting === post.id}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors">
                          {deleting === post.id
                            ? <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                            : <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-400" />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
