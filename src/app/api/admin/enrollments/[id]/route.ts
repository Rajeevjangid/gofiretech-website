import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'EXPIRED']).optional(),
  validUntil: z.string().optional().nullable(),
  adminNotes: z.string().optional(),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const enrollment = await db.enrollment.findUnique({
    where: { id: params.id },
    include: {
      student: { select: { id: true, enrollmentId: true, name: true, email: true } },
      batch: { include: { course: { select: { id: true, title: true } } } },
    },
  })
  if (!enrollment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(enrollment)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { validUntil, ...rest } = parsed.data
  const enrollment = await db.enrollment.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(validUntil !== undefined ? { validUntil: validUntil ? new Date(validUntil) : null } : {}),
    },
  })
  return NextResponse.json(enrollment)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await db.enrollment.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
