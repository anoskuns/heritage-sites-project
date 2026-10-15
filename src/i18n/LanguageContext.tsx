import React, { useEffect, useState, useMemo } from 'react'
import { vi } from './vi'
import { en } from './en'
import { supabase } from '../services/supabase/client'
import {
  LanguageContext,
  type Language,
  type TranslationDictionary,
  type LanguageContextValue,
} from './languageContextDefinition'

export type { Language, TranslationDictionary, LanguageContextValue }

const dictionaries: Record<Language, TranslationDictionary> = {
  vi,
  en,
}

const STORAGE_KEY = 'dhp_preferred_language'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'vi' || saved === 'en') {
      return saved
    }
    return 'vi'
  })

  // Synchronize preferred language from user profile when logged in
  useEffect(() => {
    let isMounted = true

    async function syncFromProfile() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user && isMounted) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('preferred_language')
            .eq('id', session.user.id)
            .single()

          if (profile?.preferred_language) {
            const lang = profile.preferred_language as Language
            if (lang === 'vi' || lang === 'en') {
              setLanguageState(lang)
              localStorage.setItem(STORAGE_KEY, lang)
            }
          }
        }
      } catch (err) {
        console.warn('[i18n] Could not sync language from profile:', err)
      }
    }

    syncFromProfile()

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        syncFromProfile()
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const setLanguage = async (newLang: Language) => {
    setLanguageState(newLang)
    localStorage.setItem(STORAGE_KEY, newLang)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ preferred_language: newLang })
          .eq('id', user.id)

        if (error) {
          console.warn('[i18n] Failed to update profile preferred_language:', error.message)
        }
      }
    } catch (err) {
      console.warn('[i18n] Network error while syncing language to profile:', err)
    }
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: dictionaries[language],
    }),
    [language]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
