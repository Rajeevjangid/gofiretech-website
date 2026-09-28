/**
 * GET  /api/admin/settings — returns all site settings as [{key, value}]
 * PUT  /api/admin/settings — upserts all key/value pairs from body object
 *
 * Uses the existing SiteSettings KV table (same one used by Branding/Homepage CMS).
 * Each setting is stored under a unique `key`. The `group` column distinguishes
 * settings from branding/homepage keys.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

const SETTINGS_KEYS = [
  'site_name', 'site_tagline',
  'contact_email', 'contact_phone', 'contact_whatsapp', 'contact_address',
  'social_instagram', 'social_linkedin', 'social_youtube',
  'social_twitter', 'social_facebook',
]

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rows = await db.siteSettings.findMany({
      where: { key: { in: SETTINGS_KEYS } },
      select: { key: true, value: true },
    })

    return NextResponse.json(rows)
  } catch (err) {
    console.error('[admin/settings GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── PUT ───────────────────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json() as Record<string, string>

    // Only upsert known settings keys — reject unknown keys
    const upserts = SETTINGS_KEYS
      .filter(k => body[k] !== undefined)
      .map(k =>
        db.siteSettings.upsert({
          where: { key: k },
          create: { key: k, value: body[k] ?? '' },
          update: { value: body[k] ?? '' },
        })
      )

    await Promise.all(upserts)

    return NextResponse.json({ success: true, updated: upserts.length })
  } catch (err) {
    console.error('[admin/settings PUT]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
