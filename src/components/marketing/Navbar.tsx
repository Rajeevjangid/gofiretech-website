'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBranding } from '@/hooks/useBranding'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from 'next-themes'

const navLinks = [
  { label: 'Courses', href: '/courses' },
  { label: 'Notes',   href: '/notes' },
  { label: 'About',   href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname                     = usePathname()
  const { data: branding }           = useBranding()
  const headerLogo                   = branding['branding.header_logo'] || '/logo-dark.webp'
  
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const currentLogo = mounted && resolvedTheme === 'light' ? '/logo-light.webp' : headerLogo

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'dark:bg-[rgba(6,12,20,0.88)] bg-white/90 backdrop-blur-2xl dark:border-white/[0.06] border-black/[0.08] border-b shadow-sm dark:shadow-none'
            : 'bg-transparent'
        )}
      >
        <div className="container-pad">
          <nav className="flex items-center h-[68px] gap-8">

            {/* ── Official Logo ── */}
            <Link
              href="/"
              className="shrink-0 group relative flex items-center"
              aria-label="GoFire Tech — home"
            >
              <Image
                src={currentLogo}
                alt="GoFire Tech"
                width={160}
                height={160}
                priority
                quality={95}
                className="w-[120px] h-[44px] object-contain transition-opacity duration-200 group-hover:opacity-90"
              />
            </Link>

            {/* ── Desktop Navigation ── */}
            <div className="hidden md:flex items-center gap-1 flex-1">
              {navLinks.map(({ label, href }) => {
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'relative px-4 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150',
                      isActive
                        ? 'dark:text-white text-foreground'
                        : 'dark:text-white/45 text-foreground/50 dark:hover:text-white/85 hover:text-foreground dark:hover:bg-white/[0.05] hover:bg-foreground/[0.05]'
                    )}
                  >
                    {label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-4 -bottom-px h-px bg-[#E8001C] rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* ── Desktop CTAs ── */}
            <div className="hidden md:flex items-center gap-3 ml-auto">
              <Link
                href="/contact"
                className="text-[13px] font-medium dark:text-white/40 text-foreground/50 dark:hover:text-white/75 hover:text-foreground transition-colors duration-150 px-3 py-2"
              >
                Free Demo
              </Link>
              
              <ThemeToggle />

              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold text-white transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #E8001C 0%, #c50018 100%)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(232,0,28,0.5)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    '0 4px 16px rgba(232,0,28,0.4), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(232,0,28,0.6)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    '0 1px 2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(232,0,28,0.5)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                }}
              >
                Start Learning
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* ── Mobile Toggle ── */}
            <button
              className="md:hidden ml-auto w-9 h-9 flex items-center justify-center rounded-lg dark:text-white/50 text-foreground/50 dark:hover:text-white hover:text-foreground dark:hover:bg-white/[0.06] hover:bg-foreground/[0.06] transition-all duration-150"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </nav>
        </div>
      </header>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-[68px] z-40 dark:bg-[rgba(6,12,20,0.96)] bg-white/96 backdrop-blur-2xl border-b dark:border-white/[0.06] border-black/[0.08]"
          >
            <div className="container-pad py-5 space-y-1">
              {navLinks.map(({ label, href }) => {
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'block px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-150',
                      isActive
                        ? 'dark:text-white text-foreground dark:bg-white/[0.06] bg-foreground/[0.06]'
                        : 'dark:text-white/50 text-foreground/50 dark:hover:text-white hover:text-foreground dark:hover:bg-white/[0.04] hover:bg-foreground/[0.04]'
                    )}
                  >
                    {label}
                  </Link>
                )
              })}
              
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[14px] font-medium dark:text-white/50 text-foreground/50">Theme</span>
                <ThemeToggle />
              </div>

              <div className="pt-4 border-t dark:border-white/[0.06] border-black/[0.08] mt-2">
                <Link
                  href="/courses"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[14px] font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #E8001C 0%, #c50018 100%)' }}
                >
                  Start Learning <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
