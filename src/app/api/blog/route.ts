import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { slugify, getReadTime, stripHtml } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const all = searchParams.get('all')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '9')
    const skip = (page - 1) * limit

    const where: any = {}
    if (!all) where.isPublished = true
    if (category) where.category = category
    if (featured === 'true') where.isFeatured = true

    const [posts, total] = await Promise.all([
      db.blogPost.findMany({
        where,
        orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          thumbnail: true,
          category: true,
          tags: true,
          authorName: true,
          authorImage: true,
          isFeatured: true,
          isPublished: true,
          readTime: true,
          views: true,
          publishedAt: true,
          createdAt: true,
        },
      }),
      db.blogPost.count({ where }),
    ])

    return NextResponse.json({ posts, total, page, limit })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { title, content, ...rest } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const slug = slugify(title)
    const existing = await db.blogPost.findUnique({ where: { slug } })
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug
    const readTime = getReadTime(stripHtml(content))

    const post = await db.blogPost.create({
      data: {
        title,
        slug: finalSlug,
        content,
        readTime,
        publishedAt: rest.isPublished ? new Date() : null,
        ...rest,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
