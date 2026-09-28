'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, BookOpen, Lock, Tag,
  FileText, CheckCircle2,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import DemoCheckoutModal from './DemoCheckoutModal'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Note {
  id: string; slug: string; title: string; description: string | null
  thumbnail: string | null; price: number | null; originalPrice: number | null
  isFree: boolean; subject: string | null; category: string | null
  pageCount: number | null; previewPages: number
  previewContent: string | null
  fullContent: string | null   // non-null only when server verified isFree=true
  hasAccess: boolean           // true only for free notes (server-side)
}

const BUYER_EMAIL_KEY = 'gofiretech_buyer_email'

// ── Already-purchased banner ──────────────────────────────────────────────────
function AlreadyPurchasedBanner({ email }: { email: string }) {
  return (
    <div className="my-8 flex items-center gap-3 px-5 py-4 rounded-2xl"
      style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.20)' }}>
      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      <div>
        <p className="text-sm font-bold text-emerald-300">Access Granted</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Purchased with <span className="text-foreground">{email}</span>
        </p>
      </div>
    </div>
  )
}

// ── Paywall section (for users without access) ────────────────────────────────
function PaywallSection({
  note,
  onUnlock,
  storedEmail,
}: {
  note: Note
  onUnlock: () => void
  storedEmail: string
}) {
  return (
    <div className="my-10">
      {/* Blurred lock preview */}
      <div className="relative rounded-2xl overflow-hidden mb-6"
        style={{ border: '1px solid rgba(232,0,28,0.20)' }}>
        <div className="p-6 select-none pointer-events-none"
          style={{ filter: 'blur(4px)', opacity: 0.35, maxHeight: 140, overflow: 'hidden' }}>
          <div className="space-y-2.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-3 rounded bg-white/10 ${i === 4 ? 'w-2/5' : 'w-full'}`} />
            ))}
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(to bottom, transparent 10%, rgba(5,8,17,0.97) 60%)' }}>
          <Lock className="w-9 h-9 text-red-400 mb-2" />
          <p className="text-foreground font-semibold text-sm">Full content is locked</p>
        </div>
      </div>

      {/* Unlock card */}
      <div className="rounded-2xl border border-border p-8"
        style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'rgba(232,0,28,0.10)', border: '1px solid rgba(232,0,28,0.18)' }}>
            <Lock className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-xl font-extrabold text-foreground mb-2">Unlock Full Notes</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Get instant access to the complete{' '}
            <strong className="text-foreground">{note.pageCount ? `${note.pageCount}-page` : 'full'}</strong>{' '}
            notes for <strong className="text-foreground">{note.title}</strong>.
          </p>
        </div>

        {/* Price */}
        <div className="flex items-baseline justify-center gap-3 mb-7">
          <span className="text-3xl font-extrabold text-foreground">
            {note.price ? formatCurrency(note.price) : 'Paid'}
          </span>
          {note.originalPrice && (
            <span className="text-lg text-muted-foreground line-through">
              {formatCurrency(note.originalPrice)}
            </span>
          )}
        </div>

        {/* What you get */}
        <ul className="space-y-2 mb-7 max-w-sm mx-auto">
          {[
            'Complete notes — all topics covered',
            note.pageCount ? `${note.pageCount} pages of structured content` : 'Comprehensive content',
            'Lifetime access after purchase',
            'Instant unlock after payment',
          ].map(item => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="max-w-sm mx-auto">
          <button
            onClick={onUnlock}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#E8001C,#c50018)', boxShadow: '0 4px 14px rgba(232,0,28,0.35)' }}
          >
            <Lock className="w-4 h-4" />
            Buy Notes — {note.price ? formatCurrency(note.price) : 'Paid'}
          </button>
          <p className="text-[11px] text-center text-muted-foreground mt-3">
            Demo checkout — no real payment required
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function NoteDetailClient({ note }: { note: Note }) {
  // Server may pass hasAccess=true only for free notes
  const [hasAccess,    setHasAccess]    = useState(note.hasAccess || note.isFree)
  const [fullContent,  setFullContent]  = useState<string | null>(note.fullContent)
  const [buyerEmail,   setBuyerEmail]   = useState('')
  const [checkingAccess, setCheckingAccess] = useState(false)
  const [modalOpen,    setModalOpen]    = useState(false)

  // ── Restore access from localStorage on mount ─────────────────────────────
  // This satisfies: "Refresh page → ACTIVE access persists"
  const checkStoredAccess = useCallback(async () => {
    if (hasAccess) return   // already free or server-granted

    const storedEmail = localStorage.getItem(BUYER_EMAIL_KEY)
    if (!storedEmail) return

    setBuyerEmail(storedEmail)
    setCheckingAccess(true)
    try {
      const res  = await fetch(`/api/notes/${note.slug}?email=${encodeURIComponent(storedEmail)}`)
      const data = await res.json()
      if (data.hasAccess && data.fullContent) {
        setHasAccess(true)
        setFullContent(data.fullContent)
      }
    } catch {
      // Silently fail — user will just see paywall
    } finally {
      setCheckingAccess(false)
    }
  }, [note.slug, hasAccess])

  useEffect(() => { checkStoredAccess() }, [checkStoredAccess])

  // ── Called by DemoCheckoutModal on confirmed success ──────────────────────
  const handlePaymentSuccess = useCallback((content: string | null, email: string) => {
    localStorage.setItem(BUYER_EMAIL_KEY, email)
    setBuyerEmail(email)
    setHasAccess(true)
    setFullContent(content)
    setModalOpen(false)
  }, [])

  // ── Derived ───────────────────────────────────────────────────────────────
  const storedEmail   = buyerEmail
  const showPaywall   = !hasAccess && !note.isFree && !checkingAccess

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ── */}
      <div className="relative pt-32 pb-12 border-b border-border overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="container-gf relative z-10 max-w-4xl">
          <Link href="/notes"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Notes
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {note.subject && (
              <div className="flex items-center gap-1.5 text-xs text-primary mb-3">
                <Tag className="w-3.5 h-3.5" /> {note.subject}
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-5 leading-tight">
              {note.title}
            </h1>
            <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              {note.pageCount && (
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> {note.pageCount} pages
                </span>
              )}
              {note.isFree ? (
                <span className="text-emerald-400 font-semibold">Free</span>
              ) : (
                <span className="flex items-baseline gap-2">
                  <span className="text-white font-bold">
                    {note.price ? formatCurrency(note.price) : 'Paid'}
                  </span>
                  {note.originalPrice && (
                    <span className="line-through text-xs">
                      {formatCurrency(note.originalPrice)}
                    </span>
                  )}
                </span>
              )}
              {/* Access badge */}
              {hasAccess && !note.isFree && (
                <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Purchased
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="container-gf py-14 max-w-4xl">

        {/* Cover image */}
        {note.thumbnail && (
          <img src={note.thumbnail} alt={note.title}
            className="w-full h-56 sm:h-80 object-cover rounded-2xl mb-10 border border-border"
          />
        )}

        {/* Description */}
        {note.description && (
          <p className="text-muted-foreground mb-8 text-base leading-relaxed">{note.description}</p>
        )}

        {/* Checking access spinner */}
        {checkingAccess && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 animate-pulse">
            <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
            Checking your access…
          </div>
        )}

        {/* Already-purchased banner (for paid notes the user bought) */}
        {hasAccess && !note.isFree && storedEmail && (
          <AlreadyPurchasedBanner email={storedEmail} />
        )}

        {/* ── Preview content ── */}
        {note.previewContent && (
          <div>
            {!hasAccess && (
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-widest mb-4">
                <BookOpen className="w-3.5 h-3.5" />
                Free Preview — First {note.previewPages} {note.previewPages === 1 ? 'section' : 'sections'}
              </div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="prose-gf"
              dangerouslySetInnerHTML={{ __html: note.previewContent }}
            />
          </div>
        )}

        {/* ── Full content (accessible users only) ── */}
        {hasAccess && fullContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose-gf mt-8"
            dangerouslySetInnerHTML={{ __html: fullContent }}
          />
        )}

        {/* ── Paywall ── */}
        {showPaywall && (
          <PaywallSection
            note={note}
            storedEmail={storedEmail}
            onUnlock={() => setModalOpen(true)}
          />
        )}
      </div>

      {/* ── Demo Checkout Modal ── */}
      <DemoCheckoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        note={{
          id:            note.id,
          title:         note.title,
          price:         note.price,
          originalPrice: note.originalPrice,
          pageCount:     note.pageCount,
        }}
        prefillEmail={storedEmail}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
