'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { Target, Heart, Zap, Shield, Users, BookOpen, Award, ArrowRight } from 'lucide-react'

const values = [
  { icon: Target, title: 'Outcome First', desc: 'Every decision is measured by one thing: did our learner get a better job?' },
  { icon: Heart, title: 'Radical Honesty', desc: 'We publish verified outcome data. No inflated placement claims.' },
  { icon: Zap, title: 'Industry Velocity', desc: 'Curriculum reviewed quarterly. We update before industry does.' },
  { icon: Shield, title: 'Affordable Excellence', desc: 'Premium training should not require premium debt.' },
]

const milestones = [
  { year: '2022', event: 'GoFire Tech founded with a mission to bridge the industry-academia gap' },
  { year: '2023', event: 'Launched first Cybersecurity cohort. First 50 students placed.' },
  { year: '2024', event: 'Expanded to AI/ML and Web Development. Crossed 1,000 enrolled students.' },
  { year: '2025', event: 'Achieved 75%+ placement rate. 500+ students at 50+ companies.' },
  { year: '2026', event: 'Redesigned platform. Scaling to 10,000+ learners this year.' },
]

const team = [
  { name: 'Vikram Rajan', role: 'Founder & CEO', bio: '10+ years in cybersecurity. Former security lead at a Fortune 500.', initials: 'VR', color: 'from-orange-500 to-orange-600' },
  { name: 'Anita Desai', role: 'Head of Curriculum', bio: 'Ex-Google engineer. PhD in Computer Science. Built curricula used by 50K+ students.', initials: 'AD', color: 'from-blue-500 to-blue-600' },
  { name: 'Rohit Sharma', role: 'Head of Placements', bio: '8 years in HR and talent acquisition at top Indian IT firms.', initials: 'RS', color: 'from-purple-500 to-purple-600' },
]

export default function AboutPageClient() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative pt-32 pb-20 border-b border-border overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="container-gf relative z-10 max-w-4xl text-center mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="badge-gf mb-4 mx-auto w-fit">Our Story</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground mb-6">
              We exist to{' '}
              <span className="text-gradient">ignite careers</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              GoFire Tech was born from a simple, frustrating observation: India has millions of talented young people
              and a massive tech talent shortage — yet the two never connect. We’re the bridge.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-gf py-20">
        {/* Mission */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-20">
          <blockquote className="text-2xl sm:text-3xl font-bold text-foreground leading-relaxed">
            &ldquo;To ignite careers in technology through ruthlessly practical training, real-world projects,
            industry mentorship, and outcome-driven placement — not just certificates.&rdquo;
          </blockquote>
          <p className="text-muted-foreground mt-4">— GoFire Tech Mission Statement</p>
        </motion.div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Our Core Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="glass-card rounded-2xl p-6 text-center card-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-[#FF5A1F]" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Our Journey</h2>
          <div className="max-w-2xl mx-auto space-y-0">
            {milestones.map(({ year, event }, i) => (
              <motion.div key={year}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex gap-6 pb-10 relative"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 border-2 border-[#FF5A1F] flex items-center justify-center text-xs font-extrabold text-[#FF5A1F] shrink-0">
                    {year}
                  </div>
                  {i < milestones.length - 1 && <div className="w-0.5 flex-1 bg-border mt-2" />}
                </div>
                <div className="pt-3 pb-5">
                  <p className="text-foreground leading-relaxed">{event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Meet the Team</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map(({ name, role, bio, initials, color }, i) => (
              <motion.div key={name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center card-hover"
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-xl font-extrabold text-white mx-auto mb-4`}>
                  {initials}
                </div>
                <h3 className="font-bold text-foreground mb-0.5">{name}</h3>
                <p className="text-sm text-[#FF5A1F] mb-3">{role}</p>
                <p className="text-sm text-muted-foreground">{bio}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="glass-card rounded-3xl p-10 text-center border border-[#FF5A1F]/20">
          <h2 className="text-2xl font-bold text-foreground mb-3">Join the GoFire Tech family</h2>
          <p className="text-muted-foreground mb-6">2,000+ learners. 500+ placements. Your turn.</p>
          <Link href="/courses" className="inline-flex btn-gf-primary px-8 py-3.5 rounded-xl font-semibold relative overflow-hidden">
            <span className="relative z-10">Explore Courses <ArrowRight className="inline w-4 h-4 ml-1" /></span>
          </Link>
        </div>
      </div>
    </div>
  )
}
