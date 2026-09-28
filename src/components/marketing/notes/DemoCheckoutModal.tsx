'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Lock, Loader2, CheckCircle2, XCircle, AlertTriangle,
  FlaskConical, IndianRupee, FileText, ShieldCheck,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────
type PaymentState =
  | 'idle'          // form shown
  | 'processing'    // fake network delay
  | 'confirming'    // server confirm call
  | 'success'       // payment went through
  | 'failed'        // simulated failure
  | 'cancelled'     // user dismissed

interface DemoCheckoutModalProps {
  isOpen:       boolean
  onClose:      () => void
  note: {
    id:            string
    title:         string
    price:         number | null
    originalPrice: number | null
    pageCount:     number | null
  }
  prefillEmail?: string
  onSuccess: (fullContent: string | null, buyerEmail: string) => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const DEMO_DELAY_MS = 2200  // simulate "processing" delay

function sleep(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms))
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DemoCheckoutModal({
  isOpen, onClose, note, prefillEmail = '', onSuccess,
}: DemoCheckoutModalProps) {
  const [email,       setEmail]       = useState(prefillEmail)
  const [name,        setName]        = useState('')
  const [payState,    setPayState]    = useState<PaymentState>('idle')
  const [errorMsg,    setErrorMsg]    = useState('')
  const [orderId,     setOrderId]     = useState('')
  const [paymentId,   setPaymentId]   = useState('')
  const [paidAt,      setPaidAt]      = useState('')

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail(prefillEmail)
      setName('')
      setPayState('idle')
      setErrorMsg('')
      setOrderId('')
    }
  }, [isOpen, prefillEmail])

  // ── Step 1: Initiate ───────────────────────────────────────────────────────
  const initiatePayment = async (): Promise<string | null> => {
    const res = await fetch('/api/notes/demo-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId: note.id, buyerEmail: email.trim(), buyerName: name.trim() }),
    })
    const data = await res.json()

    if (!res.ok) {
      if (data.error === 'already_purchased') {
        // Edge case: already active — surface error
        throw new Error('already_purchased')
      }
      throw new Error(data.error || 'Failed to initiate payment')
    }
    setOrderId(data.orderId)
    return data.orderId
  }

  // ── Step 2: Confirm (success or failure) ───────────────────────────────────
  const confirmPayment = async (oid: string, success: boolean) => {
    const res = await fetch('/api/notes/demo-checkout/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: oid, buyerEmail: email.trim(), success }),
    })
    return res.json()
  }

  // ── Handle Pay click ───────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!email.trim()) { setErrorMsg('Email is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid email')
      return
    }
    setErrorMsg('')
    setPayState('processing')

    try {
      // Initiate on server
      const oid = await initiatePayment()
      if (!oid) return

      // Fake processing delay (replace with gateway redirect in production)
      await sleep(DEMO_DELAY_MS)

      setPayState('confirming')

      // Confirm on server
      const result = await confirmPayment(oid, true)

      if (result.status === 'ACTIVE') {
        setPaymentId(result.paymentId || '')
        setPaidAt(result.paidAt || new Date().toISOString())
        setPayState('success')
        // Notify parent after a brief success display
        setTimeout(() => onSuccess(result.fullContent, email.trim()), 1800)
      } else {
        setErrorMsg(result.message || 'Payment could not be confirmed.')
        setPayState('failed')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      if (msg === 'already_purchased') {
        setErrorMsg('You already have access to this note!')
        setPayState('idle')
      } else {
        setErrorMsg(msg)
        setPayState('failed')
      }
    }
  }

  // ── Handle Simulate Failure ────────────────────────────────────────────────
  const handleSimulateFailure = async () => {
    if (!email.trim()) { setErrorMsg('Email is required to simulate'); return }
    setErrorMsg('')
    setPayState('processing')

    try {
      const oid = await initiatePayment()
      if (!oid) return

      await sleep(1200)
      setPayState('confirming')

      const result = await confirmPayment(oid, false)
      setErrorMsg(result.message || 'Payment failed.')
      setPayState('failed')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error')
      setPayState('failed')
    }
  }

  const handleCancel = () => {
    setPayState('cancelled')
    setTimeout(onClose, 600)
  }

  const handleRetry = () => {
    setPayState('idle')
    setErrorMsg('')
  }

  // ── Prevent body scroll when modal open ───────────────────────────────────
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else        document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // ── Sub-views ──────────────────────────────────────────────────────────────

  /** Processing / confirming spinner */
  const ProcessingView = () => (
    <div className="py-14 text-center">
      <div className="relative inline-flex mb-6">
        <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
      <h3 className="text-white font-bold text-lg mb-2">
        {payState === 'confirming' ? 'Confirming payment…' : 'Processing demo payment…'}
      </h3>
      <p className="text-muted-foreground text-sm">
        {payState === 'confirming'
          ? 'Verifying with server and unlocking content…'
          : 'Simulating payment gateway response…'}
      </p>
    </div>
  )

  /** Success view */
  const SuccessView = () => (
    <div className="py-12 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5"
        style={{ background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.30)' }}
      >
        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
      </motion.div>
      <h3 className="text-2xl font-extrabold text-foreground mb-2">Notes Unlocked! 🎉</h3>
      <p className="text-muted-foreground text-sm mb-5 max-w-xs mx-auto">
        Demo payment confirmed. Full content is now loading…
      </p>
      <div className="text-xs text-muted-foreground space-y-1">
        {paymentId && <p>Payment ID: <span className="text-foreground font-mono">{paymentId}</span></p>}
        {paidAt   && <p>Paid at: <span className="text-white">{new Date(paidAt).toLocaleString()}</span></p>}
      </div>
    </div>
  )

  /** Failed view */
  const FailedView = () => (
    <div className="py-10 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
        style={{ background: 'rgba(239,68,68,0.10)', border: '2px solid rgba(239,68,68,0.25)' }}>
        <XCircle className="w-9 h-9 text-red-400" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">Payment Failed</h3>
      <p className="text-muted-foreground text-sm mb-7 max-w-xs mx-auto">
        {errorMsg || 'The demo payment was not processed. No money was charged.'}
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={handleRetry}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg,#E8001C,#c50018)', boxShadow: '0 2px 8px rgba(232,0,28,0.25)' }}>
          Try Again
        </button>
        <button onClick={onClose}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground bg-secondary border border-border hover:text-foreground transition-colors">
          Close
        </button>
      </div>
    </div>
  )

  /** Main idle / form view */
  const FormView = () => (
    <div>
      {/* Demo banner */}
      <div className="mx-6 mt-4 mb-5 flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
        style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.20)' }}>
        <FlaskConical className="w-4 h-4 text-yellow-400 shrink-0" />
        <div>
          <p className="text-yellow-300 text-xs font-bold">DEMO PAYMENT — No real money will be charged</p>
          <p className="text-yellow-400/70 text-[11px] mt-0.5">
            This simulates a payment flow for testing purposes only.
          </p>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-5">
        {/* Order summary */}
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Summary</p>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'rgba(232,0,28,0.10)', border: '1px solid rgba(232,0,28,0.18)' }}>
                <FileText className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">{note.title}</p>
                {note.pageCount && <p className="text-xs text-muted-foreground mt-0.5">{note.pageCount} pages · Full access</p>}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-white font-bold">{note.price ? formatCurrency(note.price) : '—'}</p>
              {note.originalPrice && (
                <p className="text-muted-foreground line-through text-xs">{formatCurrency(note.originalPrice)}</p>
              )}
            </div>
          </div>
          <div className="border-t border-border pt-3 flex justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-foreground font-extrabold text-base">
              {note.price ? formatCurrency(note.price) : '—'}
            </span>
          </div>
        </div>

        {/* Buyer details */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Details</p>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          <input
            type="email" value={email} onChange={e => { setEmail(e.target.value); setErrorMsg('') }}
            placeholder="Email address *"
            className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-red-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {errorMsg}
            </div>
          )}
        </div>

        {/* Security note */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          Price is verified server-side. Client cannot alter the amount.
        </div>

        {/* Action buttons */}
        <div className="space-y-2.5">
          {/* Primary Pay */}
          <button
            onClick={handlePay}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#E8001C,#c50018)', boxShadow: '0 4px 14px rgba(232,0,28,0.35)' }}
          >
            <IndianRupee className="w-4 h-4" />
            Pay {note.price ? formatCurrency(note.price) : '—'} (Demo)
          </button>

          {/* Simulate failure */}
          <button
            onClick={handleSimulateFailure}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-yellow-400/80 bg-yellow-400/5 border border-yellow-400/15 hover:border-yellow-400/30 hover:text-yellow-300 transition-all"
          >
            <span className="flex items-center justify-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5" />
              Simulate Failed Payment
            </span>
          </button>

          {/* Cancel */}
          <button
            onClick={handleCancel}
            className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={payState === 'idle' || payState === 'failed' ? onClose : undefined}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(5,8,17,0.85)', backdropFilter: 'blur(4px)' }}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: 'none' }}
          >
            <div
              className="w-full max-w-md rounded-2xl overflow-hidden"
              style={{
                background:    'rgba(10,13,24,0.97)',
                border:        '1px solid rgba(255,255,255,0.08)',
                boxShadow:     '0 25px 60px rgba(0,0,0,0.7)',
                pointerEvents: 'all',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(232,0,28,0.10)', border: '1px solid rgba(232,0,28,0.18)' }}>
                    <Lock className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-none">Unlock Notes</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Demo Checkout</p>
                  </div>
                </div>
                {(payState === 'idle' || payState === 'failed') && (
                  <button onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Body — swap view by state */}
              <AnimatePresence mode="wait">
                {(payState === 'processing' || payState === 'confirming') && (
                  <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ProcessingView />
                  </motion.div>
                )}
                {payState === 'success' && (
                  <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <SuccessView />
                  </motion.div>
                )}
                {payState === 'failed' && (
                  <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <FailedView />
                  </motion.div>
                )}
                {(payState === 'idle' || payState === 'cancelled') && (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <FormView />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
