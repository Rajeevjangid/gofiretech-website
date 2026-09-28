import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  maxSeats: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const batch = await db.batch.findUnique({
    where: { id: params.id },
    include: {
      course: { select: { id: true, title: true } },
      modules: { orderBy: { order: 'asc' }, include: { resources: { orderBy: { order: 'asc' } } } },
      _count: { select: { enrollments: true } },
    },
  })
  if (!batch) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(batch)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { startDate, endDate, ...rest } = parsed.data
  const batch = await db.batch.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(startDate !== undefined ? { startDate: startDate ? new Date(startDate) : null } : {}),
      ...(endDate   !== undefined ? { endDate:   endDate   ? new Date(endDate)   : null } : {}),
    },
  })
  return NextResponse.json(batch)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await db.batch.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
