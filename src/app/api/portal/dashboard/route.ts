import { NextRequest, NextResponse } from 'next/server'
import { getStudentFromRequest } from '@/lib/student-auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getStudentFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const enrollments = await db.enrollment.findMany({
    where: { studentId: session.studentId },
    include: {
      batch: {
        include: {
          course: { select: { id: true, title: true, slug: true, thumbnail: true, level: true } },
          _count: { select: { modules: true } },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  })

  // Also get purchased notes
  const purchasedNotes = await db.noteAccess.findMany({
    where: { studentId: session.studentId, status: 'ACTIVE' },
    include: { note: { select: { id: true, title: true, slug: true, thumbnail: true, subject: true } } },
    orderBy: { createdAt: 'desc' },
  })

  // Never expose internal admin fields to students.
  const safeEnrollments = enrollments.map(({ adminNotes: _n, paymentId: _p, paymentGateway: _g, ...e }) => e)
  return NextResponse.json({ enrollments: safeEnrollments, purchasedNotes })
}
