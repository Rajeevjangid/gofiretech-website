import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createSchema = z.object({
  courseId: z.string().min(1),
  name: z.string().min(2),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxStudents: z.number().int().positive().optional(),
  price: z.number().optional(),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(false),
  order: z.number().int().default(0),
})

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId')
  const where = courseId ? { courseId } : {}

  const batches = await db.batch.findMany({
    where,
    include: {
      course: { select: { id: true, title: true } },
      _count: { select: { enrollments: true, modules: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ batches })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { courseId, name, description, startDate, endDate, maxStudents, price, isActive, isPublished, order } = parsed.data

  // Generate a unique slug
  let slug = slugify(name)
  const existing = await db.batch.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now()}`

  const batch = await db.batch.create({
    data: {
      courseId, name, slug,
      description: description || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      maxStudents: maxStudents || null,
      price: price ? price : null,
      isActive, isPublished, order,
    },
  })
  return NextResponse.json(batch, { status: 201 })
}
