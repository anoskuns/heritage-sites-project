import type { User } from '@supabase/supabase-js'
import { supabase } from '../../services/supabase/client'
import type { Profile } from '../../types/database.types'
import type { AdminDashboardStats } from './types'
import { HCM_HERITAGE_SITES } from '../heritage/mapService'

const ADMIN_FALLBACK_FLAG_KEY = 'heritage_admin_override_active'

/**
 * Checks if a user has admin privileges.
 * Recognizes role === 'admin' in profile, email whitelist (admin@heritage.vn),
 * or local testing override flag.
 */
export function checkIsAdmin(user: User | null, profile: Profile | null): boolean {
  if (!user) return false

  // 1. Database role column
  if (profile?.role === 'admin') return true

  // 2. Email whitelist for immediate developer/admin access
  const email = user.email?.toLowerCase().trim() || ''
  if (email === 'admin@heritage.vn' || email === 'demo@heritage.vn') {
    return true
  }

  // 3. User metadata check
  if (user.user_metadata?.role === 'admin') return true

  // 4. Local testing override
  if (typeof window !== 'undefined' && localStorage.getItem(ADMIN_FALLBACK_FLAG_KEY) === 'true') {
    return true
  }

  return false
}

/**
 * Toggles local testing admin mode (useful for verification and local QA).
 */
export function toggleLocalAdminOverride(): boolean {
  if (typeof window === 'undefined') return false
  const current = localStorage.getItem(ADMIN_FALLBACK_FLAG_KEY) === 'true'
  const next = !current
  localStorage.setItem(ADMIN_FALLBACK_FLAG_KEY, String(next))
  return next
}

/**
 * Fetches aggregated statistics for the Admin Dashboard overview.
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const stats: AdminDashboardStats = {
    totalSites: 0,
    publishedSites: 0,
    totalUsers: 0,
    totalAdminUsers: 0,
    totalQrTokens: 0,
    claimedQrTokens: 0,
    totalPosts: 0,
    publishedPosts: 0,
  }

  // 1. Heritage sites count
  try {
    const { count: totalSites } = await supabase
      .from('heritage_sites')
      .select('id', { count: 'exact', head: true })
    const { count: publishedSites } = await supabase
      .from('heritage_sites')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true)

    stats.totalSites = totalSites ?? HCM_HERITAGE_SITES.length
    stats.publishedSites = publishedSites ?? HCM_HERITAGE_SITES.length
  } catch (err) {
    console.warn('[AdminService] Sites count error:', err)
    stats.totalSites = HCM_HERITAGE_SITES.length
    stats.publishedSites = HCM_HERITAGE_SITES.length
  }

  // 2. Profiles count
  try {
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
    const { count: adminUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin')

    stats.totalUsers = Math.max(totalUsers ?? 0, 1)
    stats.totalAdminUsers = Math.max(adminUsers ?? 0, 1)
  } catch (err) {
    console.warn('[AdminService] Profiles count error:', err)
    stats.totalUsers = 1
    stats.totalAdminUsers = 1
  }

  // 3. Pin items / QR tokens count
  try {
    const { count: totalTokens } = await supabase
      .from('pin_items')
      .select('id', { count: 'exact', head: true })
    const { count: claimedTokens } = await supabase
      .from('pin_items')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'claimed')

    stats.totalQrTokens = totalTokens ?? 0
    stats.claimedQrTokens = claimedTokens ?? 0
  } catch (err) {
    console.warn('[AdminService] QR items count error:', err)
  }

  // 4. Community Posts count
  try {
    const { count: totalPosts } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
    const { count: publishedPosts } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')

    stats.totalPosts = totalPosts ?? 0
    stats.publishedPosts = publishedPosts ?? 0
  } catch (err) {
    console.warn('[AdminService] Posts count error:', err)
  }

  return stats
}

