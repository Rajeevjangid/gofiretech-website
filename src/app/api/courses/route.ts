import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { slugify } from '@/lib/utils'

const courseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  content: z.string().optional(),
  thumbnail: z.string().optional(),
  price: z.number().optional(),
  originalPrice: z.number().optional(),
  duration: z.string().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  category: z.string().optional(),
  tags: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  instructor: z.string().optional(),
  instructorBio: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  outcomes: z.string().optional(),
  curriculum: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const published = searchParams.get('published')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    const where: any = {}
    if (category) where.category = { contains: category }
    if (featured === 'true') where.isFeatured = true
    // Public API: only published; admin can see all with ?published=all
    if (published !== 'all') where.isPublished = true

    const [courses, total] = await Promise.all([
      db.course.findMany({
        where,
        orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          thumbnail: true,
          price: true,
          originalPrice: true,
          duration: true,
          level: true,
          category: true,
          tags: true,
          isFeatured: true,
          isPublished: true,
          instructor: true,
          enrollmentCount: true,
          rating: true,
          createdAt: true,
        },
      }),
      db.course.count({ where }),
    ])

    return NextResponse.json({ courses, total, page, limit })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = courseSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ error: 'Validation failed', details: validated.error.flatten() }, { status: 400 })
    }

    const { title, ...rest } = validated.data
    const slug = slugify(title)

    // Ensure unique slug
    const existing = await db.course.findUnique({ where: { slug } })
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const course = await db.course.create({
      data: { title, slug: finalSlug, ...rest },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
