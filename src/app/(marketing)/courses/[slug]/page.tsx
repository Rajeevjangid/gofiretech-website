import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import CourseDetailClient from '@/components/marketing/courses/CourseDetailClient'

// ── ISR: revalidate every 60 seconds so publish/edit shows promptly ──
export const revalidate = 60

interface Props {
  params: { slug: string }
}

// ── Full dynamic SEO metadata ──────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await db.course.findUnique({
    where: { slug: params.slug, isPublished: true },
    select: { title: true, description: true, metaTitle: true, metaDescription: true, thumbnail: true },
  })
  if (!course) return { title: 'Course Not Found' }

  // Strip " | GoFire Tech" if present — the root layout template appends it automatically
  const rawTitle    = course.metaTitle || course.title
  const title       = rawTitle.replace(/\s*[|–—-]\s*GoFire Tech\s*$/i, '').trim()
  const description = course.metaDescription || course.description
  const siteUrl     = process.env.NEXT_PUBLIC_APP_URL || 'https://gofiretech.com'
  const canonicalUrl = `${siteUrl}/courses/${params.slug}`

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'GoFire Tech',
      type: 'website',
      ...(course.thumbnail ? { images: [{ url: course.thumbnail, width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(course.thumbnail ? { images: [course.thumbnail] } : {}),
    },
  }
}

// ── Static params for build-time pre-rendering ────────────────────
export async function generateStaticParams() {
  const courses = await db.course.findMany({
    where: { isPublished: true },
    select: { slug: true },
  })
  return courses.map(c => ({ slug: c.slug }))
}

// ── Page ──────────────────────────────────────────────────────────
export default async function CourseDetailPage({ params }: Props) {
  const [course, related] = await Promise.all([
    db.course.findUnique({
      where: { slug: params.slug, isPublished: true },
    }),
    // Fetch up to 3 related courses (same category, different slug, published)
    db.course.findMany({
      where: {
        isPublished: true,
        NOT: { slug: params.slug },
      },
      orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }],
      take: 3,
      select: {
        id: true, title: true, slug: true, description: true,
        thumbnail: true, price: true, originalPrice: true,
        duration: true, level: true, category: true,
        enrollmentCount: true, rating: true,
      },
    }),
  ])

  if (!course) notFound()

  return (
    <CourseDetailClient
      course={JSON.parse(JSON.stringify(course))}
      related={JSON.parse(JSON.stringify(related))}
    />
  )
}
