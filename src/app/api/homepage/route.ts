import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { HOMEPAGE_DEFAULTS, HOMEPAGE_KEYS } from '@/lib/homepage-defaults'

// Revalidate cached response every 60 seconds
export const revalidate = 60

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
    // Always return defaults so the public site never breaks
    return NextResponse.json(HOMEPAGE_DEFAULTS)
  }
}
