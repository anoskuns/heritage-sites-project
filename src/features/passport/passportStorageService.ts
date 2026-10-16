/**
 * Passport Storage Service
 * Provides reliable client-side persistence and sync for unlocked stamps.
 * Enables immediate UI responsiveness across Passport & Map tabs,
 * plus testing features such as revoking or resetting stamps.
 */

import { supabase } from '../../services/supabase/client'

export interface LocalUnlockedStamp {
  id: string
  siteId: string
  siteSlug: string
  userId?: string
  rawToken?: string
  serialCode?: string
  unlockedAt: string
}

const REGISTRY_KEY = 'heritage_unlocked_stamps_registry_v2'

export const THANG_LONG_ALIASES = [
  'hoang-thanh-thang-long',
  'b1b2c3d4-0001-4000-b000-000000000001',
  'site-hoang-thanh',
]

/**
 * Checks if an identifier or token matches Hoàng Thành Thăng Long.
 */
export function isThangLongIdentifier(idOrSlug?: string): boolean {
  if (!idOrSlug) return false
  const lower = idOrSlug.toLowerCase()
  return (
    THANG_LONG_ALIASES.includes(lower) ||
    lower.includes('hoang-thanh') ||
    lower.includes('thanglong') ||
    lower.includes('httl')
  )
}

function getRawRegistry(): LocalUnlockedStamp[] {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LocalUnlockedStamp[]
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn('[PassportStorage] Failed to parse stamps registry:', err)
    return []
  }
}

function saveRawRegistry(stamps: LocalUnlockedStamp[]): void {
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(stamps))
  } catch (err) {
    console.warn('[PassportStorage] Failed to save stamps registry:', err)
  }
}

/**
 * Retrieves local stamps.
 * - If userId is specified: strictly returns stamps belonging to this user.
 * - If userId is not specified: strictly returns guest stamps (no userId).
 */
export function getLocalUnlockedStamps(userId?: string): LocalUnlockedStamp[] {
  const all = getRawRegistry()
  if (userId) {
    return all.filter((s) => s.userId === userId)
  }
  return all.filter((s) => !s.userId)
}

export function saveLocalUnlockedStamp(
  siteId: string,
  siteSlug: string,
  userId?: string,
  rawToken?: string,
  serialCode?: string
): LocalUnlockedStamp {
  const current = getRawRegistry()

  // Match existing stamp for the same site and ownership
  const existingIndex = current.findIndex((s) => {
    const siteMatches = s.siteId === siteId || s.siteSlug === siteSlug
    const userMatches = userId ? s.userId === userId : !s.userId
    return siteMatches && userMatches
  })

  if (existingIndex >= 0) {
    const existing = current[existingIndex]
    if (serialCode && !existing.serialCode) {
      existing.serialCode = serialCode
    }
    if (rawToken && !existing.rawToken) {
      existing.rawToken = rawToken
    }
    saveRawRegistry(current)
    return existing
  }

  const newStamp: LocalUnlockedStamp = {
    id: `stamp-${siteSlug}-${Date.now()}`,
    siteId,
    siteSlug,
    userId,
    rawToken,
    serialCode,
    unlockedAt: new Date().toISOString(),
  }

  const updated = [newStamp, ...current]
  saveRawRegistry(updated)
  return newStamp
}

/**
 * Removes local stamp matching siteId or siteSlug (including all aliases for Hoang Thanh Thang Long).
 */
export function removeLocalUnlockedStamp(siteIdOrSlug: string, userId?: string): boolean {
  const current = getRawRegistry()
  const isTargetThangLong = isThangLongIdentifier(siteIdOrSlug)

  const filtered = current.filter((s) => {
    const matchesSite = isTargetThangLong
      ? isThangLongIdentifier(s.siteId) ||
        isThangLongIdentifier(s.siteSlug) ||
        isThangLongIdentifier(s.rawToken)
      : s.siteId === siteIdOrSlug || s.siteSlug === siteIdOrSlug

    if (!matchesSite) return true // keep

    // Site matches: check user scope
    if (userId) {
      // Remove if matches userId OR if it was an unassigned ghost stamp
      return s.userId !== userId && Boolean(s.userId)
    }
    // Remove guest stamp
    return Boolean(s.userId)
  })

  const removed = filtered.length < current.length
  if (removed) {
    saveRawRegistry(filtered)
  }
  return removed
}

