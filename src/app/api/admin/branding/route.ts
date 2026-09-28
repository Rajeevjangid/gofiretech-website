import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { BRANDING_KEYS, BRANDING_DEFAULTS } from '@/lib/branding-defaults'
import path from 'path'
import { existsSync } from 'fs'
import { writeFile } from 'fs/promises'
import sharp from 'sharp'

// ── GET — return all branding values ────────────────────────────────────────
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
    console.error('[admin/branding GET]', err)
    return NextResponse.json(BRANDING_DEFAULTS)
  }
}

/**
 * Auto-trim transparent whitespace from a logo stored in /public.
 * Creates a new *-trimmed.webp file alongside the original.
 * Returns the public URL of the trimmed file (or original URL on failure).
 * The original file is never modified.
 */
async function trimLogoIfNeeded(publicUrl: string): Promise<string> {
  // Only process local /uploads/ files; skip external URLs and default assets
  if (!publicUrl.startsWith('/uploads/')) return publicUrl

  const fsPath = path.join(process.cwd(), 'public', publicUrl)
  if (!existsSync(fsPath)) return publicUrl

  // If already a trimmed file, return as-is
  if (publicUrl.includes('-trimmed.')) return publicUrl

  try {
    const image = sharp(fsPath)
    const meta  = await image.metadata()

    // Only trim if the image has an alpha channel (transparent padding possible)
    if (!meta.hasAlpha) return publicUrl

    // sharp's trim() removes borders of the same color (transparent in this case)
    const trimmed = await sharp(fsPath)
      .trim({ threshold: 10 }) // alpha threshold — removes near-transparent borders
      .webp({ quality: 92 })
      .toBuffer()

    const trimmedMeta = await sharp(trimmed).metadata()

    // Only save and use trimmed version if it's meaningfully smaller in area
    const originalArea = (meta.width ?? 1) * (meta.height ?? 1)
    const trimmedArea  = (trimmedMeta.width ?? 1) * (trimmedMeta.height ?? 1)
    const reduction    = 1 - trimmedArea / originalArea

    if (reduction < 0.05) {
      // Less than 5% reduction — no meaningful padding, keep original
      return publicUrl
    }

    // Save trimmed copy alongside original
    const ext     = path.extname(publicUrl) // e.g. .webp
    const base    = publicUrl.slice(0, publicUrl.length - ext.length) // strip extension
    const trimUrl = base + '-trimmed.webp'
    const trimFs  = path.join(process.cwd(), 'public', trimUrl)

    await writeFile(trimFs, trimmed)

    console.log(
      `[branding] Trimmed logo ${publicUrl} → ${trimUrl} ` +
      `(${meta.width}x${meta.height} → ${trimmedMeta.width}x${trimmedMeta.height}, ` +
      `${(reduction * 100).toFixed(0)}% area reduction)`
    )

    return trimUrl
  } catch (err) {
    // Non-fatal — fall back to original URL
    console.warn('[branding] Logo trim failed for', publicUrl, err)
    return publicUrl
  }
}

// ── PUT — upsert branding values (admin only) ───────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: Record<string, string> = await req.json()
    const updates = Object.entries(body).filter(([k]) =>
      (BRANDING_KEYS as readonly string[]).includes(k)
    )

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid keys provided' }, { status: 400 })
    }

    // For logo keys (not favicon), auto-trim transparent whitespace
    const logoKeys = ['branding.header_logo', 'branding.footer_logo', 'branding.admin_logo'] as const
    const processed = await Promise.all(
      updates.map(async ([key, value]) => {
        const finalValue = logoKeys.includes(key as typeof logoKeys[number])
          ? await trimLogoIfNeeded(value)
          : value
        return [key, finalValue] as [string, string]
      })
    )

    await Promise.all(
      processed.map(([key, value]) =>
        db.siteSettings.upsert({
          where:  { key },
          create: { key, value: JSON.stringify(value) },
          update: { value: JSON.stringify(value) },
        })
      )
    )

    return NextResponse.json({
      success: true,
      updated: processed.map(([k]) => k),
      values: Object.fromEntries(processed),
    })
  } catch (err) {
    console.error('[admin/branding PUT]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
