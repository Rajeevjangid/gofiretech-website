import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createStudentSession, PORTAL_COOKIE, SESSION_DURATION_DAYS } from '@/lib/student-auth'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = LoginSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const { email, password } = parsed.data
    const student = await db.student.findUnique({ where: { email: email.toLowerCase().trim() } })

    if (!student) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    if (!student.isActive) return NextResponse.json({ error: 'Account is suspended. Contact GoFire Tech.' }, { status: 403 })
    if (student.lockedUntil && student.lockedUntil > new Date()) {
      return NextResponse.json({ error: 'Account temporarily locked due to too many failed attempts. Try again later.' }, { status: 429 })
    }

    const valid = await bcrypt.compare(password, student.password)
    if (!valid) {
      const attempts = student.failedLoginAttempts + 1
      const lockUntil = attempts >= 10 ? new Date(Date.now() + 30 * 60 * 1000) : null
      await db.student.update({
        where: { id: student.id },
        data: { failedLoginAttempts: attempts, lockedUntil: lockUntil },
      })
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Reset failed attempts on successful login
    await db.student.update({ where: { id: student.id }, data: { failedLoginAttempts: 0, lockedUntil: null } })

    const token = await createStudentSession(student.id)
    const expires = new Date()
    expires.setDate(expires.getDate() + SESSION_DURATION_DAYS)

    const res = NextResponse.json({ ok: true, name: student.name, enrollmentId: student.enrollmentId })
    res.cookies.set(PORTAL_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires,
      path: '/',
    })
    return res
  } catch (err) {
    console.error('[portal/login]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
