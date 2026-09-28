import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import BlogPostClient from '@/components/marketing/blog/BlogPostClient'

// ── ISR: revalidate every 60 seconds ──────────────────────────────
export const revalidate = 60

interface Props { params: { slug: string } }

// ── Full dynamic SEO + OG metadata ───────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await db.blogPost.findUnique({
    where: { slug: params.slug, isPublished: true },
    select: {
      title: true, excerpt: true, thumbnail: true,
      metaTitle: true, metaDescription: true,
      authorName: true, publishedAt: true, category: true,
    },
  })
  if (!post) return { title: 'Post Not Found' }

  // Strip " | GoFire Tech" if present — the root layout template appends it automatically
  const rawTitle    = post.metaTitle || post.title
  const title       = rawTitle.replace(/\s*[|–—-]\s*GoFire Tech\s*$/i, '').trim()
  const description = post.metaDescription || post.excerpt || undefined
  const siteUrl     = process.env.NEXT_PUBLIC_APP_URL || 'https://gofiretech.com'
  const canonicalUrl = `${siteUrl}/blog/${params.slug}`

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
      publishedTime: post.publishedAt?.toISOString(),
      authors: post.authorName ? [post.authorName] : undefined,
      ...(post.thumbnail
        ? { images: [{ url: post.thumbnail, width: 1200, height: 630, alt: title }] }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(post.thumbnail ? { images: [post.thumbnail] } : {}),
    },
  }
}

// ── Static params for SSG (pre-render all published posts) ────────
export async function generateStaticParams() {
  const posts = await db.blogPost.findMany({
    where: { isPublished: true },
    select: { slug: true },
  })
  return posts.map(p => ({ slug: p.slug }))
}

// ── Page ──────────────────────────────────────────────────────────
export default async function BlogPostPage({ params }: Props) {
  const [post, related] = await Promise.all([
    db.blogPost.findUnique({
      where: { slug: params.slug, isPublished: true },
    }),
    // Fetch up to 3 related posts (published, different slug)
    db.blogPost.findMany({
      where: { isPublished: true, NOT: { slug: params.slug } },
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
      take: 3,
      select: {
        id: true, title: true, slug: true, excerpt: true,
        thumbnail: true, category: true, readTime: true,
        views: true, publishedAt: true, authorName: true,
      },
    }),
  ])

  if (!post) notFound()

  // Increment view count (fire-and-forget — doesn't block render)
  db.blogPost.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  }).catch(() => {})

  return (
    <BlogPostClient
      post={JSON.parse(JSON.stringify(post))}
      related={JSON.parse(JSON.stringify(related))}
    />
  )
}
