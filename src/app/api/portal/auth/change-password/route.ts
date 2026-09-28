import { NextRequest, NextResponse } from 'next/server'
import { getStudentFromRequest } from '@/lib/student-auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const session = await getStudentFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { currentPassword, newPassword } = await req.json()
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const student = await db.student.findUnique({ where: { id: session.studentId } })
  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const valid = await bcrypt.compare(currentPassword, student.password)
  if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })

  const hashed = await bcrypt.hash(newPassword, 12)
  await db.student.update({ where: { id: session.studentId }, data: { password: hashed } })
  return NextResponse.json({ ok: true })
}
