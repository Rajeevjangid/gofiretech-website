'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { Loader2, Eye, EyeOff, Flame } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PortalLoginForm() {
  const router = useRouter()
  const sp = useSearchParams()
  const from = sp.get('from') || '/portal/dashboard'
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  useEffect(() => { setMounted(true) }, [])
  const logoSrc = mounted && resolvedTheme === 'light' ? '/logo-light.webp' : '/logo-dark.webp'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/portal/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Login failed'); return }
      router.push(from)
      router.refresh()
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/">
            {mounted ? (
              <Image src={logoSrc} alt="GoFire Tech" width={160} height={60} className="h-12 w-auto object-contain mx-auto" priority />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Flame className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold text-foreground">GoFire Tech</span>
              </div>
            )}
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-6">Student Portal</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to access your learning materials</p>
        </div>

        <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input type="email" required value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="input-field w-full" placeholder="your@email.com" autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input-field w-full pr-10" placeholder="Enter password" />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="text-right">
            <Link href="/portal/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Forgot password?
            </Link>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          &copy; {new Date().getFullYear()} GoFire Tech &mdash;{' '}
          <Link href="/" className="hover:text-foreground transition-colors">Back to Website</Link>
        </p>
      </div>
    </div>
  )
}
