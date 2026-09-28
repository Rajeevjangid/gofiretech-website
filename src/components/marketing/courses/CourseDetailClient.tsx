'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, Users, Star, CheckCircle2, ArrowRight, BookOpen, Award, Calendar, Phone, Shield, Brain, Code2, Cloud, Database, Flame } from 'lucide-react'
import { formatCurrency, getCourseLevelColor, formatDate } from '@/lib/utils'

const ICON_MAP: Record<string, React.ElementType> = {
  'Cybersecurity': Shield, 'Artificial Intelligence': Brain,
  'Web Development': Code2, 'Cloud & DevOps': Cloud, 'Data Science': Database,
}

interface CourseDetailClientProps {
  course: {
    id: string; title: string; slug: string; description: string; content?: string | null
    thumbnail?: string | null; price?: number | null; originalPrice?: number | null
    duration?: string | null; level: string; category?: string | null
    instructor?: string | null; instructorBio?: string | null; instructorImage?: string | null
    enrollmentCount: number; rating: number; outcomes?: string | null; curriculum?: string | null
    createdAt: string; metaTitle?: string | null; metaDescription?: string | null
  }
  related?: {
    id: string; slug: string; title: string; description: string;
    thumbnail: string | null; price: any; originalPrice: any;
    duration: string | null; level: string; category: string | null;
    enrollmentCount: number; rating: number;
  }[]
}

