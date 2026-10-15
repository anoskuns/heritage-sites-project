import { supabase } from '../../services/supabase/client'
import type { HeritageSite, Memory } from '../../types/database.types'

export interface HeritageDetailCollection {
  id: string
  nameVi: string
  nameEn: string
}

export interface HeritageDetailData {
  site: HeritageSite
  collection?: HeritageDetailCollection
  isUnlocked: boolean
  unlockedAt?: string
  userMemories: Memory[]
}

/**
 * Loads a heritage site by slug, respecting publication state and RLS.
 * Separates public heritage data from private user memories.
 */
export async function fetchHeritageDetail(
  slug: string,
  userId?: string
): Promise<HeritageDetailData | null> {
  // 1. Fetch public heritage site
  const { data: siteData, error: siteError } = await supabase
    .from('heritage_sites')
    .select(`
      *,
      pin_designs (
        id,
        name,
        image_url,
        collection_id,
        collections (
          id,
          name_vi,
          name_en
        )
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (siteError) {
    throw new Error(siteError.message)
  }

  if (!siteData) {
    return null
  }

  // Extract collection if present
  let collection: HeritageDetailCollection | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anySite = siteData as any
  if (Array.isArray(anySite.pin_designs) && anySite.pin_designs.length > 0) {
    const pd = anySite.pin_designs[0]
    if (pd?.collections) {
      collection = {
        id: pd.collections.id,
        nameVi: pd.collections.name_vi,
        nameEn: pd.collections.name_en,
      }
    }
  }

  let isUnlocked = false
  let unlockedAt: string | undefined
  let userMemories: Memory[] = []

  // 2. Fetch user-specific private data (passport unlock status & private memories)
  if (userId) {
    const { data: entry } = await supabase
      .from('passport_entries')
      .select('id, unlocked_at')
      .eq('user_id', userId)
      .eq('site_id', siteData.id)
      .maybeSingle()

    if (entry) {
      isUnlocked = true
      unlockedAt = entry.unlocked_at

      // Fetch user's own memories only
      const { data: memories } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', userId)
        .eq('site_id', siteData.id)
        .order('created_at', { ascending: false })

      if (memories) {
        userMemories = memories
      }
    }
  }

  return {
    site: siteData as HeritageSite,
    collection,
    isUnlocked,
    unlockedAt,
    userMemories,
  }
}

