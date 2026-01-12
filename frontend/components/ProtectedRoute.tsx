import { ReactNode } from 'react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth'

interface ProtectedRouteProps {
  children: ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!token) router.replace('/login')
  }, [token, router])

  // Render children only when authenticated
  if (!token) return null
  return <>{children}</>
}

