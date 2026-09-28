import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Student Portal — GoFire Tech',
  description: 'Access your enrolled courses, notes, and learning resources.',
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      {children}
    </div>
  )
}
