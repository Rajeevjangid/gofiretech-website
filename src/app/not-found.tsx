import Link from 'next/link'
import { Flame, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050811] flex items-center justify-center">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="text-center relative z-10 p-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-glow">
          <Flame className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-8xl font-extrabold text-gradient mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-3">Page not found</h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          Looks like this page doesn't exist. Let's get you back on track.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 btn-gf-primary px-6 py-3 rounded-xl font-semibold relative overflow-hidden"
        >
          <span className="relative z-10"><ArrowLeft className="inline w-4 h-4 mr-1" />Back to Home</span>
        </Link>
      </div>
    </div>
  )
}
