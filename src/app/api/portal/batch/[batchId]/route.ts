import { NextRequest, NextResponse } from 'next/server'
import { getStudentFromRequest, checkEnrollmentAccess } from '@/lib/student-auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { batchId: string } }) {
  const session = await getStudentFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hasAccess = await checkEnrollmentAccess(session.studentId, params.batchId)
  if (!hasAccess) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

  const batch = await db.batch.findUnique({
    where: { id: params.batchId },
    include: {
      course: { select: { id: true, title: true, slug: true, level: true } },
      modules: {
        where: { isPublished: true },
        orderBy: { order: 'asc' },
        include: {
          resources: {
            where: { isPublished: true },
            orderBy: { order: 'asc' },
            select: { id: true, type: true, title: true, description: true, duration: true, order: true },
          },
        },
      },
    },
  })

  if (!batch) return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
  return NextResponse.json(batch)
}
