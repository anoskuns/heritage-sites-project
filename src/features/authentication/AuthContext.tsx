import React, { useEffect, useState, useCallback, useRef } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../../services/supabase/client'
import type { Profile } from '../../types/database.types'
import { AuthContext, type AuthContextValue } from './authContextDefinition'

export type { AuthContextValue }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const isMountedRef = useRef<boolean>(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Helper to fetch user's profile from database
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (profileError) {
        console.warn('[AuthContext] Error fetching profile:', profileError.message)
        return null
      }

      // Fallback: If trigger hasn't fired yet or row missing, insert minimal profile safely
      if (!data) {
        console.info('[AuthContext] Profile row missing for user, creating initial profile...')
        const { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            display_name: 'Traveler',
            preferred_language: 'vi',
          })
          .select()
          .single()

        if (!insertError && inserted) {
          return inserted
        }
      }

      return data
    } catch (err) {
      console.warn('[AuthContext] Unexpected error fetching profile:', err)
      return null
    }
  }, [])

  // Initial session restoration and auth state listener
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null

    async function initializeAuth() {
      try {
        const {
          data: { session: initialSession },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.warn('[AuthContext] Error restoring session:', sessionError.message)
        }

        if (isMountedRef.current) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)

          if (initialSession?.user) {
            const userProfile = await fetchProfile(initialSession.user.id)
            if (isMountedRef.current) {
              setProfile(userProfile)
            }
          } else {
            setProfile(null)
          }
          setIsLoading(false)
        }
      } catch (err) {
        console.warn('[AuthContext] Failed to initialize auth:', err)
        if (isMountedRef.current) {
          setIsLoading(false)
        }
      }

      // Subscribe to subsequent auth state transitions
      const {
        data: { subscription: authSub },
      } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!isMountedRef.current) return

        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (newSession?.user) {
          const userProfile = await fetchProfile(newSession.user.id)
          if (isMountedRef.current) {
            setProfile(userProfile)
          }
        } else {
          setProfile(null)
        }

        if (event === 'SIGNED_OUT') {
          setError(null)
        }
      })

      subscription = authSub
    }

    initializeAuth()

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [fetchProfile])

  // Sign Up
  const signUp = async (
    email: string,
    password: string,
    displayName?: string,
    preferredLanguage?: 'vi' | 'en'
  ) => {
    setError(null)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName?.trim() || email.split('@')[0],
            preferred_language: preferredLanguage || 'vi',
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return { success: false, error: signUpError.message }
      }

      const needsEmailConfirmation = Boolean(data.user && !data.session)

      if (data.session && data.user) {
        setSession(data.session)
        setUser(data.user)
        const newProfile = await fetchProfile(data.user.id)
        if (isMountedRef.current) {
          setProfile(newProfile)
        }
      }

      return {
        success: true,
        needsEmailConfirmation,
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown signup error'
      setError(msg)
      return { success: false, error: msg }
    }
  }

  // Sign In
  const signIn = async (email: string, password: string) => {
    setError(null)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return { success: false, error: signInError.message }
      }

      if (data.session && data.user) {
        setSession(data.session)
        setUser(data.user)
        const userProfile = await fetchProfile(data.user.id)
        if (isMountedRef.current) {
          setProfile(userProfile)
        }
      }

      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown sign-in error'
      setError(msg)
      return { success: false, error: msg }
    }
  }

  // Sign Out
  const signOut = async () => {
    setError(null)
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        setError(signOutError.message)
        return { success: false, error: signOutError.message }
      }

      if (isMountedRef.current) {
        setUser(null)
        setSession(null)
        setProfile(null)
      }

      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown sign-out error'
      setError(msg)
      return { success: false, error: msg }
    }
  }

  // Update Profile
  const updateProfile = async (
    updates: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'preferred_language'>>
  ) => {
    if (!user) {
      return { success: false, error: 'Unauthorized: User is not authenticated' }
    }

    try {
      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) {
        return { success: false, error: updateError.message }
      }

      if (isMountedRef.current && updated) {
        setProfile(updated)
      }

      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown update error'
      return { success: false, error: msg }
    }
  }

  // Force refresh current user's profile
  const refreshProfile = async () => {
    if (!user) return
    const refreshed = await fetchProfile(user.id)
    if (isMountedRef.current) {
      setProfile(refreshed)
    }
  }

  const value: AuthContextValue = {
    user,
    session,
    profile,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

