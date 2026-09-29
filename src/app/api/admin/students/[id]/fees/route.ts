import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getStudentFees } from '@/lib/fees'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await getStudentFees(params.id))
}
