import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { sendStudentCredentials } from '@/lib/email'

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8).optional(),
})

async function generateEnrollmentId(): Promise<string> {
  const year = new Date().getFullYear()
  const yearStart = new Date(`${year}-01-01T00:00:00.000Z`)
  const yearEnd   = new Date(`${year + 1}-01-01T00:00:00.000Z`)
  const count = await db.student.count({ where: { createdAt: { gte: yearStart, lt: yearEnd } } })
  return `GFT-${year}-${String(count + 1).padStart(5, '0')}`
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page  = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'))
  const q     = searchParams.get('q')?.trim() || ''

  const where = q ? {
    OR: [
      { name: { contains: q } },
      { email: { contains: q } },
      { enrollmentId: { contains: q } },
    ],
  } : {}

  const [students, total] = await Promise.all([
    db.student.findMany({
      where, skip: (page - 1) * limit, take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, enrollmentId: true, name: true, email: true, phone: true,
        isActive: true, credentialEmailSentAt: true, createdAt: true,
        _count: { select: { enrollments: true } },
      },
    }),
    db.student.count({ where }),
  ])

  return NextResponse.json({ students, total, page, limit })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { name, email, phone, password: rawPassword } = parsed.data

  const plainPassword = rawPassword || Math.random().toString(36).slice(-10)
  const hashedPassword = await bcrypt.hash(plainPassword, 12)
  const enrollmentId   = await generateEnrollmentId()

  const student = await db.student.create({
    data: {
      enrollmentId,
      name,
      email: email.toLowerCase().trim(),
      phone: phone || null,
      password: hashedPassword,
      isActive: true,
    },
  })

  let emailStatus = 'not_sent'
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gofiretech.com'}/portal/login`
  const result = await sendStudentCredentials({ to: student.email, name, enrollmentId, password: plainPassword, loginUrl })
  if (result.success) {
    await db.student.update({ where: { id: student.id }, data: { credentialEmailSentAt: new Date() } })
    emailStatus = 'sent'
  } else {
    emailStatus = 'failed'
  }

  const { password: _pw, ...safeStudent } = student as any
  return NextResponse.json({ student: safeStudent, emailStatus, tempPassword: rawPassword ? undefined : plainPassword }, { status: 201 })
}
