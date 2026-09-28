import { NextRequest, NextResponse } from 'next/server'
import { deleteStudentSession, PORTAL_COOKIE } from '@/lib/student-auth'

export async function POST(req: NextRequest) {
  const token = req.cookies.get(PORTAL_COOKIE)?.value
  if (token) await deleteStudentSession(token)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(PORTAL_COOKIE, '', { maxAge: 0, path: '/' })
  return res
}
