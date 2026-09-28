/**
 * src/lib/seo.ts
 *
 * Server-side helper for fetching and merging SEO settings from the database.
 *
 * Usage in a Next.js page (server component):
 *   export async function generateMetadata(): Promise<Metadata> {
 *     return buildMetadata('home', {
 *       title: 'GoFire Tech — Skills Today. Success Tomorrow.',
 *       description: 'Fallback description...',
 *     })
 *   }
 *
 * Rules:
 *   - DB value wins over fallback when present and non-empty
 *   - Fallback wins when DB value is null / empty string
 *   - noIndex flag from DB is always respected
 *   - ogImage from DB overrides thumbnail-based OG image (used in listing pages;
 *     detail pages use their own record's thumbnail)
 *   - The root layout applies template: '%s | GoFire Tech'.
 *     Titles from the DB may already include "| GoFire Tech" — we strip it
 *     here so the template doesn't double-append it.
 */

import { Metadata } from 'next'
import { db } from '@/lib/db'
import { cache } from 'react'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://gofiretech.com'
const SITE_NAME = 'GoFire Tech'

// PAGE_PATHS maps SEO page keys to their canonical paths
const PAGE_PATHS: Record<string, string> = {
  home:    '/',
  courses: '/courses',
  blog:    '/blog',
  notes:   '/notes',
  about:   '/about',
  contact: '/contact',
}


interface SeoFallback {
  title:       string
  description?: string
  keywords?:   string
  ogImage?:    string
}

/** Cached DB fetch per page key (deduplicated within a single request) */
const fetchSeoRow = cache(async (page: string) => {
  try {
    return await db.seoSetting.findUnique({ where: { page } })
  } catch {
    return null
  }
})

/**
 * Strips " | GoFire Tech" (and common variants) from the end of a title.
 * The root layout's template: '%s | GoFire Tech' will append it automatically,
 * so if the DB already includes it we must remove it to avoid duplication.
 */
function stripSiteSuffix(title: string): string {
  return title
    .replace(/\s*[|–—-]\s*GoFire Tech\s*$/i, '')
    .trim()
}

/**
 * Builds a complete Next.js Metadata object for a listing/static page.
 * DB values override fallbacks when present.
 */
export async function buildMetadata(
  pageKey: string,
  fallback: SeoFallback,
): Promise<Metadata> {
  const row = await fetchSeoRow(pageKey)

  // Strip " | GoFire Tech" suffix so Next.js template doesn't double-append it
  const rawTitle    = row?.title?.trim() || fallback.title
  const title       = stripSiteSuffix(rawTitle)
  const description = row?.description?.trim() || fallback.description
  const keywords    = row?.keywords?.trim()    || fallback.keywords
  const ogImage     = row?.ogImage?.trim()     || fallback.ogImage
  const noIndex     = row?.noIndex ?? false
  const path        = PAGE_PATHS[pageKey] ?? '/'
  const canonical   = `${SITE_URL}${path}`

  const meta: Metadata = {
    title,

    ...(description ? { description } : {}),
    ...(keywords    ? { keywords }    : {}),
    alternates: { canonical },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      ...(description ? { description } : {}),
      url:      canonical,
      siteName: SITE_NAME,
      type:     'website',
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: {
      card:  ogImage ? 'summary_large_image' : 'summary',
      title,
      ...(description ? { description } : {}),
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }

  return meta
}
