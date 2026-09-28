import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export const PORTAL_COOKIE = 'portal_session'
export const SESSION_DURATION_DAYS = 7

export interface StudentSessionData {
  studentId: string
  enrollmentId: string
  name: string
  email: string
  isActive: boolean
}

export async function getStudentFromCookie(): Promise<StudentSessionData | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(PORTAL_COOKIE)?.value
    if (!token) return null
    return validateStudentToken(token)
  } catch {
    return null
  }
}

export async function getStudentFromRequest(req: NextRequest): Promise<StudentSessionData | null> {
  const token = req.cookies.get(PORTAL_COOKIE)?.value
  if (!token) return null
  return validateStudentToken(token)
}

async function validateStudentToken(token: string): Promise<StudentSessionData | null> {
  try {
    const session = await db.studentSession.findUnique({
      where: { token },
      include: { student: { select: { id: true, enrollmentId: true, name: true, email: true, isActive: true, lockedUntil: true } } },
    })
    if (!session) return null
    if (session.expiresAt < new Date()) {
      await db.studentSession.delete({ where: { id: session.id } }).catch(() => {})
      return null
    }
    const s = session.student
    if (!s.isActive) return null
    if (s.lockedUntil && s.lockedUntil > new Date()) return null
    return { studentId: s.id, enrollmentId: s.enrollmentId, name: s.name, email: s.email, isActive: s.isActive }
  } catch {
    return null
  }
}

export async function checkEnrollmentAccess(studentId: string, batchId: string): Promise<boolean> {
  try {
    const enrollment = await db.enrollment.findUnique({
      where: { studentId_batchId: { studentId, batchId } },
      select: { status: true, validUntil: true },
    })
    if (!enrollment) return false
    if (enrollment.status !== 'ACTIVE') return false
    if (enrollment.validUntil && enrollment.validUntil < new Date()) return false
    return true
  } catch {
    return false
  }
}

export async function generateEnrollmentId(): Promise<string> {
  const year = new Date().getFullYear()
  const yearStart = new Date(`${year}-01-01T00:00:00.000Z`)
  const yearEnd = new Date(`${year + 1}-01-01T00:00:00.000Z`)
  const count = await db.student.count({
    where: { createdAt: { gte: yearStart, lt: yearEnd } },
  })
  return `GFT-${year}-${String(count + 1).padStart(5, '0')}`
}

export async function createStudentSession(studentId: string): Promise<string> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS)
  const session = await db.studentSession.create({
    data: { studentId, expiresAt },
  })
  return session.token
}

export async function deleteStudentSession(token: string): Promise<void> {
  await db.studentSession.deleteMany({ where: { token } }).catch(() => {})
}
