import { supabase } from '../../services/supabase/client'
import type { AdminUserSummary } from './types'
import { getLocalUnlockedStamps } from '../passport/passportStorageService'

/**
 * Fetches all registered users for the Admin panel.
 */
export async function fetchAllAdminUsers(): Promise<AdminUserSummary[]> {
  const users: AdminUserSummary[] = []

  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && profiles) {
      for (const p of profiles) {
        // Fetch count of unlocked stamps
        let stampsCount = 0
        try {
          const { count } = await supabase
            .from('passport_entries')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', p.id)
          stampsCount = count ?? 0
        } catch {
          stampsCount = getLocalUnlockedStamps(p.id).length
        }

        users.push({
          id: p.id,
          displayName: p.display_name,
          email: `${p.display_name.toLowerCase().replace(/\s+/g, '')}@heritage.vn`,
          avatarUrl: p.avatar_url,
          role: (p.role as 'admin' | 'user') || 'user',
          createdAt: p.created_at,
          stampsCount,
          memoriesCount: 0,
        })
      }
    }
  } catch (err) {
    console.warn('[AdminUser] Error fetching profiles:', err)
  }

  // Ensure default demo admin account is visible if DB returned empty
  if (users.length === 0) {
    users.push({
      id: 'usr-admin-001',
      displayName: 'Ban Quản Trị Di Sản',
      email: 'admin@heritage.vn',
      avatarUrl: null,
      role: 'admin',
      createdAt: new Date().toISOString(),
      stampsCount: 5,
      memoriesCount: 2,
    })
    users.push({
      id: 'usr-traveler-002',
      displayName: 'Khách Lữ Hành Demo',
      email: 'demo@heritage.vn',
      avatarUrl: null,
      role: 'user',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      stampsCount: 3,
      memoriesCount: 1,
    })
  }

  return users
}

/**
 * Toggles a user's role between 'admin' and 'user'.
 */
export async function toggleUserAdminRole(
  userId: string,
  currentRole: 'admin' | 'user'
): Promise<'admin' | 'user'> {
  const nextRole = currentRole === 'admin' ? 'user' : 'admin'

  try {
    await supabase.from('profiles').update({ role: nextRole }).eq('id', userId)
  } catch (err) {
    console.warn('[AdminUser] Failed to update role in DB:', err)
  }

  window.dispatchEvent(new CustomEvent('heritage_admin_users_updated'))
  return nextRole
}

