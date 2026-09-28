export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import AboutPageClient from '@/components/marketing/AboutPageClient'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('about', {
    title:       'About GoFire Tech — Our Mission & Story',
    description: "Learn about GoFire Tech's mission to democratize technology education in India. Meet our team, understand our values, and discover why we are different.",
  })
}

export default function AboutPage() {
  return <AboutPageClient />
}
