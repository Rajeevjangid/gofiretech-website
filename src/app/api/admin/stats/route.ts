import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [
      totalCourses,
      publishedCourses,
      totalPosts,
      publishedPosts,
      totalContacts,
      unreadContacts,
      totalTestimonials,
      totalPlacements,
      totalNotes,
      publishedNotes,
    ] = await Promise.all([
      db.course.count(),
      db.course.count({ where: { isPublished: true } }),
      db.blogPost.count(),
      db.blogPost.count({ where: { isPublished: true } }),
      db.contactSubmission.count(),
      db.contactSubmission.count({ where: { isRead: false } }),
      db.testimonial.count(),
      db.placementRecord.count(),
      db.note.count(),
      db.note.count({ where: { isPublished: true } }),
    ])

    const recentContacts = await db.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    return NextResponse.json({
      courses:      { total: totalCourses,  published: publishedCourses },
      blog:         { total: totalPosts,    published: publishedPosts },
      notes:        { total: totalNotes,    published: publishedNotes },
      contacts:     { total: totalContacts, unread: unreadContacts },
      testimonials: totalTestimonials,
      placements:   totalPlacements,
      recentContacts,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
