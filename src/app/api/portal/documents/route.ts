import { NextRequest, NextResponse } from 'next/server'
import { getStudentFromRequest } from '@/lib/student-auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getStudentFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const docs = await db.studentDocument.findMany({
    where: { studentId: session.studentId },
    select: { id: true, title: true, category: true, fileName: true, mimeType: true, size: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(docs)
}
