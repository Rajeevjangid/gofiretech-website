import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { BRANDING_KEYS, BRANDING_DEFAULTS } from '@/lib/branding-defaults'

// Cache for 60 seconds — revalidated when admin saves
export const revalidate = 60

export async function GET() {
  try {
    const rows = await db.siteSettings.findMany({
      where: { key: { in: [...BRANDING_KEYS] } },
    })

    const result: Record<string, string> = {}
    for (const key of BRANDING_KEYS) {
      const row = rows.find(r => r.key === key)
      result[key] = row ? JSON.parse(row.value) : BRANDING_DEFAULTS[key]
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[public branding GET]', err)
    return NextResponse.json(BRANDING_DEFAULTS)
  }
}
