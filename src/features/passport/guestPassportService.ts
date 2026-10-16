/**
 * Guest Passport Service
 * Allows non-logged-in users (guests) to collect heritage stamps locally in localStorage.
 * Automatically synchronizes stamps to Cloud once the user signs up or logs in.
 */

export interface GuestPassportEntry {
  id: string
  siteId: string
  siteSlug: string
  pinItemId?: string
  unlockedAt: string
}

const GUEST_PASSPORT_KEY = 'heritage_guest_passport_v1'

/**
 * Retrieve all guest passport entries from localStorage.
 */
export function getGuestPassportEntries(): GuestPassportEntry[] {
  try {
    const raw = localStorage.getItem(GUEST_PASSPORT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn('[GuestPassport] Failed to parse guest passport from localStorage:', err)
    return []
  }
}

/**
 * Check if a site is already unlocked in the local guest passport.
 */
export function isGuestSiteUnlocked(siteId: string): boolean {
  const entries = getGuestPassportEntries()
  return entries.some((e) => e.siteId === siteId)
}

/**
 * Add or idempotently record a site unlock in guest passport.
 */
export function addGuestPassportEntry(
  siteId: string,
  siteSlug: string,
  pinItemId?: string
): { entry: GuestPassportEntry; newlyUnlocked: boolean } {
  const entries = getGuestPassportEntries()
  const existing = entries.find((e) => e.siteId === siteId)

  if (existing) {
    return { entry: existing, newlyUnlocked: false }
  }

  const newEntry: GuestPassportEntry = {
    id: `guest-${siteSlug}-${Date.now()}`,
    siteId,
    siteSlug,
    pinItemId,
    unlockedAt: new Date().toISOString(),
  }

  try {
    const updated = [newEntry, ...entries]
    localStorage.setItem(GUEST_PASSPORT_KEY, JSON.stringify(updated))
  } catch (err) {
    console.warn('[GuestPassport] Failed to save entry to localStorage:', err)
  }

  return { entry: newEntry, newlyUnlocked: true }
}

/**
 * Clear guest entries (e.g. after sync to cloud).
 */
export function clearGuestPassportEntries(): void {
  try {
    localStorage.removeItem(GUEST_PASSPORT_KEY)
  } catch (err) {
    console.warn('[GuestPassport] Failed to clear localStorage:', err)
  }
}

