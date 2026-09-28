import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { unlink } from 'fs/promises'
import path from 'path'

// ── DELETE /api/admin/media/[id] ────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const record = await db.mediaFile.findUnique({ where: { id: params.id } })
    if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Delete physical file (non-fatal if already gone)
    try {
      const filePath = path.join(process.cwd(), 'public', record.filename)
      await unlink(filePath)
    } catch {
      // File already deleted or path mismatch — continue
    }

    await db.mediaFile.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[media DELETE]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
