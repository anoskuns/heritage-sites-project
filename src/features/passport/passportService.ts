import { supabase } from '../../services/supabase/client'
import {
  getGuestPassportEntries,
  clearGuestPassportEntries,
} from './guestPassportService'
import {
  getLocalUnlockedStamps,
  isThangLongIdentifier,
} from './passportStorageService'
import { countAllLocalMemoriesByUser } from '../memories/memoryStorageService'
import { HCM_HERITAGE_SITES } from '../heritage/mapService'

export interface PassportItem {
  id: string
  unlockedAt: string
  siteId: string
  slug: string
  nameVi: string
  nameEn: string
  coverImageUrl: string
  collectionNameVi?: string
  collectionNameEn?: string
  memoriesCount: number
  isGuest?: boolean
  serialCode?: string
}

export interface PassportStats {
  unlockedCount: number
  totalSites: number
  memoriesCount: number
  firstUnlockedAt: string | null
  collectionsCount: number
  isGuest?: boolean
}

export interface UserPassportData {
  items: PassportItem[]
  stats: PassportStats
  isGuest?: boolean
}

/**
 * Fetches passport data for guest users (stored locally in localStorage).
 */
export async function fetchGuestPassport(): Promise<UserPassportData> {
  const guestEntries = getGuestPassportEntries()

  // Count total published heritage sites
  const { count: totalPublishedSites } = await supabase
    .from('heritage_sites')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true)

  if (guestEntries.length === 0) {
    return {
      items: [],
      stats: {
        unlockedCount: 0,
        totalSites: totalPublishedSites ?? 0,
        memoriesCount: 0,
        firstUnlockedAt: null,
        collectionsCount: 0,
        isGuest: true,
      },
      isGuest: true,
    }
  }

  const siteIds = guestEntries.map((e) => e.siteId)

  // Fetch full details of the unlocked sites
  const { data: sites } = await supabase
    .from('heritage_sites')
    .select(`
      id,
      slug,
      name_vi,
      name_en,
      cover_image_url,
      pin_designs (
        id,
        collection_id,
        collections (
          id,
          name_vi,
          name_en
        )
      )
    `)
    .in('id', siteIds)

  const siteMap = new Map((sites || []).map((s) => [s.id, s]))
  const uniqueCollections = new Set<string>()
  const items: PassportItem[] = []
  let oldestDate: string | null = null

  for (const entry of guestEntries) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const site = siteMap.get(entry.siteId) as any
    if (!site) continue

    let colVi: string | undefined
    let colEn: string | undefined

    if (Array.isArray(site.pin_designs) && site.pin_designs.length > 0) {
      const pd = site.pin_designs[0]
      if (pd?.collections) {
        colVi = pd.collections.name_vi
        colEn = pd.collections.name_en
        uniqueCollections.add(pd.collections.id)
      }
    }

    if (!oldestDate || new Date(entry.unlockedAt) < new Date(oldestDate)) {
      oldestDate = entry.unlockedAt
    }

    items.push({
      id: entry.id,
      unlockedAt: entry.unlockedAt,
      siteId: entry.siteId,
      slug: site.slug,
      nameVi: site.name_vi,
      nameEn: site.name_en,
      coverImageUrl: site.cover_image_url,
      collectionNameVi: colVi,
      collectionNameEn: colEn,
      memoriesCount: 0,
      isGuest: true,
    })
  }

  return {
    items,
    stats: {
      unlockedCount: items.length,
      totalSites: totalPublishedSites ?? items.length,
      memoriesCount: 0,
      firstUnlockedAt: oldestDate,
      collectionsCount: uniqueCollections.size,
      isGuest: true,
    },
    isGuest: true,
  }
}

/**
 * Fetches user's passport entries, memory counts per site, and published site statistics.
 * Uses efficient aggregated queries to avoid N+1 fetches.
 */
