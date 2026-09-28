'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  role: string | null
  company: string | null
  image: string | null
  content: string
  rating: number
}

// Fallback initials-based avatar colours (cycles through when no image)
const AVATAR_COLORS = [
  'linear-gradient(135deg, #E8001C, #9b0014)',
  'linear-gradient(135deg, #1B3D45, #0d2229)',
  'linear-gradient(135deg, #064e3b, #022c22)',
  'linear-gradient(135deg, #1e3a8a, #0f172a)',
  'linear-gradient(135deg, #6b21a8, #3b0764)',
]

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const container = { animate: { transition: { staggerChildren: 0.09 } } }
const cardAnim  = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export default function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([])

  useEffect(() => {
    fetch('/api/testimonials')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setItems(data) })
      .catch(console.error)
  }, [])

  // Don't render the section at all if there are no published testimonials
  if (items.length === 0) return null

  return (
    <section className="section">
      <div className="container-pad">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center max-w-xl mx-auto mb-14"
        >
          <div className="label-tag justify-center mb-3">Success Stories</div>
          <h2 className="text-headline text-foreground">
            Students Who Proved<br />It&apos;s Possible
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={container}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.15 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {items.map((t, i) => (
            <motion.div key={t.id} variants={cardAnim}
              className="glass-card rounded-2xl p-7 flex flex-col gap-5">

              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s}
                    className={`w-4 h-4 ${s < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                &ldquo;{t.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                {t.image ? (
                  <img src={t.image} alt={t.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                    {initials(t.name)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[t.role, t.company].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
