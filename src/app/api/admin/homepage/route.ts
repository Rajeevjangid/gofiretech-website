import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { HOMEPAGE_DEFAULTS, HOMEPAGE_KEYS } from '@/lib/homepage-defaults'

// ── GET — fetch all homepage settings ─────────────────────────────────────
export async function GET() {
  try {
    const rows = await db.siteSettings.findMany({
      where: { key: { in: [...HOMEPAGE_KEYS] } },
    })

    const result: Record<string, any> = {}
    for (const key of HOMEPAGE_KEYS) {
      const row = rows.find(r => r.key === key)
      result[key] = row ? JSON.parse(row.value) : (HOMEPAGE_DEFAULTS as any)[key]
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── PUT — upsert one or more homepage keys ────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: Record<string, any> = await req.json()
    const updates = Object.entries(body).filter(([key]) =>
      (HOMEPAGE_KEYS as string[]).includes(key)
    )

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid keys provided' }, { status: 400 })
    }

    await Promise.all(
      updates.map(([key, value]) =>
        db.siteSettings.upsert({
          where:  { key },
          create: { key, value: JSON.stringify(value) },
          update: { value: JSON.stringify(value) },
        })
      )
    )

    return NextResponse.json({ success: true, updated: updates.map(([k]) => k) })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
