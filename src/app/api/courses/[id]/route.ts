import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const adminMode = searchParams.get('admin') === 'true'

    // Admin mode: auth required, no published filter
    if (adminMode) {
      const session = await auth()
      if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const course = await db.course.findFirst({
        where: { OR: [{ id: params.id }, { slug: params.id }] },
      })
      if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      return NextResponse.json(course)
    }

    // Public: only published courses
    const course = await db.course.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }], isPublished: true },
    })
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const course = await db.course.update({
      where: { id: params.id },
      data: body,
    })

    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await db.course.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    // Strip non-updatable fields Prisma would reject
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, createdAt: _c, updatedAt: _u, slug: _s, ...data } = body
    const course = await db.course.update({ where: { id: params.id }, data })
    return NextResponse.json(course)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
