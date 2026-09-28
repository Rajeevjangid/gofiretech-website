import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const student = await db.student.findUnique({
    where: { id: params.id },
    include: {
      enrollments: {
        include: { batch: { include: { course: { select: { id: true, title: true } } } } },
        orderBy: { enrolledAt: 'desc' },
      },
      noteAccesses: { include: { note: { select: { id: true, title: true } } } },
    },
  })
  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { password: _p, ...safe } = student as any
  return NextResponse.json(safe)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { phone, ...rest } = parsed.data
  const student = await db.student.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(phone !== undefined ? { phone } : {}),
    },
    select: { id: true, enrollmentId: true, name: true, email: true, phone: true, isActive: true, updatedAt: true },
  })
  return NextResponse.json(student)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await db.student.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
