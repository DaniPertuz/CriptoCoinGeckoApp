import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { LoadingState } from '../components/ui/state'
import { useAuth } from '../features/auth/use-auth'

export function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <main className="min-h-svh bg-[#fdeadc] p-6 dark:bg-slate-950">
        <LoadingState label="Validando sesión" />
      </main>
    )
  }

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />
  }

  return children
}
