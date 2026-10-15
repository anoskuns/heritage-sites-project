import { useContext } from 'react'
import { LanguageContext, type LanguageContextValue } from './languageContextDefinition'

/**
 * Hook to access current language, setter, and typed dictionary
 */
export function useTranslation(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}

