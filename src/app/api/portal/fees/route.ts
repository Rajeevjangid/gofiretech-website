import { NextRequest, NextResponse } from 'next/server'
import { getStudentFromRequest } from '@/lib/student-auth'
import { getStudentFees } from '@/lib/fees'

// Student's own fees only — studentId always comes from the server session.
export async function GET(req: NextRequest) {
  const session = await getStudentFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await getStudentFees(session.studentId))
}
