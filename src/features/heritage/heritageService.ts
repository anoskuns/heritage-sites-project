import { supabase } from '../../services/supabase/client'
import type { HeritageSite, Memory } from '../../types/database.types'
import { getLocalUnlockedStamps } from '../passport/passportStorageService'
import { getLocalCustomSites } from '../admin/adminHeritageService'
import { HCM_HERITAGE_SITES } from './mapService'

export interface HeritageSectionItem {
  id: string
  titleVi: string
  titleEn: string
  bodyVi: string
  bodyEn: string
}

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
  sections?: HeritageSectionItem[]
}

const SECTIONS_STORAGE_KEY = 'heritage_site_sections_v2'

export function getSiteSections(siteIdOrSlug: string): HeritageSectionItem[] {
  try {
    const raw = localStorage.getItem(SECTIONS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Record<string, HeritageSectionItem[]>
    return parsed[siteIdOrSlug] || []
  } catch {
    return []
  }
}

export function saveSiteSections(siteIdOrSlug: string, sections: HeritageSectionItem[]): void {
  try {
    const raw = localStorage.getItem(SECTIONS_STORAGE_KEY)
    const parsed: Record<string, HeritageSectionItem[]> = raw ? JSON.parse(raw) : {}
    parsed[siteIdOrSlug] = sections
    localStorage.setItem(SECTIONS_STORAGE_KEY, JSON.stringify(parsed))
  } catch (err) {
    console.warn('[HeritageService] Failed to save site sections:', err)
  }
}

/**
 * Loads a heritage site by slug, respecting publication state and RLS.
 * Separates public heritage data from private user memories.
 * Merges local custom sites for seamless instant preview.
 */
export async function fetchHeritageDetail(
  slug: string,
  userId?: string
): Promise<HeritageDetailData | null> {
  let siteData: HeritageSite | null = null

  // 1. Fetch public heritage site from Supabase
  try {
    const { data, error: siteError } = await supabase
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

    if (!siteError && data) {
      siteData = data as unknown as HeritageSite
    }
  } catch (err) {
    console.warn('[HeritageService] Supabase fetch detail failed:', err)
  }

  // Fallback to local custom sites or static HCM sites if not found in cloud
  if (!siteData) {
    const localSites = getLocalCustomSites()
    const foundLocal = localSites.find(
      (s) => s.slug === slug || s.id === slug
    )

    if (foundLocal && foundLocal.is_published !== false) {
      siteData = foundLocal
    } else {
      const foundStatic = HCM_HERITAGE_SITES.find(
        (s) => s.slug === slug || s.id === slug
      )
      if (foundStatic) {
        siteData = {
          id: foundStatic.id,
          slug: foundStatic.slug,
          name_vi: foundStatic.nameVi,
          name_en: foundStatic.nameEn,
          story_vi: foundStatic.descriptionVi || '',
          story_en: foundStatic.descriptionEn || '',
          description_vi: foundStatic.descriptionVi || '',
          description_en: foundStatic.descriptionEn || '',
          latitude: foundStatic.latitude,
          longitude: foundStatic.longitude,
          cover_image_url: foundStatic.coverImageUrl,
          audio_url: null,
          source_reference: null,
          is_published: true,
          area_id: 'p79',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }
    }
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
    try {
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
    } catch (err) {
      console.warn('[HeritageService] Supabase passport query error:', err)
    }

    // Check local unlocked stamps registry (handles offline, demo tokens, and RPC fallbacks)
    const localStamps = getLocalUnlockedStamps(userId)
    const localMatch = localStamps.find(
      (s) => s.siteId === siteData.id || s.siteSlug === siteData.slug
    )
    if (localMatch) {
      isUnlocked = true
      if (!unlockedAt) {
        unlockedAt = localMatch.unlockedAt
      }
    }
  }

  // Load rich content sections
  const siteId = siteData.id
  const siteSlug = siteData.slug
  const storedSections = getSiteSections(siteId).length > 0
    ? getSiteSections(siteId)
    : getSiteSections(siteSlug).length > 0
    ? getSiteSections(siteSlug)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : ((siteData as any).sections as HeritageSectionItem[]) || []

  return {
    site: siteData as HeritageSite,
    collection,
    isUnlocked,
    unlockedAt,
    userMemories,
    sections: storedSections,
  }
}

