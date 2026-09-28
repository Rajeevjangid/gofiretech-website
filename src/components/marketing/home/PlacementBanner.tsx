'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Building2, TrendingUp, Users, Award } from 'lucide-react'

const companies = [
  'TCS', 'Infosys', 'Wipro', 'Accenture', 'Deloitte', 'HCL', 'Cognizant', 'IBM',
  'Capgemini', 'L&T Infotech', 'Mphasis', 'Hexaware', 'Persistent', 'NIIT',
]

const placementStats = [
  { icon: Users, value: '500+', label: 'Students Placed' },
  { icon: Building2, value: '50+', label: 'Hiring Partners' },
  { icon: TrendingUp, value: '75%', label: 'Placement Rate' },
  { icon: Award, value: '4-12 LPA', label: 'Average Package' },
]

export default function PlacementBanner() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="section-padding relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-glow-orange pointer-events-none" />

      <div className="container-gf relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="badge-gf mb-4">Placement Partners</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Our graduates work at{' '}
            <span className="text-gradient">India&apos;s top companies</span>
          </h2>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {placementStats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="glass-card rounded-2xl p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-[#FF5A1F]" />
              </div>
              <p className="text-2xl font-extrabold text-foreground mb-1">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Companies marquee */}
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#050811] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#050811] to-transparent z-10" />
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="flex gap-4 w-max"
          >
            {[...companies, ...companies].map((company, i) => (
              <div
                key={`${company}-${i}`}
                className="glass px-6 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap border border-border"
              >
                {company}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
