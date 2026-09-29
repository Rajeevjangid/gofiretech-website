import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getStudentFromRequest } from '@/lib/student-auth'
import { readPrivateFile } from '@/lib/private-storage'

// Authorized download: admin, or the student who owns the document.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const doc = await db.studentDocument.findUnique({ where: { id: params.id } })
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const admin = await auth()
  if (!admin?.user) {
    const student = await getStudentFromRequest(req)
    if (!student) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (student.studentId !== doc.studentId) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const buf = await readPrivateFile(doc.storageKey)
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        'Content-Type': doc.mimeType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(doc.fileName)}"`,
        'Content-Length': String(buf.length),
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store',
      },
    })
  } catch {
    return NextResponse.json({ error: 'File missing' }, { status: 404 })
  }
}
