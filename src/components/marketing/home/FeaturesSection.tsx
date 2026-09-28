'use client'

import { motion } from 'framer-motion'
import {
  ShieldCheck, Briefcase, Trophy, Clock, Users, GraduationCap,
  Star, Zap, Target, CheckCircle, Award, BookOpen,
  Code2, Brain, Shield, Cloud, Database, Globe, MessageCircle, Rocket,
  LucideIcon,
} from 'lucide-react'
import { useHomepageData } from '@/hooks/useHomepageData'

// Map icon name strings → Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck, Briefcase, Trophy, Clock, Users, GraduationCap,
  Star, Zap, Target, CheckCircle, Award, BookOpen,
  Code2, Brain, Shield, Cloud, Database, Globe, MessageCircle, Rocket,
}

// Alternating accent colours so each card feels distinct
const CARD_ACCENTS = [
  { bg: 'rgba(232,0,28,0.07)',   border: 'rgba(232,0,28,0.14)',   icon: '#f87171' },
  { bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.14)', icon: '#60a5fa' },
  { bg: 'rgba(52,211,153,0.07)', border: 'rgba(52,211,153,0.14)', icon: '#34d399' },
  { bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.14)', icon: '#fbbf24' },
  { bg: 'rgba(167,139,250,0.07)',border: 'rgba(167,139,250,0.14)',icon: '#a78bfa' },
  { bg: 'rgba(232,0,28,0.07)',   border: 'rgba(232,0,28,0.14)',   icon: '#f87171' },
]

const container = { animate: { transition: { staggerChildren: 0.07 } } }
const item = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

export default function FeaturesSection() {
  const { data } = useHomepageData()
  const features = data['homepage.features']
  const cards    = [...data['homepage.feature_cards']]
    .filter((c: any) => c.active !== false)
    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))

  // Support \n for line breaks in title
  const titleLines = (features.title ?? '').split('\\n')

  if (cards.length === 0) return null

  return (
    <section
      className="section section-border-top"
      
    >
      <div className="container-pad">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center max-w-xl mx-auto mb-16"
        >
          <div className="label-tag justify-center mb-3">{features.tag || 'What Sets Us Apart'}</div>
          <h2 className="text-headline text-foreground">
            {titleLines.map((line, i) => (
              <span key={i}>{line}{i < titleLines.length - 1 && <br />}</span>
            ))}
          </h2>
          {features.subtitle && (
            <p
              className="mt-4 text-[16.5px] leading-relaxed card-muted-text"
              
            >
              {features.subtitle}
            </p>
          )}
        </motion.div>

        {/* Cards grid */}
        <motion.div
          variants={container}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {cards.map((card: any, idx: number) => {
            const Icon = ICON_MAP[card.icon] ?? Star
            const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length]

            return (
              <motion.div key={card.id || card.title} variants={item}>
                <div
                  className="section-card group h-full rounded-2xl p-6 cursor-default"
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(-2px)'
                    el.style.borderColor = accent.border
                    el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.32)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(0)'
                    el.style.borderColor = 'hsl(var(--border))'
                    el.style.boxShadow = 'var(--section-card-shadow, 0 2px 8px rgba(0,0,0,0.18))'
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-105"
                    style={{ background: accent.bg, border: `1px solid ${accent.border}` }}
                  >
                    <Icon style={{ width: 18, height: 18, color: accent.icon }} />
                  </div>

                  {/* Number label */}
                  <div
                    className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2 card-muted-text"
                    
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </div>

                  <h3
                    className="text-[14.5px] font-bold mb-2.5 leading-snug card-title-text"
                     style={{ letterSpacing: '-0.01em' }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-[13px] leading-[1.7] card-muted-text"
                    
                  >
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
