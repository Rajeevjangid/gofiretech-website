import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createSchema = z.object({
  moduleId: z.string().min(1),
  type: z.enum(['NOTE', 'PDF', 'RECORDED_LECTURE', 'STUDY_MATERIAL', 'ASSIGNMENT', 'QUIZ', 'LINK', 'OTHER']),
  title: z.string().min(1),
  description: z.string().optional(),
  url: z.string().optional(),
  duration: z.string().optional(),
  order: z.number().int().default(0),
  isPublished: z.boolean().default(false),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const moduleId = searchParams.get('moduleId')
  const where = moduleId ? { moduleId } : {}

  const resources = await db.learningResource.findMany({ where, orderBy: { order: 'asc' } })
  return NextResponse.json({ resources })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const resource = await db.learningResource.create({
    data: { ...parsed.data, description: parsed.data.description || null, url: parsed.data.url || null, duration: parsed.data.duration || null },
  })
  return NextResponse.json(resource, { status: 201 })
}
