import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import { useTranslation } from '../../i18n'

interface ProtectedRouteProps {
  children?: React.ReactNode
}

/**
 * Route guard component ensuring the user is signed in before viewing protected views.
 * Preserves the exact initial pathname, search query, and hash parameters for safe return after login.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-16 space-y-4">
        <div className="w-10 h-10 border-3 border-amber-200 border-t-amber-700 rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">
          {t.common.loading}
        </p>
      </div>
    )
  }

  if (!user) {
    const fullPath = `${location.pathname}${location.search}${location.hash}`
    const encodedDestination = encodeURIComponent(fullPath)
    return <Navigate to={`/auth?redirectTo=${encodedDestination}`} replace />
  }

  return children ? <>{children}</> : null
}

