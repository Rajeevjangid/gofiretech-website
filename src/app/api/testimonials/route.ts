import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/testimonials — public endpoint, returns published testimonials
export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      where: { isPublished: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true, name: true, role: true, company: true,
        image: true, content: true, rating: true, order: true,
      },
    })
    return NextResponse.json(testimonials)
  } catch (err) {
    console.error('[testimonials public GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
