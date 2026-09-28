'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Shield, Brain, Code2, Cloud, Database, Flame, Clock, Users } from 'lucide-react'

// Category → icon mapping (same as before)
const ICON_MAP: Record<string, React.ElementType> = {
  'Cybersecurity':        Shield,
  'Artificial Intelligence': Brain,
  'Web Development':      Code2,
  'Cloud & DevOps':       Cloud,
  'Data Science':         Database,
}
// Category → accent colours (same palette as original hardcoded design)
const ACCENT_MAP: Record<string, { bg: string; border: string; iconColor: string }> = {
  'Cybersecurity':           { bg: 'rgba(232,0,28,0.07)',    border: 'rgba(232,0,28,0.14)',    iconColor: '#f87171' },
  'Artificial Intelligence': { bg: 'rgba(96,165,250,0.07)',  border: 'rgba(96,165,250,0.14)',  iconColor: '#60a5fa' },
  'Web Development':         { bg: 'rgba(52,211,153,0.07)',  border: 'rgba(52,211,153,0.14)',  iconColor: '#34d399' },
  'Cloud & DevOps':          { bg: 'rgba(251,191,36,0.07)',  border: 'rgba(251,191,36,0.14)',  iconColor: '#fbbf24' },
  'Data Science':            { bg: 'rgba(167,139,250,0.07)', border: 'rgba(167,139,250,0.14)', iconColor: '#a78bfa' },
}
const DEFAULT_ACCENT = { bg: 'rgba(255,90,31,0.07)', border: 'rgba(255,90,31,0.14)', iconColor: '#FF5A1F' }

function formatCurrency(val: any): string {
  if (val == null || val === '') return 'Contact us'
  const n = Number(val)
  if (isNaN(n)) return 'Contact us'
  return `₹${n.toLocaleString('en-IN')}`
}

const container = { animate: { transition: { staggerChildren: 0.09 } } }
const cardAnim  = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

interface Course {
  id: string; slug: string; title: string; description: string
  thumbnail: string | null; price: any; originalPrice: any
  duration: string | null; level: string; category: string | null
  isFeatured: boolean; enrollmentCount: number
}

