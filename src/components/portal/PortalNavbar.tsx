'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { LogOut, User, ChevronDown, Flame } from 'lucide-react'
import Image from 'next/image'

interface PortalNavbarProps {
  studentName: string
  enrollmentId: string
}

export default function PortalNavbar({ studentName, enrollmentId }: PortalNavbarProps) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  const logoSrc = mounted && resolvedTheme === 'light' ? '/logo-light.webp' : '/logo-dark.webp'

  const logout = async () => {
    setLoggingOut(true)
    await fetch('/api/portal/auth/logout', { method: 'POST' })
    router.push('/portal/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/portal/dashboard" className="flex items-center gap-2">
          {mounted ? (
            <Image src={logoSrc} alt="GoFire Tech" width={120} height={44}
              className="h-9 w-auto object-contain" priority />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Flame className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-sm text-foreground">GoFire Tech</span>
            </div>
          )}
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs font-mono text-muted-foreground bg-foreground/5 px-2 py-1 rounded">
            {enrollmentId}
          </span>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-foreground/[0.06] transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
                {studentName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                <Link href="/portal/profile" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-foreground hover:bg-foreground/[0.05] transition-colors">
                  <User className="w-4 h-4" /> My Profile
                </Link>
                <button onClick={logout} disabled={loggingOut}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-500/5 transition-colors border-t border-border">
                  <LogOut className="w-4 h-4" />
                  {loggingOut ? 'Logging out...' : 'Log out'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