export default function CourseDetailClient({ course, related = [] }: CourseDetailClientProps) {
  const discount = course.originalPrice && course.price
    ? Math.round((1 - Number(course.price) / Number(course.originalPrice)) * 100)
    : 0

  const outcomes = course.outcomes ? JSON.parse(course.outcomes) : [
    'Hands-on practical experience with industry tools',
    'Build 3+ real-world projects for your portfolio',
    'Industry-recognized certificate on completion',
    '12 months of career support and placement assistance',
    'Mock interviews with industry professionals',
    'Access to exclusive alumni community',
  ]

  const curriculum = course.curriculum ? JSON.parse(course.curriculum) : [
    { week: 'Week 1-2', title: 'Foundations & Environment Setup', topics: ['Introduction & overview', 'Tool installation', 'Core concepts'] },
    { week: 'Week 3-5', title: 'Core Technical Skills', topics: ['Key technologies', 'Hands-on labs', 'Mini projects'] },
    { week: 'Week 6-8', title: 'Advanced Techniques', topics: ['Industry scenarios', 'Advanced tools', 'Problem-solving'] },
    { week: 'Week 9-10', title: 'Real-World Projects', topics: ['Capstone project', 'Code review', 'Portfolio building'] },
    { week: 'Final Week', title: 'Career Preparation', topics: ['Resume building', 'Mock interviews', 'Job application strategy'] },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative pt-28 pb-16 border-b border-border overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />

        <div className="container-gf relative z-10">
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            {/* Left: Course Info */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-4">
                  {course.category && (
                    <span className="badge-gf">{course.category}</span>
                  )}
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getCourseLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 leading-tight">
                  {course.title}
                </h1>

                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground mb-8">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-foreground">{course.rating.toFixed(1)}</span>
                    <span>rating</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#FF5A1F]" />
                    <span>{course.enrollmentCount.toLocaleString()} students</span>
                  </div>
                  {course.duration && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#FF5A1F]" />
                      <span>{course.duration}</span>
                    </div>
                  )}
                  {course.instructor && (
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-[#FF5A1F]" />
                      <span>By {course.instructor}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right: Enrollment Card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="glass-card rounded-2xl p-6 sticky top-24">
                {course.thumbnail && (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover rounded-xl mb-5" />
                )}
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-3xl font-extrabold text-foreground">{formatCurrency(course.price)}</span>
                  {course.originalPrice && Number(course.originalPrice) > Number(course.price!) && (
                    <span className="text-lg text-muted-foreground line-through">{formatCurrency(course.originalPrice)}</span>
                  )}
                </div>
                {discount > 0 && (
                  <p className="text-green-400 text-sm font-semibold mb-4">✔ {discount}% discount applied</p>
                )}

                <Link
                  href="/contact"
                  className="block w-full btn-gf-primary text-center px-6 py-3.5 rounded-xl font-semibold mb-3 relative overflow-hidden"
                >
                  <span className="relative z-10">Enroll Now →</span>
                </Link>
                <Link
                  href="/contact"
                  className="block w-full text-center px-6 py-3.5 rounded-xl border border-border hover:bg-white/5 text-sm font-medium text-foreground transition-colors mb-5"
                >
                  Book Free Demo Class
                </Link>

                <div className="space-y-3 text-sm border-t border-border pt-4">
                  {[
                    { icon: Clock, text: course.duration || 'Flexible duration' },
                    { icon: Users, text: 'Small batch (max 20 students)' },
                    { icon: Award, text: 'Industry-recognized certificate' },
                    { icon: Calendar, text: 'Morning / Evening / Weekend batches' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 text-muted-foreground">
                      <Icon className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>

                <a
                  href="tel:+919999999999"
                  className="mt-5 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#FF5A1F]" />
                  Need help? Call us now
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* What you'll learn */}
      <div className="container-gf py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-bold text-foreground mb-6">What you&apos;ll learn</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {outcomes.map((outcome: string) => (
                  <div key={outcome} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{outcome}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Curriculum */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-bold text-foreground mb-6">Course Curriculum</h2>
              <div className="space-y-4">
                {curriculum.map((module: any, i: number) => (
                  <div key={i} className="glass-card rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-xs font-bold text-[#FF5A1F]">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{module.week}</p>
                        <p className="font-semibold text-foreground">{module.title}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {module.topics?.map((topic: string) => (
                        <span key={topic} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Instructor */}
            {course.instructor && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-2xl font-bold text-foreground mb-6">Your Instructor</h2>
                <div className="glass-card rounded-2xl p-6 flex items-start gap-5">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-xl font-bold text-white shrink-0">
                    {course.instructor.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg">{course.instructor}</p>
                    <p className="text-sm text-[#FF5A1F] mb-3">Industry Professional</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {course.instructorBio || 'An experienced industry professional with years of hands-on experience in the field.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Related Courses ───────────────────────────────── */}
      {related.length > 0 && (
        <div className="container-gf py-16 border-t border-border">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold text-foreground mb-8">More Courses</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((rc, i) => {
                const Icon = ICON_MAP[rc.category ?? ''] ?? Flame
                const discount = rc.originalPrice && rc.price
                  ? Math.round((1 - Number(rc.price) / Number(rc.originalPrice)) * 100)
                  : 0
                return (
                  <motion.div key={rc.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                    <Link href={`/courses/${rc.slug}`} className="block group h-full">
                      <div className="glass-card rounded-2xl overflow-hidden card-hover h-full flex flex-col">
                        <div className="relative h-36 bg-gradient-to-br from-[#0d1520] to-[#111827] flex items-center justify-center">
                          {rc.thumbnail
                            ? <img src={rc.thumbnail} alt={rc.title} className="w-full h-full object-cover" />
                            : <div className="w-14 h-14 rounded-xl bg-orange-400/10 flex items-center justify-center">
                                <Icon className="w-7 h-7 text-orange-400" />
                              </div>
                          }
                          {discount > 0 && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{discount}% OFF</div>
                          )}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCourseLevelColor(rc.level)}`}>{rc.level}</span>
                            {rc.category && <span className="text-[10px] text-muted-foreground">{rc.category}</span>}
                          </div>
                          <h3 className="font-bold text-foreground text-sm mb-1.5 group-hover:text-[#FF5A1F] transition-colors line-clamp-2">{rc.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 flex-1 mb-3">{rc.description}</p>
                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <span className="text-base font-extrabold text-foreground">{formatCurrency(rc.price)}</span>
                            <span className="text-[#FF5A1F] text-xs font-semibold flex items-center gap-1">View <ArrowRight className="w-3 h-3" /></span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
