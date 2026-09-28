'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2, Save, Plus, Trash2, GripVertical, ChevronDown, ChevronUp,
  Home, BarChart3, Layers, Megaphone, Globe, Info, Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MediaPicker from '@/components/admin/MediaPicker'

// ── Icon options for cards ────────────────────────────────────────────────
const ICON_OPTIONS = [
  'ShieldCheck', 'Briefcase', 'Trophy', 'Users', 'Clock', 'GraduationCap',
  'Star', 'Zap', 'Target', 'CheckCircle', 'Award', 'BookOpen',
  'Code2', 'Brain', 'Shield', 'Cloud', 'Database', 'Rocket',
  'MessageCircle', 'Globe',
]

// ── Sidebar tabs ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'hero',     label: 'Hero Section',       icon: Home      },
  { id: 'stats',    label: 'Statistics',         icon: BarChart3 },
  { id: 'about',    label: 'About Section',      icon: Info      },
  { id: 'features', label: 'Features/Benefits',  icon: Sparkles  },
  { id: 'why',      label: 'Why Choose Us',      icon: Layers    },
  { id: 'cta',      label: 'CTA Banner',         icon: Megaphone },
  { id: 'footer',   label: 'Footer & Social',    icon: Globe     },
]

// ── Reusable field components ─────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }: any) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#FF5A1F] transition-colors"
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }: any) {
  return (
    <textarea
      rows={rows}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#FF5A1F] transition-colors resize-none"
    />
  )
}