export default function FeaturedCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/courses?featured=true&published=true&limit=3')
      .then(r => r.json())
      .then(data => setCourses(data.courses ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // While loading show 3 skeleton cards
  const skeletonCards = Array.from({ length: 3 })

  return (
    <section className="section">
      <div className="container-pad">

        {/* ── Header — unchanged ───────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="flex flex-col md:flex-row md:items-end gap-6 mb-14"
        >
          <div className="flex-1">
            <div className="label-tag mb-3">Programs</div>
            <h2 className="text-headline text-foreground">
              Programs That<br />Launch Careers
            </h2>
          </div>
          <Link
            href="/courses"
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
            View All Programs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* ── Cards grid — identical markup to original ── */}
        <motion.div
          variants={container}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-5"
        >
          {loading
            ? skeletonCards.map((_, i) => (
                <motion.div key={i} variants={cardAnim}>
                  <div
                    className="relative h-full rounded-2xl overflow-hidden animate-pulse section-card rounded-xl"
                     style={{ minHeight: 320 }}
                  />
                </motion.div>
              ))
            : courses.length === 0
              ? (
                <motion.div
                  variants={cardAnim}
                  className="col-span-3 text-center py-16 text-sm card-muted-text"
                  
                >
                  No featured courses available yet.{' '}
                  <Link href="/courses" className="underline" style={{ color: '#FF5A1F' }}>Browse all programs →</Link>
                </motion.div>
              )
              : courses.map((course) => {
                  const accent   = ACCENT_MAP[course.category ?? ''] ?? DEFAULT_ACCENT
                  const Icon     = ICON_MAP[course.category ?? ''] ?? Flame
                  const featured = course.isFeatured

                  return (
                    <motion.div key={course.slug} variants={cardAnim}>
                      <Link href={`/courses/${course.slug}`} className="block h-full group">
                        <article
                          className="relative h-full rounded-2xl overflow-hidden transition-all duration-300"
                          style={{
                            background: 'hsl(214 28% 7%)',
                            border: featured
                              ? '1px solid rgba(232,0,28,0.28)'
                              : '1px solid hsl(var(--border))',
                            boxShadow: featured
                              ? '0 0 0 1px rgba(232,0,28,0.10), 0 8px 32px rgba(0,0,0,0.25), 0 0 40px rgba(232,0,28,0.04)'
                              : '0 2px 8px rgba(0,0,0,0.15)',
                          }}
                          onMouseEnter={e => {
                            const el = e.currentTarget as HTMLElement
                            el.style.transform = 'translateY(-3px)'
                            el.style.boxShadow = featured
                              ? '0 0 0 1px rgba(232,0,28,0.30), 0 20px 48px rgba(0,0,0,0.45), 0 0 56px rgba(232,0,28,0.10)'
                              : '0 20px 48px rgba(0,0,0,0.40), 0 1px 0 rgba(255,255,255,0.05)'
                            el.style.borderColor = featured
                              ? 'rgba(232,0,28,0.38)'
                              : 'rgba(255,255,255,0.13)'
                          }}
                          onMouseLeave={e => {
                            const el = e.currentTarget as HTMLElement
                            el.style.transform = 'translateY(0)'
                            el.style.boxShadow = featured
                              ? '0 0 0 1px rgba(232,0,28,0.10), 0 8px 32px rgba(0,0,0,0.25), 0 0 40px rgba(232,0,28,0.04)'
                              : '0 2px 8px rgba(0,0,0,0.15)'
                            el.style.borderColor = featured
                              ? 'rgba(232,0,28,0.28)'
                              : 'rgba(255,255,255,0.07)'
                          }}
                        >
                          {/* Featured top bar */}
                          {featured && (
                            <div
                              className="absolute top-0 left-0 right-0 h-[2px]"
                              style={{ background: 'linear-gradient(90deg, transparent, #E8001C, transparent)' }}
                            />
                          )}
                          {featured && (
                            <div className="absolute top-4 right-4 z-10">
                              <span
                                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                                style={{ background: 'rgba(232,0,28,0.10)', border: '1px solid rgba(232,0,28,0.22)', color: '#ff4d6a' }}
                              >
                                Most Popular
                              </span>
                            </div>
                          )}

                          {/* Thumbnail — shown if available, else icon */}
                          {course.thumbnail ? (
                            <div className="w-full h-40 overflow-hidden">
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          ) : null}

                          <div className="p-7">
                            {/* Icon + meta */}
                            <div className="flex items-center gap-3.5 mb-6">
                              <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
                                style={{ background: accent.bg, border: `1px solid ${accent.border}` }}
                              >
                                <Icon style={{ width: 19, height: 19, color: accent.iconColor }} />
                              </div>
                              <div>
                                <div className="text-[10.5px] font-semibold uppercase tracking-widest card-muted-text">
                                  {course.category ?? 'Course'}
                                </div>
                                <div className="text-[10.5px] mt-0.5 card-muted-text">
                                  {course.level}
                                </div>
                              </div>
                            </div>

                            {/* Title */}
                            <h3
                              className="text-[16.5px] font-bold leading-snug mb-3 transition-colors duration-200 card-title-text"
                               style={{ letterSpacing: '-0.015em' }}
                            >
                              {course.title}
                            </h3>

                            {/* Description */}
                            <p className="text-[13.5px] leading-relaxed mb-6 line-clamp-3 card-muted-text">
                              {course.description}
                            </p>

                            {/* Meta row */}
                            <div className="flex items-center gap-4 text-[12px] mb-6 card-muted-text">
                              {course.duration && (
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5" />{course.duration}
                                </span>
                              )}
                              <span className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                {(course.enrollmentCount || 0).toLocaleString()} enrolled
                              </span>
                            </div>

                            {/* Footer */}
                            <div
                              className="flex items-center justify-between pt-5"
                              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                            >
                              <div>
                                <div className="text-[18px] font-extrabold text-foreground leading-none card-title-text" style={{ letterSpacing: '-0.02em' }}>
                                  {formatCurrency(course.price)}
                                </div>
                                {course.originalPrice && Number(course.originalPrice) > Number(course.price) && (
                                  <div className="text-[11px] line-through mt-0.5" style={{ color: 'rgba(255,255,255,0.18)' }}>
                                    {formatCurrency(course.originalPrice)}
                                  </div>
                                )}
                              </div>
                              <div
                                className="flex items-center gap-1.5 text-[12px] font-semibold transition-all duration-200 group-hover:gap-2.5"
                                style={{ color: '#E8001C' }}
                              >
                                Enroll Now <ArrowRight className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>
                        </article>
                      </Link>
                    </motion.div>
                  )
                })
          }
        </motion.div>
      </div>
    </section>
  )
}
