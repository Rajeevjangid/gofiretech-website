'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { useHomepageData } from '@/hooks/useHomepageData'

// Bullet proof-points that are always shown (brand values — not editable here)
const highlights = [
  'Practitioner-led instruction from industry veterans',
  'Live projects with real client briefs',
  'Dedicated placement support until you land the job',
  '200+ verified hiring partners across India',
]

export default function AboutSection() {
  const { data } = useHomepageData()
  const about = data['homepage.about']

  // Support \n for line breaks in title
  const titleLines = (about.title ?? '').split('\\n')

  return (
    <section className="section">
      <div className="container-pad">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Text column ── */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Tag */}
            <div className="label-tag mb-4">{about.tag || 'About GoFire Tech'}</div>

            {/* Headline */}
            <h2
              className="font-extrabold text-foreground leading-[1.05] tracking-tight mb-6"
              style={{ fontSize: 'clamp(2rem, 3.5vw + 0.5rem, 3rem)', letterSpacing: '-0.03em' }}
            >
              {titleLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < titleLines.length - 1 && <br />}
                </span>
              ))}
            </h2>

            {/* Body — supports multi-paragraph via \n\n */}
            <div className="space-y-4 mb-8">
              {(about.body ?? '').split('\\n\\n').map((para, i) => (
                <p
                  key={i}
                  className="text-[16px] leading-[1.75] card-muted-text"
                  
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Highlights */}
            <ul className="space-y-2.5 mb-10">
              {highlights.map(h => (
                <li key={h} className="flex items-start gap-2.5">
                  <CheckCircle
                    className="w-4 h-4 mt-0.5 shrink-0"
                    style={{ color: '#E8001C' }}
                  />
                  <span className="text-[14px] card-muted-text">
                    {h}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            {about.btnText && (
              <Link
                href={about.btnUrl || '/about'}
                className="inline-flex items-center gap-2 text-[14px] font-semibold transition-colors duration-200 group"
                style={{ color: '#E8001C' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ff4d6a' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#E8001C' }}
              >
                {about.btnText}
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            )}
          </motion.div>

          {/* ── Image column ── */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {about.image ? (
              <div
                className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden"
                style={{
                  border: '1px solid hsl(var(--border))',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
                }}
              >
                <Image
                  src={about.image}
                  alt="About GoFire Tech"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(135deg, rgba(232,0,28,0.06) 0%, transparent 60%)' }}
                />
              </div>
            ) : (
              /* Placeholder when no image is set */
              <div
                className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden flex items-center justify-center"
                style={{
                  background: 'hsl(214 28% 7%)',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
                }}
              >
                {/* Abstract accent */}
                <div
                  className="absolute inset-0"
                  style={{ background: 'radial-gradient(ellipse 80% 60% at 30% 40%, rgba(232,0,28,0.08) 0%, transparent 65%)' }}
                />
                <div className="relative z-10 text-center px-8">
                  <div
                    className="text-[3.5rem] font-extrabold leading-none mb-3"
                    style={{
                      background: 'linear-gradient(135deg, #E8001C 0%, #ff3d56 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    GoFire
                  </div>
                  <div
                    className="text-[13px] font-medium tracking-widest uppercase card-muted-text"
                    
                  >
                    Tech Career Platform
                  </div>
                </div>
                {/* Decorative ring */}
                <div
                  className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full"
                  style={{ border: '1px solid rgba(232,0,28,0.08)' }}
                />
                <div
                  className="absolute -top-8 -left-8 w-40 h-40 rounded-full"
                  style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                />
              </div>
            )}

            {/* Floating accent badge */}
            <div
              className="absolute -bottom-5 -left-5 px-4 py-3 rounded-2xl hidden md:block"
              style={{
                background: 'hsl(214 28% 8%)',
                border: '1px solid rgba(232,0,28,0.18)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.40)',
              }}
            >
              <div className="text-[22px] font-extrabold text-white leading-none" style={{ letterSpacing: '-0.03em' }}>
                2,000+
              </div>
              <div className="text-[11px] mt-0.5 card-muted-text">
                Students Trained
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
