import { NextRequest, NextResponse } from 'next/server'
import { getStudentFromRequest, checkEnrollmentAccess } from '@/lib/student-auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { resourceId: string } }) {
  const session = await getStudentFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const resource = await db.learningResource.findUnique({
    where: { id: params.resourceId },
    include: { module: { include: { batch: { select: { id: true } } } } },
  })
  if (!resource || !resource.isPublished) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const batchId = resource.module.batch.id
  const hasAccess = await checkEnrollmentAccess(session.studentId, batchId)
  if (!hasAccess) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

  return NextResponse.json(resource)
}
