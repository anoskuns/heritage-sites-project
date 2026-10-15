import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Validates whether Supabase environment variables are properly defined and configured.
 */
export function validateSupabaseConfig(): { isValid: boolean; error?: string } {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      isValid: false,
      error:
        'Missing Supabase credentials: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in your .env file.',
    }
  }

  if (
    supabaseUrl.includes('your-project.supabase.co') ||
    supabaseAnonKey === 'your-anon-key-here'
  ) {
    return {
      isValid: false,
      error:
        'Placeholder Supabase credentials detected: Please replace default keys in .env with your actual Supabase project credentials.',
    }
  }

  try {
    new URL(supabaseUrl)
  } catch {
    return {
      isValid: false,
      error: `Invalid VITE_SUPABASE_URL: "${supabaseUrl}" is not a valid URL.`,
    }
  }

  return { isValid: true }
}

const configValidation = validateSupabaseConfig()
if (!configValidation.isValid) {
  console.warn(`[Supabase Config Warning] ${configValidation.error}`)
}

/**
 * Strongly-typed Supabase client for all database queries and RPC calls.
 * Uses fallback dummy URL/Key if env is unconfigured to allow build-time rendering without errors.
 */
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

export const isSupabaseConfigured = configValidation.isValid
