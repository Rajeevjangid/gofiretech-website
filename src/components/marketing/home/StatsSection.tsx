'use client'

import { motion } from 'framer-motion'
import { Users, TrendingUp, BookOpen, Award } from 'lucide-react'
import { useHomepageData } from '@/hooks/useHomepageData'

// Icon palette locked to design — order matches the 4 stat slots
const ICONS = [Users, TrendingUp, BookOpen, Award]
const ICON_STYLES = [
  { iconBg: 'rgba(232,0,28,0.07)',   iconBorder: 'rgba(232,0,28,0.14)',   iconColor: '#f87171' },
  { iconBg: 'rgba(96,165,250,0.07)', iconBorder: 'rgba(96,165,250,0.14)', iconColor: '#60a5fa' },
  { iconBg: 'rgba(52,211,153,0.07)', iconBorder: 'rgba(52,211,153,0.14)', iconColor: '#34d399' },
  { iconBg: 'rgba(251,191,36,0.07)', iconBorder: 'rgba(251,191,36,0.14)', iconColor: '#fbbf24' },
]

export default function StatsSection() {
  const { data } = useHomepageData()
  const stats = data['homepage.stats']

  return (
    <section className="section-sm section-border-y">
      <div className="container-pad">
        <div
          className="stats-bar grid grid-cols-2 lg:grid-cols-4 rounded-2xl overflow-hidden"
        >
          {stats.map(({ value, label, sub }: { value: string; label: string; sub: string }, i: number) => {
            const Icon = ICONS[i] ?? Users
            const { iconBg, iconBorder, iconColor } = ICON_STYLES[i] ?? ICON_STYLES[0]
            return (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                className={`p-8 flex flex-col gap-4 transition-colors duration-200 hover:bg-foreground/[0.025] ${
                  i < stats.length - 1 ? 'stat-divider' : ''
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: iconBg, border: `1px solid ${iconBorder}` }}
                >
                  <Icon style={{ width: 18, height: 18, color: iconColor }} />
                </div>
                <div>
                  <div
                    className="text-[2rem] font-extrabold text-foreground leading-none"
                    style={{ letterSpacing: '-0.03em' }}
                  >
                    {value}
                  </div>
                  <div className="text-[13.5px] font-semibold mt-1.5 card-body-text">
                    {label}
                  </div>
                  <div className="text-[11.5px] mt-0.5 card-muted-text">
                    {sub}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
