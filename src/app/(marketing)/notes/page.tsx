import { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import NotesPageClient from '@/components/marketing/notes/NotesPageClient'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('notes', {
    title:       'Notes — Study Material for Tech Courses',
    description: 'Browse concise, expert-prepared study notes for cybersecurity, AI, web development and more. Preview for free, unlock the full content instantly.',
  })
}

export default function NotesPage() {
  return <NotesPageClient />
}
