import { redirect } from 'next/navigation'
import { getStudentFromCookie } from '@/lib/student-auth'
import { getStudentFees } from '@/lib/fees'
import FeeSummaryCard from '@/components/portal/FeeSummaryCard'

export const dynamic = 'force-dynamic'

export default async function PortalFeesPage() {
  const session = await getStudentFromCookie()
  if (!session) redirect('/portal/login')
  const rows = await getStudentFees(session.studentId)

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-foreground">My Fees</h1>
      {rows.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">No enrollments yet.</div>
      ) : (
        rows.map(r => <FeeSummaryCard key={r.enrollmentId} row={r} detailed />)
      )}
    </div>
  )
}
