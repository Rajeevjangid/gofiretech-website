import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createSchema = z.object({
  studentId: z.string().min(1),
  batchId: z.string().min(1),
  type: z.enum(['ONLINE', 'OFFLINE']).default('OFFLINE'),
  validUntil: z.string().optional().nullable(),
  adminNotes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page  = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'))
  const studentId = searchParams.get('studentId')
  const batchId   = searchParams.get('batchId')

  const where = {
    ...(studentId ? { studentId } : {}),
    ...(batchId   ? { batchId }   : {}),
  }

  const [enrollments, total] = await Promise.all([
    db.enrollment.findMany({
      where, skip: (page - 1) * limit, take: limit,
      include: {
        student: { select: { id: true, enrollmentId: true, name: true, email: true } },
        batch: { include: { course: { select: { id: true, title: true } } } },
      },
      orderBy: { enrolledAt: 'desc' },
    }),
    db.enrollment.count({ where }),
  ])

  return NextResponse.json({ enrollments, total, page, limit })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { studentId, batchId, type, validUntil, adminNotes } = parsed.data

  const existing = await db.enrollment.findUnique({ where: { studentId_batchId: { studentId, batchId } } })
  if (existing) return NextResponse.json({ error: 'Student is already enrolled in this batch' }, { status: 409 })

  const enrollment = await db.enrollment.create({
    data: {
      studentId, batchId, type,
      status: 'ACTIVE',
      validUntil: validUntil ? new Date(validUntil) : null,
      adminNotes: adminNotes || null,
    },
    include: {
      student: { select: { id: true, enrollmentId: true, name: true } },
      batch: { include: { course: { select: { id: true, title: true } } } },
    },
  })
  return NextResponse.json(enrollment, { status: 201 })
}
