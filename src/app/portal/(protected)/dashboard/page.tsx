import { redirect } from 'next/navigation'
import { getStudentFromCookie } from '@/lib/student-auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { BookOpen, Calendar, ChevronRight, StickyNote } from 'lucide-react'
import Image from 'next/image'

export default async function PortalDashboard() {
  const session = await getStudentFromCookie()
  if (!session) redirect('/portal/login')

  const [enrollments, noteAccesses] = await Promise.all([
    db.enrollment.findMany({
      where: { studentId: session.studentId },
      include: {
        batch: {
          include: {
            course: { select: { id: true, title: true, slug: true, thumbnail: true, level: true } },
            _count: { select: { modules: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    }),
    db.noteAccess.findMany({
      where: { studentId: session.studentId, status: 'ACTIVE' },
      include: { note: { select: { id: true, title: true, slug: true, subject: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const statusColor = (s: string) =>
    ({ ACTIVE: 'bg-green-500/10 text-green-500', SUSPENDED: 'bg-red-500/10 text-red-500', EXPIRED: 'bg-orange-500/10 text-orange-500', PENDING: 'bg-yellow-500/10 text-yellow-600' } as Record<string,string>)[s] || ''

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">My Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back, {session.name}! Enrollment ID:{' '}
          <span className="font-mono text-primary">{session.enrollmentId}</span>
        </p>
      </div>

      {/* Enrolled Batches */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> My Courses
        </h2>
        {enrollments.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No enrollments yet. Contact GoFire Tech admin to get enrolled.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrollments.map(e => (
              <Link key={e.id}
                href={e.status === 'ACTIVE' ? `/portal/batch/${e.batchId}` : '#'}
                className={`bg-card border border-border rounded-2xl overflow-hidden transition-all ${e.status === 'ACTIVE' ? 'hover:border-primary/30 hover:shadow-md cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}>
                <div className="aspect-video bg-foreground/5 relative">
                  {e.batch.course.thumbnail ? (
                    <Image src={e.batch.course.thumbnail} alt={e.batch.course.title} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-foreground/20" />
                    </div>
                  )}
                  <span className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(e.status)}`}>
                    {e.status}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">{e.batch.course.level}</p>
                  <h3 className="font-semibold text-foreground text-sm leading-snug">{e.batch.course.title}</h3>
                  <p className="text-xs text-primary/80 mt-1">{e.batch.name}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {e.batch._count.modules} modules
                    </span>
                    {e.validUntil && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Until {new Date(e.validUntil).toLocaleDateString('en-IN')}
                      </span>
                    )}
                  </div>
                  {e.status === 'ACTIVE' && (
                    <div className="flex items-center gap-1 mt-3 text-xs text-primary font-medium">
                      Start Learning <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Purchased Notes */}
      {noteAccesses.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-primary" /> My Notes
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {noteAccesses.map(na => (
              <Link key={na.id} href={`/notes/${na.note.slug}`}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all hover:shadow-sm">
                <h3 className="font-medium text-foreground text-sm">{na.note.title}</h3>
                {na.note.subject && <p className="text-xs text-muted-foreground mt-1">{na.note.subject}</p>}
                <span className="inline-block mt-2 text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                  Access Granted
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
