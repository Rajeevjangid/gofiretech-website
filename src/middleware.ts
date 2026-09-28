import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

const PORTAL_COOKIE = 'portal_session'

const PUBLIC_PORTAL_ROUTES = ['/portal/login', '/portal/forgot-password']

const adminHandler = auth((req: any) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn  = !!session
  const isLoginPage = nextUrl.pathname === '/admin/login'
  if (isLoginPage && isLoggedIn)   return NextResponse.redirect(new URL('/admin/dashboard', nextUrl))
  if (!isLoginPage && !isLoggedIn) return NextResponse.redirect(new URL('/admin/login', nextUrl))
  return NextResponse.next()
})

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin')) return (adminHandler as any)(req)

  if (pathname.startsWith('/portal')) {
    const isPublic = PUBLIC_PORTAL_ROUTES.some(p => pathname.startsWith(p))
    if (!isPublic) {
      const token = req.cookies.get(PORTAL_COOKIE)?.value
      if (!token) {
        const url = new URL('/portal/login', req.nextUrl)
        url.searchParams.set('from', pathname)
        return NextResponse.redirect(url)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/portal/:path*'],
}
