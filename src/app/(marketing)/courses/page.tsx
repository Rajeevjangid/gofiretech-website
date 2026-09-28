import { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import CoursesPageClient from '@/components/marketing/courses/CoursesPageClient'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('courses', {
    title:       'All Courses — Cybersecurity, AI & Web Development',
    description: 'Browse all GoFire Tech programs. Industry-led courses in Cybersecurity, AI, Machine Learning, Web Development, and Cloud Computing with placement support.',
  })
}

export default function CoursesPage() {
  return <CoursesPageClient />
}