export function isSiteUnlockedLocally(siteId: string, userId?: string): boolean {
  const current = getLocalUnlockedStamps(userId)
  return current.some((s) => s.siteId === siteId || s.siteSlug === siteId)
}

export function clearAllLocalStamps(userId?: string): void {
  if (!userId) {
    try {
      localStorage.removeItem(REGISTRY_KEY)
    } catch (err) {
      console.warn('[PassportStorage] Failed to clear registry:', err)
    }
    return
  }

  const current = getRawRegistry()
  const remaining = current.filter((s) => s.userId !== userId)
  saveRawRegistry(remaining)
}

/**
 * Proactively purges any stray/residual cache of Hoàng Thành Thăng Long
 * from localStorage registries (both unlocked stamps and guest passport)
 * and optionally deletes remote Supabase passport_entries if userId is given.
 */
export async function purgeThangLongStrayCache(userId?: string): Promise<void> {
  try {
    // 1. Purge from unlocked stamps registry
    const allStamps = getRawRegistry()
    const cleanedStamps = allStamps.filter((s) => {
      const isTL =
        isThangLongIdentifier(s.siteId) ||
        isThangLongIdentifier(s.siteSlug) ||
        isThangLongIdentifier(s.rawToken)
      if (!isTL) return true
      if (userId) return s.userId !== userId && Boolean(s.userId)
      return false
    })
    saveRawRegistry(cleanedStamps)

    // 2. Purge from guest passport registry
    try {
      const guestRaw = localStorage.getItem('heritage_guest_passport_v1')
      if (guestRaw) {
        const guestParsed = JSON.parse(guestRaw)
        if (Array.isArray(guestParsed)) {
          const cleanedGuest = guestParsed.filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (g: any) => !isThangLongIdentifier(g.siteId) && !isThangLongIdentifier(g.siteSlug)
          )
          localStorage.setItem('heritage_guest_passport_v1', JSON.stringify(cleanedGuest))
        }
      }
    } catch {
      // ignore
    }

    // 3. Reset claimed status in Admin QR registry if applicable
    try {
      const adminQrRaw = localStorage.getItem('heritage_admin_qr_registry_v2')
      if (adminQrRaw) {
        const adminQrs = JSON.parse(adminQrRaw)
        if (Array.isArray(adminQrs)) {
          let updated = false
          for (const item of adminQrs) {
            if (
              isThangLongIdentifier(item.siteId) ||
              isThangLongIdentifier(item.siteSlug) ||
              isThangLongIdentifier(item.rawToken)
            ) {
              if (item.status === 'claimed' && (!userId || item.claimedByUserId === userId)) {
                item.status = 'printing'
                item.claimedByUserId = null
                item.claimedByUserName = null
                item.claimedAt = null
                updated = true
              }
            }
          }
          if (updated) {
            localStorage.setItem('heritage_admin_qr_registry_v2', JSON.stringify(adminQrs))
          }
        }
      }
    } catch {
      // ignore
    }

    // 4. If userId provided or session exists, remove from remote database
    let effectiveUserId = userId
    if (!effectiveUserId) {
      const { data: authData } = await supabase.auth.getUser()
      effectiveUserId = authData.user?.id
    }

    if (effectiveUserId) {
      try {
        await supabase
          .from('passport_entries')
          .delete()
          .eq('user_id', effectiveUserId)
          .in('site_id', [
            'b1b2c3d4-0001-4000-b000-000000000001',
            'site-hoang-thanh',
          ])
      } catch (err) {
        console.warn('[PassportStorage] Failed to purge remote Thang Long entries:', err)
      }
    }

    // 5. Dispatch event so UI tabs (Passport, Map) immediately re-render
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('heritage_site_unlocked', {
          detail: {
            siteSlug: 'hoang-thanh-thang-long',
            siteId: 'b1b2c3d4-0001-4000-b000-000000000001',
            revoked: true,
          },
        })
      )
    }
  } catch (err) {
    console.warn('[PassportStorage] Error during purgeThangLongStrayCache:', err)
  }
}
