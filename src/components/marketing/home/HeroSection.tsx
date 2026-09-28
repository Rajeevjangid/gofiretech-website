'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Shield, Brain, Code2 } from 'lucide-react'
import { useRef } from 'react'
import { useHomepageData } from '@/hooks/useHomepageData'

// ─── Brand-accurate Network Visual ───
const ARMS = [
  { x2: 110, y2:  72 },
  { x2: 284, y2:  98 },
  { x2:  44, y2: 196 },
  { x2: 160, y2: 322 },
  { x2: 292, y2: 340 },
]
const CX = 192, CY = 206

function NetworkArt() {
  return (
    <div className="absolute inset-0 flex items-center justify-end pointer-events-none select-none overflow-hidden">
      <div className="relative opacity-[0.15] md:opacity-[0.20] mr-[-4%]">
        <svg viewBox="0 0 380 420" width={520} height={560}>
          {ARMS.map((arm, i) => (
            <motion.line
              key={i}
              x1={CX} y1={CY} x2={arm.x2} y2={arm.y2}
              stroke="rgba(200,215,230,0.65)"
              strokeWidth="1.6"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.3 + i * 0.12, ease: 'easeOut' }}
            />
          ))}
          <motion.circle cx={110} cy={72} r={28} fill="none" stroke="#E8001C" strokeWidth="2.8"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.55, ease: [0.16,1,0.3,1] }}
            style={{ transformOrigin: '110px 72px' }} />
          <motion.circle cx={292} cy={340} r={28} fill="none" stroke="#E8001C" strokeWidth="2.8"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45, ease: [0.16,1,0.3,1] }}
            style={{ transformOrigin: '292px 340px' }} />
          {[[284,98],[44,196],[160,322]].map(([cx,cy],i) => (
            <motion.circle key={i} cx={cx} cy={cy} r={9} fill="none"
              stroke="rgba(210,225,240,0.8)" strokeWidth="2.2"
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.5 + i * 0.1, ease: [0.16,1,0.3,1] }}
              style={{ transformOrigin: `${cx}px ${cy}px` }} />
          ))}
          <motion.circle cx={CX} cy={CY} r={15} fill="rgba(232,0,28,0.07)"
            stroke="rgba(255,255,255,0.5)" strokeWidth="2.4"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ duration: 0.55, delay: 0.25, ease: [0.16,1,0.3,1] }}
            style={{ transformOrigin: `${CX}px ${CY}px` }} />
          <motion.circle cx={CX} cy={CY} r={15} fill="none"
            stroke="rgba(232,0,28,0.15)" strokeWidth="1"
            animate={{ r: [15, 40, 15], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }} />
        </svg>
      </div>
    </div>
  )
}

const stagger = { animate: { transition: { staggerChildren: 0.10 } } }
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
}

const domains = [
  { icon: Shield, label: 'Cybersecurity',  color: '#f87171' },
  { icon: Brain,  label: 'AI & ML',        color: '#60a5fa' },
  { icon: Code2,  label: 'Full-Stack Dev', color: '#34d399' },
]

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  const { data } = useHomepageData()
  const hero      = data['homepage.hero']
  const heroStats = data['homepage.hero_stats']

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden">

      {/* ── Layered backgrounds ── */}
      <div className="absolute inset-0 grid-dots opacity-[0.22]" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px]"
          style={{ background: 'radial-gradient(circle, rgba(232,0,28,0.07) 0%, transparent 68%)' }} />
        <div className="absolute -bottom-20 right-0 w-[500px] h-[500px]"
          style={{ background: 'radial-gradient(circle, rgba(27,61,69,0.22) 0%, transparent 65%)' }} />
        <div className="absolute top-1/2 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(232,0,28,0.08) 30%, rgba(27,61,69,0.12) 70%, transparent)' }} />
      </div>

      {/* Background image from CMS (if set) */}
      {hero.image && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${hero.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.08,
          }}
        />
      )}

      <motion.div style={{ y, opacity }} className="absolute inset-0">
        <NetworkArt />
      </motion.div>

      {/* ── Hero content ── */}
      <div className="relative z-10 container-pad pt-32 pb-24 lg:pb-28">
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="max-w-[680px]"
        >
          {/* Eyebrow badge */}
          <motion.div variants={fadeUp} className="mb-8">
            <span
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-[11.5px] font-semibold tracking-wide"
              style={{
                background: 'rgba(232,0,28,0.07)',
                border: '1px solid rgba(232,0,28,0.16)',
                color: '#ff4d6a',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8001C] animate-pulse shrink-0" />
              {hero.badge}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="font-extrabold text-foreground leading-[1.03] tracking-[-0.04em]"
            style={{ fontSize: 'clamp(2.6rem, 5.2vw + 0.5rem, 4.75rem)' }}
          >
            {hero.title}
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #E8001C 0%, #ff3d56 50%, #ff6b80 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {hero.highlight}
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeUp}
            className="mt-6 text-[17px] leading-[1.7] max-w-[520px] card-muted-text"
            
          >
            {hero.subtitle}
          </motion.p>

          {/* Domain pills — static, part of branding */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mt-6">
            {domains.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-medium"
                style={{
                  background: 'hsl(var(--surface-2))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground-2))',
                }}
              >
                <Icon style={{ width: 12, height: 12, color }} />
                {label}
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3.5 mt-10">
            {/* Primary */}
            <Link
              href={hero.btn1Url || '/courses'}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-[14px] font-semibold text-white transition-all duration-200 group"
              style={{
                background: 'linear-gradient(135deg, #E8001C 0%, #c50018 100%)',
                boxShadow: '0 2px 0 rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.14), 0 0 0 1px rgba(232,0,28,0.45)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.boxShadow = '0 0 28px rgba(232,0,28,0.45), inset 0 1px 0 rgba(255,255,255,0.14), 0 0 0 1px rgba(232,0,28,0.6)'
                el.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.boxShadow = '0 2px 0 rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.14), 0 0 0 1px rgba(232,0,28,0.45)'
                el.style.transform = 'translateY(0)'
              }}
            >
              {hero.btn1Text}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            {/* Ghost */}
            <Link
              href={hero.btn2Url || '/contact'}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[14px] font-medium transition-all duration-200"
              style={{
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--foreground-2))',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'hsl(var(--foreground-3))'
                el.style.color = 'hsl(var(--foreground))'
                el.style.background = 'hsl(var(--surface-2))'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'hsl(var(--border))'
                el.style.color = 'hsl(var(--foreground-2))'
                el.style.background = 'transparent'
              }}
            >
              {hero.btn2Text}
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            variants={fadeUp}
            className="mt-14 grid grid-cols-2 sm:grid-cols-4 rounded-2xl overflow-hidden"
            style={{
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--surface-1) / 0.5)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {heroStats.map(({ value, label }: { value: string; label: string }, i: number) => (
              <div
                key={label}
                className={`py-5 px-5 text-center ${i < heroStats.length - 1 ? 'stat-divider' : ''}`}
              >
                <div
                  className="text-[22px] font-extrabold tracking-tight text-foreground leading-none"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {value}
                </div>
                <div className="text-[11px] font-medium mt-1.5 card-muted-text">
                  {label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, hsl(var(--background)), transparent)' }}
      />
    </section>
  )
}
