import { Suspense } from 'react'
import PortalLoginForm from './PortalLoginForm'

export default function PortalLoginPage() {
  return (
    <Suspense>
      <PortalLoginForm />
    </Suspense>
  )
}
