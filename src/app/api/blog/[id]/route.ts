import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { getReadTime, stripHtml } from '@/lib/utils'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const adminMode = searchParams.get('admin') === 'true'

    if (adminMode) {
      const session = await auth()
      if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const post = await db.blogPost.findFirst({
        where: { OR: [{ id: params.id }, { slug: params.id }] },
      })
      if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      return NextResponse.json(post)
    }

    const post = await db.blogPost.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }], isPublished: true },
    })
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    // Increment views (fire-and-forget)
    db.blogPost.update({ where: { id: post.id }, data: { views: { increment: 1 } } }).catch(() => {})

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { content, isPublished, ...rest } = body

    const updateData: Record<string, unknown> = { ...rest }
    if (content) {
      updateData.content = content
      updateData.readTime = getReadTime(stripHtml(content))
    }
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished
      if (isPublished) updateData.publishedAt = new Date()
    }

    const post = await db.blogPost.update({ where: { id: params.id }, data: updateData })
    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, createdAt: _c, updatedAt: _u, slug: _s, ...data } = body
    if (data.content) data.readTime = getReadTime(stripHtml(data.content))
    if (data.isPublished && !data.publishedAt) data.publishedAt = new Date()

    const post = await db.blogPost.update({ where: { id: params.id }, data })
    return NextResponse.json(post)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await db.blogPost.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

