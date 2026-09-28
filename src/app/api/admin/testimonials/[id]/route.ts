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
  rating:      z.number().min(1).max(5),
  isPublished: z.boolean(),
  order:       z.number().min(0),
})

// PUT /api/admin/testimonials/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const testimonial = await db.testimonial.update({
      where: { id: params.id },
      data:  parsed.data,
    })
    return NextResponse.json(testimonial)
  } catch (error) {
    console.error('[testimonials PUT]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/testimonials/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await db.testimonial.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[testimonials DELETE]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
