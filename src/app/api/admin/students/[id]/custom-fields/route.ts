import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  fields: z.array(z.object({
    label: z.string().trim().min(1).max(100),
    value: z.string().max(2000),
    visibleToStudent: z.boolean().default(true),
  })).max(50),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const fields = await db.studentCustomField.findMany({ where: { studentId: params.id }, orderBy: { order: 'asc' } })
  return NextResponse.json(fields)
}

// Replace the student's custom-field list.
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  if (!(await db.student.findUnique({ where: { id: params.id }, select: { id: true } }))) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }
  await db.$transaction([
    db.studentCustomField.deleteMany({ where: { studentId: params.id } }),
    db.studentCustomField.createMany({
      data: parsed.data.fields.map((f, i) => ({ ...f, studentId: params.id, order: i })),
    }),
  ])
  const fields = await db.studentCustomField.findMany({ where: { studentId: params.id }, orderBy: { order: 'asc' } })
  return NextResponse.json(fields)
}
