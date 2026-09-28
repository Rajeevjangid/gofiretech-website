'use client'

import { signOut } from 'next-auth/react'
import { Bell, LogOut, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'

interface AdminHeaderProps {
 user: {
  name?: string | null
  email?: string | null
  image?: string | null
} | null
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-semibold text-muted-foreground">GoFire Tech • Admin</h2>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-foreground/[0.05] transition-colors">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF5A1F] rounded-full" />
        </button>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-foreground/[0.05] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-foreground leading-none">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-muted-foreground">{user?.email || ''}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl p-1.5 shadow-glass z-50">
              <button
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
