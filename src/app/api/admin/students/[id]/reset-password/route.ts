import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { sendStudentCredentials } from '@/lib/email'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const student = await db.student.findUnique({ where: { id: params.id } })
  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const plainPassword = Math.random().toString(36).slice(-10)
  const hashed = await bcrypt.hash(plainPassword, 12)
  await db.student.update({
    where: { id: params.id },
    data: { password: hashed, failedLoginAttempts: 0, lockedUntil: null },
  })

  let emailStatus = 'not_sent'
  if (student.email) {
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gofiretech.com'}/portal/login`
    const result = await sendStudentCredentials({
      to: student.email, name: student.name, enrollmentId: student.enrollmentId, password: plainPassword, loginUrl,
    })
    if (result.success) {
      await db.student.update({ where: { id: params.id }, data: { credentialEmailSentAt: new Date() } })
      emailStatus = 'sent'
    } else {
      emailStatus = 'failed'
    }
  }

  return NextResponse.json({
    ok: true,
    emailStatus,
    plainPassword: student.email ? undefined : plainPassword,
  })
}