function SaveBtn({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FF5A1F] hover:bg-orange-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {saving ? 'Saving...' : 'Save Changes'}
    </button>
  )
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  return (
    <Field label={label}>
      <div className="space-y-2">
        {value && (
          <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
            <img src={value} alt="preview" className="w-full h-full object-cover" />
            <button
              onClick={() => onChange('')}
              className="absolute top-2 right-2 p-1.5 rounded-md bg-black/70 text-white hover:bg-red-500/80 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <MediaPicker
          value={value}
          onChange={(url: string | null) => onChange(url ?? '')}
          label={value ? 'Change Image' : 'Select Image'}
        />
      </div>
    </Field>
  )
}

// ── Card editor (for Why Cards) ───────────────────────────────────────────
function CardEditor({
  cards, setCards, label,
}: {
  cards: any[]
  setCards: (c: any[]) => void
  label: string
}) {
  const [open, setOpen] = useState<string | null>(null)

  const add = () => {
    const newCard = {
      id: `card-${Date.now()}`,
      title: 'New Feature',
      desc: 'Description here',
      icon: 'Star',
      order: cards.length,
      active: true,
    }
    setCards([...cards, newCard])
    setOpen(newCard.id)
  }

  const update = (id: string, field: string, val: any) => {
    setCards(cards.map(c => c.id === id ? { ...c, [field]: val } : c))
  }

  const remove = (id: string) => {
    setCards(cards.filter(c => c.id !== id).map((c, i) => ({ ...c, order: i })))
    if (open === id) setOpen(null)
  }

  const move = (id: string, dir: -1 | 1) => {
    const idx = cards.findIndex(c => c.id === id)
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === cards.length - 1)) return
    const next = [...cards]
    ;[next[idx], next[idx + dir]] = [next[idx + dir], next[idx]]
    setCards(next.map((c, i) => ({ ...c, order: i })))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <button
          onClick={add}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground/[0.04] border border-border hover:border-[#FF5A1F]/50 text-xs text-foreground transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-[#FF5A1F]" /> Add Card
        </button>
      </div>

      <div className="space-y-2">
        {cards.map((card, idx) => (
          <div key={card.id} className="rounded-xl border border-border bg-input/30 overflow-hidden">
            {/* Card header */}
            <div
              className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-foreground/[0.03] transition-colors"
              onClick={() => setOpen(open === card.id ? null : card.id)}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 cursor-grab" />
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${card.active ? 'bg-green-500' : 'bg-muted-foreground'}`}
              />
              <span className="flex-1 text-sm font-medium text-foreground truncate">{card.title || 'Untitled'}</span>
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => move(card.id, -1)}
                  disabled={idx === 0}
                  className="p-1 rounded hover:bg-foreground/[0.06] text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => move(card.id, 1)}
                  disabled={idx === cards.length - 1}
                  className="p-1 rounded hover:bg-foreground/[0.06] text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => remove(card.id)}
                  className="p-1 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {open === card.id
                ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>

            {/* Card body */}
            <AnimatePresence>
              {open === card.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border">
                    <Field label="Title">
                      <Input value={card.title} onChange={(v: string) => update(card.id, 'title', v)} placeholder="Card title" />
                    </Field>
                    <Field label="Description">
                      <Textarea value={card.desc} onChange={(v: string) => update(card.id, 'desc', v)} placeholder="Card description" />
                    </Field>
                    <Field label="Icon">
                      <select
                        value={card.icon}
                        onChange={e => update(card.id, 'icon', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:border-[#FF5A1F]"
                      >
                        {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </Field>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">Active</label>
                      <button
                        onClick={() => update(card.id, 'active', !card.active)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${card.active ? 'bg-[#FF5A1F]' : 'bg-muted'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${card.active ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
          No cards yet. Click "Add Card" to create one.
        </div>
      )}
    </div>
  )
}

// ── Main Admin Page ───────────────────────────────────────────────────────
export default function AdminHomepagePage() {
  const [activeTab, setActiveTab] = useState('hero')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<Record<string, any>>({})

  useEffect(() => {
    setLoading(true)
    fetch('/api/admin/homepage')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const update = useCallback((key: string, val: any) => {
    setData(prev => ({ ...prev, [key]: val }))
  }, [])

  const updateNested = useCallback((key: string, field: string, val: any) => {
    setData(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } }))
  }, [])

  const save = async (keys: string[]) => {
    setSaving(true)
    const body: Record<string, any> = {}
    keys.forEach(k => { body[k] = data[k] })
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) toast.success('Saved successfully!')
      else toast.error('Failed to save')
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF5A1F]" />
      </div>
    )
  }

  const hero         = data['homepage.hero']          ?? {}
  const stats        = data['homepage.stats']         ?? []
  const heroStats    = data['homepage.hero_stats']    ?? []
  const about        = data['homepage.about']         ?? {}
  const features     = data['homepage.features']      ?? {}
  const featureCards = data['homepage.feature_cards'] ?? []
  const why          = data['homepage.why']           ?? {}
  const whyCards     = data['homepage.why_cards']     ?? []
  const cta          = data['homepage.cta']           ?? {}
  const footer       = data['homepage.footer']        ?? {}

  return (
    <div className="page-transition">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Homepage CMS</h1>
        <p className="text-muted-foreground text-sm mt-1">Edit all homepage content. Changes appear on the live site within 60 seconds.</p>
      </div>

      <div className="flex gap-6">
        {/* ── Sidebar tabs ── */}
        <aside className="w-52 shrink-0 space-y-1 sticky top-4 self-start">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                activeTab === tab.id
                  ? 'bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04] border border-transparent'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#FF5A1F]' : ''}`} />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* ── Tab content ── */}
        <div className="flex-1 min-w-0">

          {/* ── HERO ── */}
          {activeTab === 'hero' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Hero Section</h2>
                <SaveBtn saving={saving} onClick={() => save(['homepage.hero', 'homepage.hero_stats'])} />
              </div>
              <div className="glass-card rounded-2xl p-6 space-y-5">
                <Field label="Badge / Eyebrow text">
                  <Input value={hero.badge} onChange={(v: string) => updateNested('homepage.hero', 'badge', v)} placeholder="India's fastest-growing..." />
                </Field>
                <Field label="Headline (line 1)">
                  <Input value={hero.title} onChange={(v: string) => updateNested('homepage.hero', 'title', v)} placeholder="Build Skills That" />
                </Field>
                <Field label="Headline Highlight (line 2, red gradient)">
                  <Input value={hero.highlight} onChange={(v: string) => updateNested('homepage.hero', 'highlight', v)} placeholder="Get You Hired." />
                </Field>
                <Field label="Subheading">
                  <Textarea value={hero.subtitle} onChange={(v: string) => updateNested('homepage.hero', 'subtitle', v)} placeholder="Industry-grade programs..." />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Primary Button Text">
                    <Input value={hero.btn1Text} onChange={(v: string) => updateNested('homepage.hero', 'btn1Text', v)} placeholder="Explore Programs" />
                  </Field>
                  <Field label="Primary Button URL">
                    <Input value={hero.btn1Url} onChange={(v: string) => updateNested('homepage.hero', 'btn1Url', v)} placeholder="/courses" />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Secondary Button Text">
                    <Input value={hero.btn2Text} onChange={(v: string) => updateNested('homepage.hero', 'btn2Text', v)} placeholder="Talk to an Expert" />
                  </Field>
                  <Field label="Secondary Button URL">
                    <Input value={hero.btn2Url} onChange={(v: string) => updateNested('homepage.hero', 'btn2Url', v)} placeholder="/contact" />
                  </Field>
                </div>
                <ImageField label="Hero Background Image" value={hero.image ?? ''} onChange={v => updateNested('homepage.hero', 'image', v)} />
              </div>

              {/* Hero stats mini-bar */}
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-foreground">Hero Statistics Bar (4 items)</h3>
                {heroStats.map((s: any, i: number) => (
                  <div key={i} className="grid grid-cols-2 gap-3">
                    <Field label={`Stat ${i + 1} Value`}>
                      <Input value={s.value} onChange={(v: string) => {
                        const next = [...heroStats]; next[i] = { ...next[i], value: v }; update('homepage.hero_stats', next)
                      }} />
                    </Field>
                    <Field label={`Stat ${i + 1} Label`}>
                      <Input value={s.label} onChange={(v: string) => {
                        const next = [...heroStats]; next[i] = { ...next[i], label: v }; update('homepage.hero_stats', next)
                      }} />
                    </Field>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STATS ── */}
          {activeTab === 'stats' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Statistics Section</h2>
                <SaveBtn saving={saving} onClick={() => save(['homepage.stats'])} />
              </div>
              <div className="glass-card rounded-2xl p-6 space-y-5">
                <p className="text-sm text-muted-foreground">These 4 stats appear in the Statistics section below the Hero.</p>
                {stats.map((s: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-foreground/[0.03] border border-border space-y-3">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Stat {i + 1}</div>
                    <Field label="Value">
                      <Input value={s.value} onChange={(v: string) => {
                        const next = [...stats]; next[i] = { ...next[i], value: v }; update('homepage.stats', next)
                      }} placeholder="2,000+" />
                    </Field>
                    <Field label="Label">
                      <Input value={s.label} onChange={(v: string) => {
                        const next = [...stats]; next[i] = { ...next[i], label: v }; update('homepage.stats', next)
                      }} placeholder="Students Trained" />
                    </Field>
                    <Field label="Sub-label">
                      <Input value={s.sub} onChange={(v: string) => {
                        const next = [...stats]; next[i] = { ...next[i], sub: v }; update('homepage.stats', next)
                      }} placeholder="Across Tier-1, 2 & 3 cities" />
                    </Field>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── ABOUT ── */}
          {activeTab === 'about' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">About Section</h2>
                <SaveBtn saving={saving} onClick={() => save(['homepage.about'])} />
              </div>
              <div className="glass-card rounded-2xl p-6 space-y-5">
                <Field label="Tag / Eyebrow">
                  <Input value={about.tag} onChange={(v: string) => updateNested('homepage.about', 'tag', v)} placeholder="About GoFire Tech" />
                </Field>
                <Field label="Title (use \\n for line break)">
                  <Textarea value={about.title} onChange={(v: string) => updateNested('homepage.about', 'title', v)} placeholder="Where Passion Meets\nPurpose." rows={2} />
                </Field>
                <Field label="Body / Description (use \\n\\n for new paragraph)">
                  <Textarea value={about.body} onChange={(v: string) => updateNested('homepage.about', 'body', v)} placeholder="GoFire Tech was born from..." rows={6} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Button Text">
                    <Input value={about.btnText} onChange={(v: string) => updateNested('homepage.about', 'btnText', v)} placeholder="Learn Our Story" />
                  </Field>
                  <Field label="Button URL">
                    <Input value={about.btnUrl} onChange={(v: string) => updateNested('homepage.about', 'btnUrl', v)} placeholder="/about" />
                  </Field>
                </div>
                <ImageField label="About Image" value={about.image ?? ''} onChange={v => updateNested('homepage.about', 'image', v)} />
              </div>
            </motion.div>
          )}

          {/* ── FEATURES ── */}
          {activeTab === 'features' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Features / Benefits</h2>
                <SaveBtn saving={saving} onClick={() => save(['homepage.features', 'homepage.feature_cards'])} />
              </div>
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-foreground">Section Header</h3>
                <Field label="Tag / Label">
                  <Input value={features.tag} onChange={(v: string) => updateNested('homepage.features', 'tag', v)} placeholder="What Sets Us Apart" />
                </Field>
                <Field label="Title (use \\n for line break)">
                  <Textarea value={features.title} onChange={(v: string) => updateNested('homepage.features', 'title', v)} placeholder="Everything You Need\nto Get Hired." rows={2} />
                </Field>
                <Field label="Subtitle">
                  <Textarea value={features.subtitle} onChange={(v: string) => updateNested('homepage.features', 'subtitle', v)} placeholder="Description..." />
                </Field>
              </div>
              <div className="glass-card rounded-2xl p-6">
                <CardEditor cards={featureCards} setCards={v => update('homepage.feature_cards', v)} label="Feature Cards" />
              </div>
            </motion.div>
          )}

          {/* ── WHY ── */}
          {activeTab === 'why' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Why Choose Us</h2>
                <SaveBtn saving={saving} onClick={() => save(['homepage.why', 'homepage.why_cards'])} />
              </div>
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-foreground">Section Header</h3>
                <Field label="Tag / Label">
                  <Input value={why.tag} onChange={(v: string) => updateNested('homepage.why', 'tag', v)} placeholder="Why GoFire Tech" />
                </Field>
                <Field label="Title (use \\n for line break)">
                  <Textarea value={why.title} onChange={(v: string) => updateNested('homepage.why', 'title', v)} placeholder="Built Different.\nResults Different." rows={2} />
                </Field>
                <Field label="Subtitle">
                  <Textarea value={why.subtitle} onChange={(v: string) => updateNested('homepage.why', 'subtitle', v)} placeholder="Description..." />
                </Field>
              </div>
              <div className="glass-card rounded-2xl p-6">
                <CardEditor cards={whyCards} setCards={v => update('homepage.why_cards', v)} label="Feature Cards" />
              </div>
            </motion.div>
          )}

          {/* ── CTA ── */}
          {activeTab === 'cta' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">CTA Banner</h2>
                <SaveBtn saving={saving} onClick={() => save(['homepage.cta'])} />
              </div>
              <div className="glass-card rounded-2xl p-6 space-y-5">
                <Field label="Badge Text">
                  <Input value={cta.badge} onChange={(v: string) => updateNested('homepage.cta', 'badge', v)} placeholder="Limited Seats per Batch" />
                </Field>
                <Field label="Title (use \\n for line break)">
                  <Textarea value={cta.title} onChange={(v: string) => updateNested('homepage.cta', 'title', v)} placeholder="Ready to Ignite\nYour Tech Career?" rows={2} />
                </Field>
                <Field label="Subtitle">
                  <Textarea value={cta.subtitle} onChange={(v: string) => updateNested('homepage.cta', 'subtitle', v)} placeholder="Join thousands of students..." />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Primary Button Text">
                    <Input value={cta.btn1Text} onChange={(v: string) => updateNested('homepage.cta', 'btn1Text', v)} />
                  </Field>
                  <Field label="Primary Button URL">
                    <Input value={cta.btn1Url} onChange={(v: string) => updateNested('homepage.cta', 'btn1Url', v)} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Secondary Button Text">
                    <Input value={cta.btn2Text} onChange={(v: string) => updateNested('homepage.cta', 'btn2Text', v)} />
                  </Field>
                  <Field label="Secondary Button URL">
                    <Input value={cta.btn2Url} onChange={(v: string) => updateNested('homepage.cta', 'btn2Url', v)} />
                  </Field>
                </div>
                <ImageField label="Background Image" value={cta.image ?? ''} onChange={v => updateNested('homepage.cta', 'image', v)} />
              </div>
            </motion.div>
          )}

          {/* ── FOOTER ── */}
          {activeTab === 'footer' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Footer & Social Links</h2>
                <SaveBtn saving={saving} onClick={() => save(['homepage.footer'])} />
              </div>
              <div className="glass-card rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-bold text-foreground">Company Info</h3>
                <Field label="Description">
                  <Textarea value={footer.description} onChange={(v: string) => updateNested('homepage.footer', 'description', v)} placeholder="Empowering the next generation..." />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Email">
                    <Input value={footer.email} onChange={(v: string) => updateNested('homepage.footer', 'email', v)} placeholder="info@gofiretech.com" />
                  </Field>
                  <Field label="Phone">
                    <Input value={footer.phone} onChange={(v: string) => updateNested('homepage.footer', 'phone', v)} placeholder="+91 98765 43210" />
                  </Field>
                </div>
                <Field label="Address">
                  <Input value={footer.address} onChange={(v: string) => updateNested('homepage.footer', 'address', v)} placeholder="Hyderabad, Telangana, India" />
                </Field>
              </div>
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-foreground">Social Media Links</h3>
                {(['instagram', 'facebook', 'linkedin', 'youtube', 'twitter'] as const).map(platform => (
                  <Field key={platform} label={platform.charAt(0).toUpperCase() + platform.slice(1)}>
                    <Input
                      value={footer[platform]}
                      onChange={(v: string) => updateNested('homepage.footer', platform, v)}
                      placeholder={`https://${platform}.com/gofiretech`}
                    />
                  </Field>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  )
}
