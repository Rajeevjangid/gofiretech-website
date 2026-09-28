import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatCurrency(amount?: number | null, currency = 'INR'): string {
  if (!amount) return 'Free'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount))
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMMM d, yyyy')
}

export function formatDateShort(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getReadTime(text: string): number {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}...` : str
}

export function getCourseLevelColor(level: string): string {
  switch (level?.toUpperCase()) {
    case 'BEGINNER':
      return 'text-green-400 bg-green-400/10 border-green-400/30'
    case 'INTERMEDIATE':
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
    case 'ADVANCED':
      return 'text-red-400 bg-red-400/10 border-red-400/30'
    default:
      return 'text-muted-foreground bg-secondary border-border'
  }
}

export function generateSeoMeta(data: {
  title: string
  description?: string
  image?: string
  url?: string
}) {
  return {
    title: data.title,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      images: data.image ? [{ url: data.image }] : [],
      url: data.url,
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.description,
      images: data.image ? [data.image] : [],
    },
  }
}
