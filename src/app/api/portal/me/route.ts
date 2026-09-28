import { NextRequest, NextResponse } from 'next/server'
import { getStudentFromRequest } from '@/lib/student-auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getStudentFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const student = await db.student.findUnique({
    where: { id: session.studentId },
    select: { id: true, enrollmentId: true, name: true, email: true, phone: true, profileImage: true, createdAt: true },
  })
  return NextResponse.json(student)
}

export async function PATCH(req: NextRequest) {
  const session = await getStudentFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, phone } = body
  const updated = await db.student.update({
    where: { id: session.studentId },
    data: { name: name || undefined, phone: phone !== undefined ? phone : undefined },
    select: { id: true, enrollmentId: true, name: true, email: true, phone: true },
  })
  return NextResponse.json(updated)
}
