import { supabase } from '../../services/supabase/client'

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
}

export interface PassportStats {
  unlockedCount: number
  totalSites: number
  memoriesCount: number
  firstUnlockedAt: string | null
  collectionsCount: number
}

export interface UserPassportData {
  items: PassportItem[]
  stats: PassportStats
}

/**
 * Fetches user's passport entries, memory counts per site, and published site statistics.
 * Uses efficient aggregated queries to avoid N+1 fetches.
 */
export async function fetchUserPassport(userId: string): Promise<UserPassportData> {
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
    throw new Error(entriesError.message)
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

  // 3. Count total published heritage sites
  const { count: totalPublishedSites, error: countError } = await supabase
    .from('heritage_sites')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true)

  if (countError) {
    console.warn('[PassportService] Failed to count published sites:', countError.message)
  }

  // 4. Map entries into PassportItem array
  const uniqueCollections = new Set<string>()
  const items: PassportItem[] = []

  let oldestUnlockedDate: string | null = null

  if (entries) {
    for (const entry of entries) {
      // Supabase relation typing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const site = entry.heritage_sites as any
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

      if (!oldestUnlockedDate || new Date(entry.unlocked_at) < new Date(oldestUnlockedDate)) {
        oldestUnlockedDate = entry.unlocked_at
      }

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
    },
  }
}