export async function fetchUserPassport(userId: string): Promise<UserPassportData> {
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()
  const isDemoAccount =
    currentUser?.email?.toLowerCase().includes('demo@heritage.vn') ||
    currentUser?.email?.toLowerCase().startsWith('demo@')

  // Check and merge any pending guest entries to cloud
  const guestEntries = getGuestPassportEntries()
  if (guestEntries.length > 0) {
    try {
      for (const ge of guestEntries) {
        // Skip stray Thang Long entries during guest migration
        if (isThangLongIdentifier(ge.siteSlug) || isThangLongIdentifier(ge.siteId)) {
          continue
        }
        await supabase
          .from('passport_entries')
          .insert({
            user_id: userId,
            site_id: ge.siteId,
            first_pin_item_id: ge.pinItemId || null,
          })
          .select('id')
      }
      clearGuestPassportEntries()
    } catch {
      // Ignore conflict errors during sync
    }
  }

  // If this is a demo account, proactively purge any residual remote Thang Long entries
  if (isDemoAccount) {
    try {
      await supabase
        .from('passport_entries')
        .delete()
        .eq('user_id', userId)
        .in('site_id', [
          'b1b2c3d4-0001-4000-b000-000000000001',
          'site-hoang-thanh',
        ])
    } catch {
      // ignore
    }
  }

  // 1. Fetch passport entries with site and collection details
  const { data: entries, error: entriesError } = await supabase
    .from('passport_entries')
    .select(`
      id,
      unlocked_at,
      site_id,
      heritage_sites (
        id,
        slug,
        name_vi,
        name_en,
        cover_image_url,
        is_published,
        pin_designs (
          id,
          collection_id,
          collections (
            id,
            name_vi,
            name_en
          )
        )
      )
    `)
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false })

  if (entriesError) {
    console.warn('[PassportService] Failed to fetch entries from remote DB:', entriesError.message)
  }

  // 2. Fetch memory counts for this user
  const { data: memories, error: memoriesError } = await supabase
    .from('memories')
    .select('site_id')
    .eq('user_id', userId)

  if (memoriesError) {
    console.warn('[PassportService] Failed to fetch memory counts:', memoriesError.message)
  }

  const memoryCountBySite: Record<string, number> = {}
  let totalMemories = 0
  if (memories) {
    for (const m of memories) {
      if (m.site_id) {
        memoryCountBySite[m.site_id] = (memoryCountBySite[m.site_id] || 0) + 1
        totalMemories++
      }
    }
  }

  // Include locally stored memories
  const localMemoriesBySite = countAllLocalMemoriesByUser(userId)
  for (const [siteId, count] of Object.entries(localMemoriesBySite)) {
    memoryCountBySite[siteId] = (memoryCountBySite[siteId] || 0) + count
    totalMemories += count
  }

  // 3. Count total published heritage sites
  const { count: totalPublishedSites, error: countError } = await supabase
    .from('heritage_sites')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true)

  if (countError) {
    console.warn('[PassportService] Failed to count published sites:', countError.message)
  }

  // 4. Merge locally registered/cached stamps that may not yet be in remote database
  const rawLocalStamps = getLocalUnlockedStamps(userId)
  const localStamps = isDemoAccount
    ? rawLocalStamps.filter(
        (ls) =>
          !isThangLongIdentifier(ls.siteId) &&
          !isThangLongIdentifier(ls.siteSlug) &&
          !isThangLongIdentifier(ls.rawToken)
      )
    : rawLocalStamps

  // 5. Map entries into PassportItem array
  const uniqueCollections = new Set<string>()
  const items: PassportItem[] = []

  let oldestUnlockedDate: string | null = null

  if (entries) {
    for (const entry of entries) {
      // Supabase relation typing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const site = entry.heritage_sites as any
      if (!site) continue

      if (
        isDemoAccount &&
        (isThangLongIdentifier(site.slug) || isThangLongIdentifier(entry.site_id))
      ) {
        continue
      }

      let colVi: string | undefined
      let colEn: string | undefined

      if (Array.isArray(site.pin_designs) && site.pin_designs.length > 0) {
        const pd = site.pin_designs[0]
        if (pd?.collections) {
          colVi = pd.collections.name_vi
          colEn = pd.collections.name_en
          uniqueCollections.add(pd.collections.id)
        }
      }

      if (!oldestUnlockedDate || new Date(entry.unlocked_at) < new Date(oldestUnlockedDate)) {
        oldestUnlockedDate = entry.unlocked_at
      }

      const localMatch = localStamps.find((ls) => ls.siteId === entry.site_id)

      items.push({
        id: entry.id,
        unlockedAt: entry.unlocked_at,
        siteId: entry.site_id,
        slug: site.slug,
        nameVi: site.name_vi,
        nameEn: site.name_en,
        coverImageUrl: site.cover_image_url,
        collectionNameVi: colVi,
        collectionNameEn: colEn,
        memoriesCount: memoryCountBySite[entry.site_id] || 0,
        isGuest: false,
        serialCode: localMatch?.serialCode,
      })
    }
  }
  const existingSiteIds = new Set(items.map((i) => i.siteId))
  const existingSlugs = new Set(items.map((i) => i.slug))
  const missingStamps = localStamps.filter(
    (ls) => !existingSiteIds.has(ls.siteId) && !existingSlugs.has(ls.siteSlug)
  )

  if (missingStamps.length > 0) {
    const missingSlugs = missingStamps.map((m) => m.siteSlug).filter(Boolean)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let missingSites: any[] = []

    try {
      const { data } = await supabase
        .from('heritage_sites')
        .select(`
          id,
          slug,
          name_vi,
          name_en,
          cover_image_url,
          pin_designs (
            id,
            collection_id,
            collections (
              id,
              name_vi,
              name_en
            )
          )
        `)
        .in('slug', missingSlugs)

      if (data) missingSites = data
    } catch (err) {
      console.warn('[PassportService] Failed to query missing sites:', err)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const missingMap = new Map<string, any>()
    for (const s of missingSites) {
      missingMap.set(s.id, s)
      missingMap.set(s.slug, s)
    }

    for (const stamp of missingStamps) {
      let site = missingMap.get(stamp.siteId) || missingMap.get(stamp.siteSlug)

      if (!site) {
        const staticMatch = HCM_HERITAGE_SITES.find(
          (s) => s.slug === stamp.siteSlug || s.id === stamp.siteId
        )
        if (staticMatch) {
          site = {
            id: staticMatch.id,
            slug: staticMatch.slug,
            name_vi: staticMatch.nameVi,
            name_en: staticMatch.nameEn,
            cover_image_url: staticMatch.coverImageUrl,
            pin_designs: [],
          }
        }
      }

      if (!site) continue

      let colVi: string | undefined
      let colEn: string | undefined

      if (Array.isArray(site.pin_designs) && site.pin_designs.length > 0) {
        const pd = site.pin_designs[0]
        if (pd?.collections) {
          colVi = pd.collections.name_vi
          colEn = pd.collections.name_en
          uniqueCollections.add(pd.collections.id)
        }
      }

      if (!oldestUnlockedDate || new Date(stamp.unlockedAt) < new Date(oldestUnlockedDate)) {
        oldestUnlockedDate = stamp.unlockedAt
      }

      items.unshift({
        id: stamp.id,
        unlockedAt: stamp.unlockedAt,
        siteId: stamp.siteId,
        slug: site.slug,
        nameVi: site.name_vi,
        nameEn: site.name_en,
        coverImageUrl: site.cover_image_url,
        collectionNameVi: colVi,
        collectionNameEn: colEn,
        memoriesCount: 0,
        isGuest: false,
        serialCode: stamp.serialCode,
      })
    }
  }

  return {
    items,
    stats: {
      unlockedCount: items.length,
      totalSites: totalPublishedSites ?? items.length,
      memoriesCount: totalMemories,
      firstUnlockedAt: oldestUnlockedDate,
      collectionsCount: uniqueCollections.size,
      isGuest: false,
    },
    isGuest: false,
  }
}

