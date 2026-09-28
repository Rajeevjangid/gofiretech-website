'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useHomepageData } from '@/hooks/useHomepageData'

export default function CtaBanner() {
  const { data } = useHomepageData()
  const cta = data['homepage.cta']

  // Support \n in title
  const titleLines = (cta.title ?? '').split('\\n')

  return (
    <section className="section-sm">
      <div className="container-pad">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: cta.image
              ? undefined
              : 'linear-gradient(135deg, #0D1520 0%, #180007 45%, #090D18 100%)',
            border: '1px solid rgba(232,0,28,0.16)',
            boxShadow: '0 0 0 1px rgba(232,0,28,0.06), 0 32px 80px rgba(0,0,0,0.50)',
          }}
        >
          {/* Background image from CMS */}
          {cta.image && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${cta.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.15,
              }}
            />
          )}
          {!cta.image && (
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, #0D1520 0%, #180007 45%, #090D18 100%)' }}
            />
          )}

          {/* Top red glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 55% at 50% -10%, rgba(232,0,28,0.18) 0%, transparent 70%)' }} />

          {/* Bottom-right teal accent */}
          <div className="absolute bottom-0 right-0 w-80 h-80 pointer-events-none"
            style={{ background: 'radial-gradient(circle at bottom right, rgba(27,61,69,0.25) 0%, transparent 65%)' }} />

          {/* Decorative top line */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(232,0,28,0.35) 35%, rgba(232,0,28,0.35) 65%, transparent 95%)' }} />

          {/* Content */}
          <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 text-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 text-[11.5px] font-semibold tracking-wide"
              style={{
                background: 'rgba(232,0,28,0.07)',
                border: '1px solid rgba(232,0,28,0.16)',
                color: '#ff4d6a',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8001C] animate-pulse" />
              {cta.badge}
            </div>

            <h2 className="text-headline text-white mb-4">
              {titleLines.map((line, i) => (
                <span key={i}>{line}{i < titleLines.length - 1 && <br />}</span>
              ))}
            </h2>

            <p className="text-[17px] max-w-[480px] mx-auto mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.42)' }}>
              {cta.subtitle}
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              {/* Primary */}
              <Link
                href={cta.btn1Url || '/courses'}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-[14px] font-semibold text-white transition-all duration-200 group"
                style={{
                  background: 'linear-gradient(135deg, #E8001C 0%, #c50018 100%)',
                  boxShadow: '0 2px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.14), 0 0 0 1px rgba(232,0,28,0.45)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.boxShadow = '0 0 32px rgba(232,0,28,0.50), inset 0 1px 0 rgba(255,255,255,0.14), 0 0 0 1px rgba(232,0,28,0.6)'
                  el.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.boxShadow = '0 2px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.14), 0 0 0 1px rgba(232,0,28,0.45)'
                  el.style.transform = 'translateY(0)'
                }}
              >
                {cta.btn1Text}
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              {/* Ghost — always light text: card bg is always dark (#0D1520) */}
              <Link
                href={cta.btn2Url || '/contact'}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-[14px] font-medium transition-all duration-200"
                style={{
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: 'rgba(255,255,255,0.72)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'rgba(255,255,255,0.32)'
                  el.style.color = 'rgba(255,255,255,0.95)'
                  el.style.background = 'rgba(255,255,255,0.06)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'rgba(255,255,255,0.18)'
                  el.style.color = 'rgba(255,255,255,0.72)'
                  el.style.background = 'transparent'
                }}
              >
                {cta.btn2Text}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
