'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Clock, Eye, ArrowRight, Tag, X } from 'lucide-react'
import { formatDateShort, timeAgo } from '@/lib/utils'

export default function BlogPageClient() {
  const [posts, setPosts] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/blog?limit=50')
      .then(r => r.json())
      .then(data => { if (data.posts?.length > 0) setPosts(data.posts) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const featured = posts.find(p => p.isFeatured)

  // Derive categories dynamically from real data + 'All' sentinel
  const categories = ['All', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))]

  const filtered = posts.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory
    const matchSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative pt-32 pb-16 border-b border-border overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="container-gf relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="badge-gf mb-4">GoFire Tech Blog</div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">
              Tech career{' '}
              <span className="text-gradient">insights & tutorials</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Industry experts share practical knowledge. No fluff, no clickbait — just signal.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-gf py-10">
        {/* Featured Post */}
        {featured && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <Link href={`/blog/${featured.slug}`} className="group block">
              <div className="glass-card rounded-2xl overflow-hidden card-hover">
                <div className="grid md:grid-cols-5">
                  <div className="md:col-span-2 bg-gradient-to-br from-[#0d1520] to-[#1a0f0a] h-56 md:h-auto flex items-center justify-center overflow-hidden">
                    {featured.thumbnail
                      ? <img src={featured.thumbnail} alt={featured.title} className="w-full h-full object-cover" />
                      : <div className="text-6xl">📰</div>
                    }
                  </div>
                  <div className="md:col-span-3 p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="badge-gf">Featured</span>
                      {featured.category && (
                        <span className="text-xs text-muted-foreground">{featured.category}</span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-[#FF5A1F] transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{featured.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{featured.readTime} min read</span>
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{featured.views?.toLocaleString()} views</span>
                      {featured.publishedAt && <span>{formatDateShort(featured.publishedAt)}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-input/50 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#FF5A1F] transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-[#FF5A1F] text-white shadow-glow-sm'
                    : 'border border-border text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/blog/${post.slug}`} className="group block h-full">
                <div className="glass-card rounded-2xl overflow-hidden card-hover h-full flex flex-col">
                  <div className="h-44 bg-gradient-to-br from-[#0d1520] to-[#111827] flex items-center justify-center">
                    {post.thumbnail
                      ? <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                      : <span className="text-4xl opacity-60">
                          {post.category === 'Cybersecurity' ? '🔐' : post.category === 'Artificial Intelligence' ? '🤖' : post.category === 'Web Development' ? '💻' : '📝'}
                        </span>
                    }
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      {post.category && (
                        <span className="text-xs font-semibold text-[#FF5A1F] bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full">
                          {post.category}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-foreground mb-2 group-hover:text-[#FF5A1F] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime} min</span>
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{(post.views || 0).toLocaleString()}</span>
                      </div>
                      <span className="flex items-center gap-1 text-[#FF5A1F] font-medium group-hover:gap-2 transition-all">
                        Read <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No articles found. Try a different search.</p>
          </div>
        )}
      </div>
    </div>
  )
}
