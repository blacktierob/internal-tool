import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

interface ProtectedRouteProps {
  children: ReactNode
  isAuthenticated: boolean
}

export function ProtectedRoute({ children, isAuthenticated }: ProtectedRouteProps) {
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <>{children}</>
}