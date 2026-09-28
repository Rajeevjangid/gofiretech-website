'use client'

import { motion } from 'framer-motion'
import {
  ShieldCheck, Briefcase, Trophy, Clock, Users, GraduationCap,
  Star, Zap, Target, CheckCircle, Award, BookOpen,
  Code2, Brain, Shield, Cloud, Database,
  LucideIcon,
} from 'lucide-react'
import { useHomepageData } from '@/hooks/useHomepageData'

// Map icon name strings → Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck, Briefcase, Trophy, Clock, Users, GraduationCap,
  Star, Zap, Target, CheckCircle, Award, BookOpen,
  Code2, Brain, Shield, Cloud, Database,
}

const container = { animate: { transition: { staggerChildren: 0.065 } } }
const itemAnim  = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

export default function WhyGoFire() {
  const { data } = useHomepageData()
  const why      = data['homepage.why']
  const cards    = data['homepage.why_cards']
    .filter((c: any) => c.active !== false)
    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))

  // Support \n in title for line breaks
  const titleLines = (why.title ?? '').split('\\n')

  return (
    <section className="section section-bg-tint">
      <div className="container-pad">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center max-w-xl mx-auto mb-16"
        >
          <div className="label-tag justify-center mb-3">{why.tag || 'Why GoFire Tech'}</div>
          <h2 className="text-headline text-foreground">
            {titleLines.map((line, i) => (
              <span key={i}>{line}{i < titleLines.length - 1 && <br />}</span>
            ))}
          </h2>
          <p className="mt-4 text-[16.5px] leading-relaxed card-muted-text">
            {why.subtitle}
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={container}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {cards.map((card: any) => {
            const Icon = ICON_MAP[card.icon] ?? ShieldCheck
            return (
              <motion.div key={card.id || card.title} variants={itemAnim}>
                <div
                  className="group h-full rounded-2xl p-7 transition-all duration-300 cursor-default"
                  style={{
                    /* section-card handles bg/border/shadow */
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(-2px)'
                    el.style.borderColor = 'rgba(232,0,28,0.18)'
                    el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(232,0,28,0.08)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(0)'
                    el.style.borderColor = 'hsl(var(--border))'
                    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.20)'
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-105"
                    style={{
                      background: 'rgba(232,0,28,0.07)',
                      border: '1px solid rgba(232,0,28,0.13)',
                    }}
                  >
                    <Icon className="w-[18px] h-[18px] text-red-400" />
                  </div>
                  <h3
                    className="text-[14.5px] font-bold mb-2.5 transition-colors duration-200 group-hover:text-red-400 card-title-text"
                     style={{ letterSpacing: '-0.01em' }}
                  >
                    {card.title}
                  </h3>
                  <p className="text-[13px] leading-[1.7] card-muted-text">
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
