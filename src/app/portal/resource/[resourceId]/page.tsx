import { redirect, notFound } from 'next/navigation'
import { getStudentFromCookie, checkEnrollmentAccess } from '@/lib/student-auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { ArrowLeft, Download, FileText, File, Video, BookOpen } from 'lucide-react'

export default async function ResourcePage({ params }: { params: { resourceId: string } }) {
  const session = await getStudentFromCookie()
  if (!session) redirect('/portal/login')

  const resource = await db.learningResource.findUnique({
    where: { id: params.resourceId, isPublished: true },
    include: { module: { include: { batch: { select: { id: true, name: true } } } } },
  })
  if (!resource) notFound()

  const batchId = resource.module.batch.id
  const hasAccess = await checkEnrollmentAccess(session.studentId, batchId)
  if (!hasAccess) redirect('/portal/dashboard')

  const isVideo   = resource.type === 'RECORDED_LECTURE'
  const isPDF     = resource.type === 'PDF'
  const isNote    = resource.type === 'NOTE'
  const isYoutube = resource.url?.includes('youtube.com') || resource.url?.includes('youtu.be')

  function getYoutubeEmbedUrl(url: string): string {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?]+)/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : url
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href={`/portal/batch/${batchId}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> {resource.module.batch.name}
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-sm text-foreground font-medium truncate">{resource.title}</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
            {resource.type.replace(/_/g, ' ')}
          </span>
          <h1 className="text-2xl font-bold text-foreground mt-3">{resource.title}</h1>
          {resource.description && <p className="text-muted-foreground mt-2">{resource.description}</p>}
          {resource.duration && <p className="text-xs text-muted-foreground mt-1">Duration: {resource.duration}</p>}
        </div>

        {isVideo && resource.url && (
          <div className="rounded-2xl overflow-hidden border border-border bg-black aspect-video">
            {isYoutube ? (
              <iframe
                src={getYoutubeEmbedUrl(resource.url)}
                className="w-full h-full" allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
            ) : (
              <video src={resource.url} controls className="w-full h-full" />
            )}
          </div>
        )}

        {isPDF && resource.url && (
          <div className="rounded-2xl overflow-hidden border border-border">
            <iframe src={resource.url} className="w-full h-[80vh]" title={resource.title} />
          </div>
        )}

        {isNote && resource.url && (
          <div
            className="bg-card border border-border rounded-2xl p-8 prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: resource.url }} />
        )}

        {!isVideo && !isPDF && !isNote && resource.url && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <File className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-4">{resource.title}</p>
            <a href={resource.url} target="_blank" rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2">
              <Download className="w-4 h-4" /> Download / Open Resource
            </a>
          </div>
        )}

        {!resource.url && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Content coming soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}
