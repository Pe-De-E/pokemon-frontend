import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { checkSession } from '@/lib/auth'

function ProtectedRoute() {
  const [status, setStatus] = useState<
    'checking' | 'authenticated' | 'unauthenticated'
  >('checking')

  useEffect(() => {
    checkSession().then((ok) => setStatus(ok ? 'authenticated' : 'unauthenticated'))
  }, [])

  if (status === 'checking') {
    return (
      <section id="center">
        <p>Lädt…</p>
      </section>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
