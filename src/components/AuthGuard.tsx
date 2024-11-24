import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'
import { LoadingSpinner } from './LoadingSpinner'
import { LoginForm } from './LoginForm'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!loading && !session) {
      // Store the attempted URL for redirect after login
      sessionStorage.setItem('redirectUrl', location.pathname)
    }
  }, [loading, session, location])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    )
  }

  return <>{children}</>
}