import React from 'react'
import { LanguageProvider } from '../i18n'
import { AuthProvider } from '../features/authentication'

interface AppProvidersProps {
  children: React.ReactNode
}

/**
 * Root providers wrapper for the application.
 * Composes AuthProvider and LanguageProvider together.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <LanguageProvider>
      <AuthProvider>{children}</AuthProvider>
    </LanguageProvider>
  )
}
