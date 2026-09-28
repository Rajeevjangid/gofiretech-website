import { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import BlogPageClient from '@/components/marketing/blog/BlogPageClient'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('blog', {
    title:       'Blog — Tech Career Insights & Tutorials',
    description: 'Read the latest tech career insights, tutorials, cybersecurity news, AI updates, and developer tips from GoFire Tech industry experts.',
  })
}

export default function BlogPage() {
  return <BlogPageClient />
}
