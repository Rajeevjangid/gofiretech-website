import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { ALLOWED_DOC_TYPES, MAX_DOC_SIZE, savePrivateFile } from '@/lib/private-storage'

const CATEGORIES = ['IDENTITY', 'PHOTOGRAPH', 'EDUCATION', 'CERTIFICATE', 'RECEIPT', 'OTHER']
const select = { id: true, title: true, category: true, fileName: true, mimeType: true, size: true, createdAt: true }

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await db.studentDocument.findMany({ where: { studentId: params.id }, select, orderBy: { createdAt: 'desc' } }))
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await db.student.findUnique({ where: { id: params.id }, select: { id: true } }))) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  if (!form || !(file instanceof File)) return NextResponse.json({ error: 'File required' }, { status: 400 })
  if (!ALLOWED_DOC_TYPES[file.type]) return NextResponse.json({ error: 'Only PDF, JPG, PNG or WebP files are allowed' }, { status: 400 })
  if (file.size > MAX_DOC_SIZE) return NextResponse.json({ error: 'File exceeds 10 MB' }, { status: 400 })

  const category = String(form.get('category') || 'OTHER')
  const title = String(form.get('title') || '').trim() || file.name
  const storageKey = await savePrivateFile(Buffer.from(await file.arrayBuffer()), file.type)

  const doc = await db.studentDocument.create({
    data: {
      studentId: params.id, title: title.slice(0, 200),
      category: CATEGORIES.includes(category) ? category : 'OTHER',
      fileName: file.name.slice(0, 200), mimeType: file.type, size: file.size, storageKey,
      uploadedBy: session.user.email ?? null,
    },
    select,
  })
  return NextResponse.json(doc, { status: 201 })
}
