'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Eye, Calendar, Tag, ArrowRight } from 'lucide-react'
import { formatDate, formatDateShort } from '@/lib/utils'

interface RelatedPost {
  id: string; slug: string; title: string; excerpt: string | null;
  thumbnail: string | null; category: string | null; readTime: number;
  views: number; publishedAt: string | null; authorName: string | null;
}

export default function BlogPostClient({ post, related = [] }: { post: any; related?: RelatedPost[] }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative pt-32 pb-16 border-b border-border overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="container-gf relative z-10 max-w-4xl">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {post.category && (
              <div className="badge-gf mb-4">{post.category}</div>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              {post.authorName && <span className="font-medium text-foreground">{post.authorName}</span>}
              {post.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />{formatDate(post.publishedAt)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />{post.readTime} min read
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />{post.views?.toLocaleString()} views
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-gf py-16 max-w-4xl">
        {post.thumbnail && (
          <img src={post.thumbnail} alt={post.title}
            className="w-full h-64 sm:h-96 object-cover rounded-2xl mb-10 border border-border"
          />
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose-gf"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && (
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {post.tags.split(',').map((tag: string) => (
                <span key={tag.trim()}
                  className="text-xs px-3 py-1 rounded-full bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 glass-card rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Ready to start your tech career?</h3>
          <p className="text-muted-foreground mb-5">Join 2,000+ learners who changed their careers with GoFire Tech.</p>
          <Link href="/courses" className="inline-flex btn-gf-primary px-8 py-3 rounded-xl font-semibold relative overflow-hidden">
            <span className="relative z-10">Explore Courses →</span>
          </Link>
        </div>

        {/* More Articles */}
        {related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 pt-10 border-t border-border"
          >
            <h3 className="text-xl font-bold text-foreground mb-6">More Articles</h3>
            <div className="grid sm:grid-cols-3 gap-5">
              {related.map(rp => (
                <Link key={rp.id} href={`/blog/${rp.slug}`} className="group block h-full">
                  <div className="glass-card rounded-2xl overflow-hidden card-hover h-full flex flex-col">
                    <div className="h-32 bg-gradient-to-br from-[#0d1520] to-[#111827] flex items-center justify-center overflow-hidden">
                      {rp.thumbnail
                        ? <img src={rp.thumbnail} alt={rp.title} className="w-full h-full object-cover" />
                        : <span className="text-3xl opacity-50">
                            {rp.category === 'Cybersecurity' ? '🔐' : rp.category === 'Artificial Intelligence' ? '🤖' : rp.category === 'Web Development' ? '💻' : '📝'}
                          </span>
                      }
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      {rp.category && (
                        <span className="text-[10px] font-semibold text-[#FF5A1F] bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full w-fit mb-2">{rp.category}</span>
                      )}
                      <h4 className="text-sm font-bold text-foreground group-hover:text-[#FF5A1F] transition-colors line-clamp-2 flex-1">{rp.title}</h4>
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground border-t border-border pt-3">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{rp.readTime} min</span>
                        <span className="flex items-center gap-1 ml-auto text-[#FF5A1F]">Read <ArrowRight className="w-3 h-3" /></span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
