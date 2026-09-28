export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import NoteDetailClient from '@/components/marketing/notes/NoteDetailClient'

interface Props { params: { slug: string } }

// ── Dynamic SEO metadata ──────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = await db.note.findUnique({
    where: { slug: params.slug, isPublished: true },
    select: {
      title: true, description: true, thumbnail: true,
      metaTitle: true, metaDescription: true, subject: true,
    },
  })
  if (!note) return { title: 'Note Not Found' }

  // Strip " | GoFire Tech" if present — the root layout template appends it automatically
  const rawTitle    = note.metaTitle || note.title
  const title       = rawTitle.replace(/\s*[|–—-]\s*GoFire Tech\s*$/i, '').trim()
  const description = note.metaDescription || note.description || undefined
  const siteUrl     = process.env.NEXT_PUBLIC_APP_URL || 'https://gofiretech.com'
  const canonicalUrl = `${siteUrl}/notes/${params.slug}`

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'GoFire Tech',
      type: 'article',
      ...(note.thumbnail ? { images: [{ url: note.thumbnail }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(note.thumbnail ? { images: [note.thumbnail] } : {}),
    },
  }
}

// ── Server component — enforces access control ────────────────────────────────
// fullContent is NEVER forwarded to the client unless server-verified access exists.
export default async function NoteDetailPage({ params }: Props) {
  const note = await db.note.findUnique({
    where: { slug: params.slug, isPublished: true },
    select: {
      id: true, title: true, slug: true, description: true,
      thumbnail: true, price: true, originalPrice: true, isFree: true,
      subject: true, category: true, tags: true,
      previewContent: true,
      // fullContent intentionally omitted from server-side default fetch
      pageCount: true, previewPages: true,
      metaTitle: true, metaDescription: true,
      createdAt: true, updatedAt: true,
    },
  })
  if (!note) notFound()

  // Server-side: free notes get fullContent too
  let fullContent: string | null = null
  if (note.isFree) {
    const full = await db.note.findUnique({
      where: { id: note.id },
      select: { fullContent: true },
    })
    fullContent = full?.fullContent ?? null
  }

  const noteForClient = {
    ...note,
    price:         note.price         ? Number(note.price)         : null,
    originalPrice: note.originalPrice ? Number(note.originalPrice) : null,
    fullContent,
    hasAccess: note.isFree,
  }

  return <NoteDetailClient note={noteForClient} />
}
