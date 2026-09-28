'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Search, Filter, Clock, Users, Star, ArrowRight, Flame, Shield, Brain, Code2, Cloud, Database, X } from 'lucide-react'
import { formatCurrency, getCourseLevelColor } from '@/lib/utils'

const categories = [
  { id: 'all', label: 'All Programs', icon: Flame },
  { id: 'cybersecurity', label: 'Cybersecurity', icon: Shield },
  { id: 'ai', label: 'AI & ML', icon: Brain },
  { id: 'webdev', label: 'Web Development', icon: Code2 },
  { id: 'cloud', label: 'Cloud & DevOps', icon: Cloud },
  { id: 'data', label: 'Data Science', icon: Database },
]

const levels = ['All Levels', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED']

export default function CoursesPageClient() {
  const [courses, setCourses] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeLevel, setActiveLevel] = useState('All Levels')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/courses?published=true&limit=50')
      .then(r => r.json())
      .then(data => { if (data.courses?.length) setCourses(data.courses) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = courses.filter(c => {
    const matchesCategory = activeCategory === 'all' ||
      c.category?.toLowerCase().includes(activeCategory.toLowerCase())
    const matchesLevel = activeLevel === 'All Levels' || c.level === activeLevel
    const matchesSearch = !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesLevel && matchesSearch
  })

  const IconComponent = (course: any) => {
    const map: Record<string, any> = {
      'Cybersecurity': Shield, 'Artificial Intelligence': Brain,
      'Web Development': Code2, 'Cloud & DevOps': Cloud, 'Data Science': Database,
    }
    return course.icon || map[course.category] || Flame
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative pt-32 pb-16 border-b border-border overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-500/5 rounded-full blur-3xl" />
        <div className="container-gf relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="badge-gf mb-4">All Programs</div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">
              Build skills that{' '}
              <span className="text-gradient">get you hired</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              {filtered.length} programs across Cybersecurity, AI, Web Development, and more.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-gf py-10">
        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-input/50 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#FF5A1F] transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground hover:text-white" />
              </button>
            )}
          </div>
          <select
            value={activeLevel}
            onChange={e => setActiveLevel(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border bg-input/50 text-sm text-foreground focus:outline-none focus:border-[#FF5A1F] transition-colors"
          >
            {levels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
          {categories.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === id
                  ? 'bg-[#FF5A1F] text-white shadow-glow-sm'
                  : 'border border-border text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-foreground/[0.04]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-6">
          Showing <strong className="text-foreground">{filtered.length}</strong> programs
          {activeCategory !== 'all' && ` in ${categories.find(c => c.id === activeCategory)?.label}`}
        </p>

        {/* Courses Grid */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-20">
              <p className="text-muted-foreground">No courses found. Try a different filter.</p>
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course, i) => {
                const Icon = IconComponent(course)
                const discount = course.originalPrice && course.price
                  ? Math.round((1 - Number(course.price) / Number(course.originalPrice)) * 100)
                  : 0
                return (
                  <motion.div key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={`/courses/${course.slug}`} className="block group h-full">
                      <div className="glass-card rounded-2xl overflow-hidden card-hover h-full flex flex-col">
                        <div className="relative h-44 bg-gradient-to-br from-[#0d1520] to-[#111827] flex items-center justify-center">
                          {course.thumbnail
                            ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                            : <div className="w-20 h-20 rounded-2xl bg-orange-400/10 flex items-center justify-center">
                                <Icon className="w-10 h-10 text-orange-400" />
                              </div>
                          }
                          {discount > 0 && (
                            <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">{discount}% OFF</div>
                          )}
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getCourseLevelColor(course.level)}`}>
                              {course.level}
                            </span>
                            {course.category && <span className="text-xs text-muted-foreground">{course.category}</span>}
                          </div>
                          <h3 className="font-bold text-foreground text-lg mb-2 group-hover:text-[#FF5A1F] transition-colors line-clamp-2">
                            {course.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-3">{course.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 border-t border-border pt-4">
                            {course.duration && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration}</span>}
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{(course.enrollmentCount || 0).toLocaleString()}</span>
                            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />{(course.rating || 4.8).toFixed(1)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-end gap-2">
                              <span className="text-xl font-extrabold text-foreground">{formatCurrency(course.price)}</span>
                              {course.originalPrice && Number(course.originalPrice) > Number(course.price) && (
                                <span className="text-sm text-muted-foreground line-through">{formatCurrency(course.originalPrice)}</span>
                              )}
                            </div>
                            <span className="flex items-center gap-1 text-[#FF5A1F] text-sm font-semibold">
                              Enroll <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
