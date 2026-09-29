import { redirect } from 'next/navigation'
import { getStudentFromCookie } from '@/lib/student-auth'
import { db } from '@/lib/db'
import { FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PortalDocumentsPage() {
  const session = await getStudentFromCookie()
  if (!session) redirect('/portal/login')
  const docs = await db.studentDocument.findMany({
    where: { studentId: session.studentId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-foreground">My Documents</h1>
      {docs.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />No documents have been added yet.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl divide-y divide-border">
          {docs.map(d => (
            <a key={d.id} href={`/api/documents/${d.id}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between px-5 py-4 hover:bg-foreground/[0.03] transition-colors">
              <div>
                <p className="text-sm font-medium text-foreground">{d.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {d.category} · {(d.size / 1024).toFixed(0)} KB · {d.createdAt.toLocaleDateString('en-IN')}
                </p>
              </div>
              <span className="text-xs text-primary font-medium">View</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
