export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import ContactPageClient from '@/components/marketing/ContactPageClient'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('contact', {
    title:       'Contact Us — Book a Free Demo Class',
    description: 'Reach out to GoFire Tech for admissions, course queries, corporate training, or to book your free demo class. Our counselors will respond within 24 hours.',
  })
}

export default function ContactPage() {
  return <ContactPageClient />
}
