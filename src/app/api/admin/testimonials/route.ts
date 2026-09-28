import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  name:        z.string().min(2),
  role:        z.string().optional(),
  company:     z.string().optional(),
  image:       z.string().nullable().optional(),
  content:     z.string().min(10),
  rating:      z.number().min(1).max(5).default(5),
  isPublished: z.boolean().default(true),
  order:       z.number().min(0).default(0),
})

// GET /api/admin/testimonials
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const testimonials = await db.testimonial.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('[testimonials GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/testimonials
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const testimonial = await db.testimonial.create({ data: parsed.data })
    return NextResponse.json(testimonial, { status: 201 })
  } catch (error) {
    console.error('[testimonials POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
