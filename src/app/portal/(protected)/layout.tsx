import { redirect } from 'next/navigation'
import { getStudentFromCookie } from '@/lib/student-auth'
import PortalNavbar from '@/components/portal/PortalNavbar'

export default async function ProtectedPortalLayout({ children }: { children: React.ReactNode }) {
  const student = await getStudentFromCookie()
  if (!student) redirect('/portal/login')

  return (
    <div className="min-h-screen bg-background">
      <PortalNavbar studentName={student.name} enrollmentId={student.enrollmentId} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
