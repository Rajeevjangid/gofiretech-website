import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createSchema = z.object({
  batchId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int().default(0),
  isPublished: z.boolean().default(false),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const batchId = searchParams.get('batchId')
  const where = batchId ? { batchId } : {}

  const modules = await db.module.findMany({
    where,
    include: { _count: { select: { resources: true } } },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json({ modules })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const module = await db.module.create({ data: parsed.data })
  return NextResponse.json(module, { status: 201 })
}
