import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
        <p className="text-muted-foreground text-sm">
          Please contact GoFire Tech admin to reset your password.
        </p>
        <p className="text-muted-foreground text-sm">
          Email:{' '}
          <a href="mailto:admin@gofiretech.com" className="text-primary">
            admin@gofiretech.com
          </a>
        </p>
        <Link href="/portal/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>
    </div>
  )
}
