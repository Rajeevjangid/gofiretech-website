import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { deletePrivateFile } from '@/lib/private-storage'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const doc = await db.studentDocument.findUnique({ where: { id: params.id } })
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await db.studentDocument.delete({ where: { id: doc.id } })
  await deletePrivateFile(doc.storageKey)
  return NextResponse.json({ ok: true })
}
