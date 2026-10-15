import { createContext } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '../../types/database.types'

export interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  error: string | null
  signUp: (
    email: string,
    password: string,
    displayName?: string,
    preferredLanguage?: 'vi' | 'en'
  ) => Promise<{ success: boolean; needsEmailConfirmation?: boolean; error?: string }>
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  updateProfile: (
    updates: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'preferred_language'>>
  ) => Promise<{ success: boolean; error?: string }>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

