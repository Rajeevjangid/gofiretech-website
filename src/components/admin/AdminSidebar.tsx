'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Flame, LayoutDashboard, BookOpen, FileText, Image,
  Search, MessageSquare, Settings, Users, BarChart3, ChevronRight, Home, Palette, StickyNote,
  GraduationCap, ClipboardList, Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBranding } from '@/hooks/useBranding'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const navItems = [
  { href: '/admin/dashboard',   icon: LayoutDashboard, label: 'Dashboard'     },
  { href: '/admin/homepage',    icon: Home,            label: 'Homepage CMS'  },
  { href: '/admin/courses',     icon: BookOpen,        label: 'Courses'       },
  { href: '/admin/notes',       icon: StickyNote,      label: 'Notes'         },
  { href: '/admin/blog',        icon: FileText,        label: 'Blog Posts'    },
  { href: '/admin/media',       icon: Image,           label: 'Media Library' },
  { href: '/admin/branding',    icon: Palette,         label: 'Branding'      },
  { href: '/admin/contacts',    icon: MessageSquare,   label: 'Inquiries'     },
  { href: '/admin/testimonials',icon: Users,           label: 'Testimonials'  },
  { href: '/admin/seo',         icon: Search,          label: 'SEO Manager'   },
  { href: '/admin/settings',    icon: Settings,        label: 'Settings'      },
]

const portalNavItems = [
  { href: '/admin/students',    icon: GraduationCap,   label: 'Students'      },
  { href: '/admin/enrollments', icon: ClipboardList,   label: 'Enrollments'   },
  { href: '/admin/batches',     icon: Layers,          label: 'Batches'       },
]


export default function AdminSidebar() {
  const pathname = usePathname()
  const { data: branding } = useBranding()
  const adminLogo = branding['branding.admin_logo']
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // In light mode use the dark-ink logo; in dark mode use the white transparent logo
  const logoSrc = mounted && resolvedTheme === 'light' ? '/logo-light.webp' : (adminLogo || '/logo-dark.webp')

  return (
    <aside className="admin-sidebar w-64 flex-shrink-0 flex flex-col h-screen sticky top-0">
      {/* Logo / Brand */}
      <div className="p-5 border-b border-border">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoSrc}
              alt="GoFire Tech"
              className="h-9 object-contain max-w-[140px] w-auto"
              style={{ maxHeight: 36, minWidth: 36 }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-glow-sm">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground leading-none">GoFire Tech</p>
                <p className="text-[10px] text-muted-foreground">Admin Panel</p>
              </div>
            </>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}>
              <div className={cn('admin-nav-item', isActive && 'active')}>
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </div>
            </Link>
          )
        })}

        {/* Learning Portal section */}
        <div className="pt-3 pb-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Learning Portal</p>
        </div>
        {portalNavItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}>
              <div className={cn('admin-nav-item', isActive && 'active')}>
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          View Website
        </Link>
      </div>
    </aside>
  )
}
