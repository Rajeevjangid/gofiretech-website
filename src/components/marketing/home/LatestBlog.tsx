'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Clock, Eye } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'

interface BlogPost {
  id: string; slug: string; title: string; excerpt: string | null;
  thumbnail: string | null; category: string | null; readTime: number;
  views: number; publishedAt: string | null; authorName: string | null;
  isFeatured: boolean;
}

const EMOJI_MAP: Record<string, string> = {
  'Cybersecurity':        '🔐',
  'Artificial Intelligence': '🤖',
  'Web Development':      '💻',
  'Career':               '🚀',
  'Cloud':                '☁️',
}

const container = { animate: { transition: { staggerChildren: 0.08 } } }
const card = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

export default function LatestBlog() {
  const [posts, setPosts]   = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blog?limit=3')
      .then(r => r.json())
      .then(data => setPosts(data.posts ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Don't render the section at all if no posts and done loading
  if (!loading && posts.length === 0) return null

  return (
    <section className="section">
      <div className="container-pad">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="flex flex-col md:flex-row md:items-end gap-6 mb-14"
        >
          <div className="flex-1">
            <div className="label-tag mb-3">Blog</div>
            <h2 className="text-headline text-foreground">
              Latest Insights &<br />Tutorials
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-medium shrink-0 transition-all duration-200 border border-border text-muted-foreground"
            
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = 'hsl(var(--border))'
              el.style.color = 'hsl(var(--foreground))'
              el.style.background = 'hsl(var(--surface-2))'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = 'hsl(var(--border-subtle))'
              el.style.color = 'hsl(var(--muted-foreground))'
              el.style.background = 'transparent'
            }}
          >
            View All Articles <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={container}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-5"
        >
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <motion.div key={i} variants={card}>
                  <div
                    className="rounded-2xl overflow-hidden animate-pulse section-card rounded-xl"
                     style={{ height: 300 }}
                  />
                </motion.div>
              ))
            : posts.map(post => (
                <motion.div key={post.id} variants={card}>
                  <Link href={`/blog/${post.slug}`} className="block group h-full">
                    <article
                      className="relative h-full rounded-2xl overflow-hidden transition-all duration-300 flex flex-col"
                      style={{
                        background: 'hsl(214 28% 7%)',
                        border: post.isFeatured
                          ? '1px solid rgba(255,90,31,0.22)'
                          : '1px solid rgba(255,255,255,0.07)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement
                        el.style.transform = 'translateY(-3px)'
                        el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.22), 0 1px 0 hsl(var(--border))'
                        el.style.borderColor = 'hsl(var(--border))'
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement
                        el.style.transform = 'translateY(0)'
                        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)'
                        el.style.borderColor = post.isFeatured
                          ? 'rgba(255,90,31,0.22)'
                          : 'hsl(var(--border))'
                      }}
                    >
                      {/* Thumbnail */}
                      <div
                        className="h-44 flex items-center justify-center overflow-hidden w-full h-full bg-surface-2"
                        
                      >
                        {post.thumbnail
                          ? <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          : <span className="text-4xl opacity-50">{EMOJI_MAP[post.category ?? ''] ?? '📝'}</span>
                        }
                      </div>

                      <div className="p-6 flex flex-col flex-1">
                        {/* Category */}
                        {post.category && (
                          <span
                            className="text-[10.5px] font-semibold uppercase tracking-widest mb-3 w-fit card-muted-text"
                            
                          >
                            {post.category}
                          </span>
                        )}

                        {/* Title */}
                        <h3
                          className="text-[15.5px] font-bold leading-snug mb-3 flex-1 transition-colors duration-200 card-title-text"
                           style={{ letterSpacing: '-0.015em' }}
                        >
                          {post.title}
                        </h3>

                        {/* Meta footer */}
                        <div
                          className="flex items-center justify-between pt-4 text-[12px] section-border-top card-muted-text"
                          
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />{post.readTime} min
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" />{(post.views || 0).toLocaleString()}
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-1.5 font-semibold transition-all duration-200 group-hover:gap-2.5"
                            style={{ color: '#E8001C' }}
                          >
                            Read <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))
          }
        </motion.div>
      </div>
    </section>
  )
}
