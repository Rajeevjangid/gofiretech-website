import { redirect, notFound } from 'next/navigation'
import { getStudentFromCookie, checkEnrollmentAccess } from '@/lib/student-auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { BookOpen, Video, File, FileText, ChevronRight } from 'lucide-react'

const TYPE_ICONS: Record<string, React.ElementType> = {
  NOTE: FileText, PDF: File, RECORDED_LECTURE: Video, STUDY_MATERIAL: BookOpen
}

export default async function BatchPage({ params }: { params: { batchId: string } }) {
  const session = await getStudentFromCookie()
  if (!session) redirect('/portal/login')

  const hasAccess = await checkEnrollmentAccess(session.studentId, params.batchId)
  if (!hasAccess) redirect('/portal/dashboard')

  const batch = await db.batch.findUnique({
    where: { id: params.batchId },
    include: {
      course: { select: { id: true, title: true, level: true } },
      modules: {
        where: { isPublished: true },
        orderBy: { order: 'asc' },
        include: {
          resources: {
            where: { isPublished: true },
            orderBy: { order: 'asc' },
            select: { id: true, type: true, title: true, description: true, duration: true },
          },
        },
      },
    },
  })
  if (!batch) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/portal/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          &larr; Dashboard
        </Link>
        <h1 className="text-2xl font-extrabold text-foreground mt-2">{batch.name}</h1>
        <p className="text-muted-foreground text-sm">{batch.course.title} &middot; {batch.course.level}</p>
      </div>

      <div className="space-y-4">
        {batch.modules.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No content available yet. Check back soon.</p>
          </div>
        ) : (
          batch.modules.map((m, mi) => (
            <div key={m.id} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {mi + 1}
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">{m.title}</h2>
                  {m.description && <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>}
                </div>
                <span className="ml-auto text-xs text-muted-foreground">{m.resources.length} items</span>
              </div>
              <div className="divide-y divide-border">
                {m.resources.length === 0 ? (
                  <p className="px-6 py-4 text-sm text-muted-foreground">No resources in this module yet.</p>
                ) : (
                  m.resources.map(r => {
                    const Icon = TYPE_ICONS[r.type] || File
                    return (
                      <Link key={r.id} href={`/portal/resource/${r.id}`}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-foreground/[0.03] transition-colors group">
                        <div className="w-8 h-8 rounded-xl bg-foreground/[0.05] flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                          <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                            {r.type.replace(/_/g, ' ').toLowerCase()}
                            {r.duration ? ` · ${r.duration}` : ''}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                      </Link>
                    )
                  })
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
