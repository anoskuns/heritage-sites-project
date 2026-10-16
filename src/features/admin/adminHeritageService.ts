import { supabase } from '../../services/supabase/client'
import type { HeritageSite } from '../../types/database.types'
import type { AdminSiteFormData } from './types'
import { HCM_HERITAGE_SITES, OFFICIAL_REGIONS } from '../heritage/mapService'
import { saveSiteSections } from '../heritage/heritageService'

const LOCAL_CUSTOM_SITES_KEY = 'heritage_admin_custom_sites_v2'

/**
 * Famous Vietnamese landmarks dictionary for instant offline resolution
 */
const KNOWN_LANDMARK_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'hoang thanh thang long': { lat: 21.0345, lng: 105.8407 },
  'ho guom': { lat: 21.0285, lng: 105.8542 },
  'ho hoan kiem': { lat: 21.0285, lng: 105.8542 },
  'van mieu': { lat: 21.0272, lng: 105.8355 },
  'chay chua tran quoc': { lat: 21.0483, lng: 105.8364 },
  'vinh ha long': { lat: 20.9101, lng: 107.1839 },
  'dai noi hue': { lat: 16.4697, lng: 107.5794 },
  'co do hue': { lat: 16.4697, lng: 107.5794 },
  'chua thien mu': { lat: 16.4528, lng: 107.5453 },
  'pho co hoi an': { lat: 15.8778, lng: 108.3276 },
  'chua cau': { lat: 15.8771, lng: 108.326 },
  'dinh doc lap': { lat: 10.7769, lng: 106.6953 },
  'buu dien trung tam': { lat: 10.7798, lng: 106.7 },
  'nha tho duc ba': { lat: 10.7797, lng: 106.699 },
  'nha hat thanh pho': { lat: 10.7767, lng: 106.7032 },
  'ben nha rong': { lat: 10.7681, lng: 106.7067 },
  'cho ben thanh': { lat: 10.7725, lng: 106.6981 },
  'bao tang my thuat': { lat: 10.7701, lng: 106.6997 },
  'dia dao cu chi': { lat: 11.1419, lng: 106.4636 },
  'chua ba den': { lat: 11.3761, lng: 106.1689 },
}

/**
 * Intelligent Google Maps URL & coordinate parser.
 * Extracts latitude and longitude from diverse formats:
 * - DMS: 10°46'37.0"N 106°41'43.0"E
 * - Decimal: 10.7798, 106.6990
 * - URL @: /@10.7798,106.6990,17z
 * - Query: ?q=10.7798,106.6990 or ?ll=10.7798,106.6990
 * - Protobuf: !3d10.7798!4d106.6990 or !8m2!3d10.7798!4d106.6990
 */
export function parseCoordinatesFromGoogleMapsUrl(
  input: string
): { latitude: number; longitude: number } | null {
  if (!input || !input.trim()) return null
  const cleaned = input.trim()

  // 1. DMS Format: 10°46'37.0"N 106°41'43.0"E or 10°46'37"N, 106°41'43"E
  const dmsRegex = /(\d+)[°\s]+(\d+)['\s]+([\d.]+)?["\s]*([NS])[,\s]+(\d+)[°\s]+(\d+)['\s]+([\d.]+)?["\s]*([EW])/i
  const dmsMatch = cleaned.match(dmsRegex)
  if (dmsMatch) {
    const latDeg = parseFloat(dmsMatch[1])
    const latMin = parseFloat(dmsMatch[2]) || 0
    const latSec = parseFloat(dmsMatch[3]) || 0
    const latDir = dmsMatch[4].toUpperCase()

    const lngDeg = parseFloat(dmsMatch[5])
    const lngMin = parseFloat(dmsMatch[6]) || 0
    const lngSec = parseFloat(dmsMatch[7]) || 0
    const lngDir = dmsMatch[8].toUpperCase()

    let lat = latDeg + latMin / 60 + latSec / 3600
    let lng = lngDeg + lngMin / 60 + lngSec / 3600
    if (latDir === 'S') lat = -lat
    if (lngDir === 'W') lng = -lng

    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: Number(lat.toFixed(6)), longitude: Number(lng.toFixed(6)) }
    }
  }

  // 2. Raw coordinate string: "10.7798, 106.6990" or "10.7798 106.6990"
  const rawCoordRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)[,\s]+[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/
  if (rawCoordRegex.test(cleaned)) {
    const parts = cleaned.replace(/,/g, ' ').trim().split(/\s+/)
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0])
      const lng = parseFloat(parts[1])
      if (!isNaN(lat) && !isNaN(lng)) {
        return { latitude: Number(lat.toFixed(6)), longitude: Number(lng.toFixed(6)) }
      }
    }
  }

  // 3. Format /@10.7798,106.6990 or /@10.7798,106.6990,17z
  const atMatch = cleaned.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (atMatch) {
    const lat = parseFloat(atMatch[1])
    const lng = parseFloat(atMatch[2])
    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: Number(lat.toFixed(6)), longitude: Number(lng.toFixed(6)) }
    }
  }

  // 4. Format ?q=10.7798,106.6990 or ?ll=10.7798,106.6990 or daddr / query
  const queryMatch = cleaned.match(/[?&](?:q|ll|daddr|query|destination)=(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/)
  if (queryMatch) {
    const lat = parseFloat(queryMatch[1])
    const lng = parseFloat(queryMatch[2])
    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: Number(lat.toFixed(6)), longitude: Number(lng.toFixed(6)) }
    }
  }

  // 5. Protobuf embed format: !3d10.7798!4d106.6990 or !8m2!3d10.7798!4d106.6990
  const pbMatch = cleaned.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
  if (pbMatch) {
    const lat = parseFloat(pbMatch[1])
    const lng = parseFloat(pbMatch[2])
    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: Number(lat.toFixed(6)), longitude: Number(lng.toFixed(6)) }
    }
  }

  // 6. Reversed protobuf: !2d106.6990!3d10.7798
  const pbReverseMatch = cleaned.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/)
  if (pbReverseMatch) {
    const lng = parseFloat(pbReverseMatch[1])
    const lat = parseFloat(pbReverseMatch[2])
    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: Number(lat.toFixed(6)), longitude: Number(lng.toFixed(6)) }
    }
  }

  // 7. Generic decimal pair inside URL or text: lat between -90 and 90, lng between -180 and 180
  const genericMatch = cleaned.match(/(-?\d{1,2}\.\d{4,})[,\s]+(-?\d{1,3}\.\d{4,})/)
  if (genericMatch) {
    const lat = parseFloat(genericMatch[1])
    const lng = parseFloat(genericMatch[2])
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { latitude: Number(lat.toFixed(6)), longitude: Number(lng.toFixed(6)) }
    }
  }

  return null
}

/**
 * Universal asynchronous Google Maps coordinate resolver.
 * Handles short links (maps.app.goo.gl), place names, and online geocoding.
 */
export async function resolveGoogleMapsCoordinates(
  input: string
): Promise<{ latitude: number; longitude: number; resolvedPlaceName?: string } | null> {
  const syncResult = parseCoordinatesFromGoogleMapsUrl(input)
  if (syncResult) return syncResult

  const trimmed = input.trim()
  if (!trimmed) return null

  // 1. Check if short link (maps.app.goo.gl or goo.gl/maps)
  if (trimmed.includes('maps.app.goo.gl') || trimmed.includes('goo.gl/maps')) {
    try {
      // Use free public CORS proxy to inspect redirected location
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(trimmed)}`
      const res = await fetch(proxyUrl, { method: 'GET' })
      if (res.ok) {
        const text = await res.text()
        const parsed = parseCoordinatesFromGoogleMapsUrl(text)
        if (parsed) return parsed
      }
    } catch {
      // fallback
    }
  }

  // 2. Extract place name from /place/Name or search query
  let extractedName: string | null = null
  const placeMatch = trimmed.match(/\/place\/([^/@?]+)/)
  if (placeMatch) {
    try {
      extractedName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')).trim()
    } catch {
      extractedName = placeMatch[1].replace(/\+/g, ' ').trim()
    }
  }

  if (!extractedName && (trimmed.includes('google.com/maps') || !trimmed.startsWith('http'))) {
    // Try search query or raw place name
    const qMatch = trimmed.match(/[?&]q=([^&]+)/)
    if (qMatch) {
      try {
        extractedName = decodeURIComponent(qMatch[1].replace(/\+/g, ' ')).trim()
      } catch {
        extractedName = qMatch[1].replace(/\+/g, ' ').trim()
      }
    } else if (!trimmed.startsWith('http')) {
      extractedName = trimmed
    }
  }

  if (extractedName) {
    // Check known landmark dictionary
    const norm = extractedName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')

    for (const [key, coords] of Object.entries(KNOWN_LANDMARK_COORDINATES)) {
      if (norm.includes(key) || key.includes(norm)) {
        return {
          latitude: coords.lat,
          longitude: coords.lng,
          resolvedPlaceName: extractedName,
        }
      }
    }

    // Attempt OpenStreetMap Nominatim Geocoding
    try {
      const geoQuery = encodeURIComponent(`${extractedName} Vietnam`)
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${geoQuery}&limit=1`,
        { headers: { 'Accept-Language': 'vi,en' } }
      )
      if (geoRes.ok) {
        const data = await geoRes.json()
        if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
          const lat = parseFloat(data[0].lat)
          const lng = parseFloat(data[0].lon)
          if (!isNaN(lat) && !isNaN(lng)) {
            return {
              latitude: Number(lat.toFixed(6)),
              longitude: Number(lng.toFixed(6)),
              resolvedPlaceName: extractedName,
            }
          }
        }
      }
    } catch {
      // ignore network geocoding failure
    }
  }

  return null
}

/**
 * Detects the closest Vietnam Province/Area from geographical coordinates.
 */
export function detectNearestArea(
  lat: number,
  lng: number
): {
  areaId: string
  areaSlug: string
  regionSlug: string
  areaNameVi: string
  areaNameEn: string
} {
  let closestArea = OFFICIAL_REGIONS[2].areas[0] // Default to TP. Hồ Chí Minh
  let closestRegion = OFFICIAL_REGIONS[2]
  let minDistanceSq = Number.POSITIVE_INFINITY

  for (const region of OFFICIAL_REGIONS) {
    for (const area of region.areas) {
      const dLat = lat - area.centerLat
      const dLng = lng - area.centerLng
      const distSq = dLat * dLat + dLng * dLng

      if (distSq < minDistanceSq) {
        minDistanceSq = distSq
        closestArea = area
        closestRegion = region
      }
    }
  }

  return {
    areaId: closestArea.id,
    areaSlug: closestArea.slug,
    regionSlug: closestRegion.slug,
    areaNameVi: closestArea.nameVi,
    areaNameEn: closestArea.nameEn,
  }
}

/**
 * Retrieves custom sites created locally or modified during offline/fallback operations.
 */
export function getLocalCustomSites(): HeritageSite[] {
  try {
    const raw = localStorage.getItem(LOCAL_CUSTOM_SITES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as HeritageSite[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveLocalCustomSites(sites: HeritageSite[]): void {
  try {
    localStorage.setItem(LOCAL_CUSTOM_SITES_KEY, JSON.stringify(sites))
  } catch (err) {
    console.warn('[AdminHeritage] Failed to save custom sites to localStorage:', err)
  }
}

/**
 * Fetches all heritage sites for the Admin list, merging remote database + local mock sites.
 */
export async function fetchAllAdminSites(): Promise<HeritageSite[]> {
  let dbSites: HeritageSite[] = []

  try {
    const { data, error } = await supabase
      .from('heritage_sites')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      dbSites = data as HeritageSite[]
    }
  } catch (err) {
    console.warn('[AdminHeritage] Error fetching remote sites:', err)
  }

  // Merge static seed sites if DB is empty or missing them
  const dbSlugs = new Set(dbSites.map((s) => s.slug))
  const staticSites: HeritageSite[] = HCM_HERITAGE_SITES.filter(
    (s) => !dbSlugs.has(s.slug)
  ).map((s) => ({
    id: s.id,
    slug: s.slug,
    name_vi: s.nameVi,
    name_en: s.nameEn,
    story_vi: s.descriptionVi || '',
    story_en: s.descriptionEn || '',
    description_vi: s.descriptionVi || '',
    description_en: s.descriptionEn || '',
    latitude: s.latitude,
    longitude: s.longitude,
    cover_image_url: s.coverImageUrl,
    audio_url: null,
    source_reference: null,
    is_published: true,
    area_id: 'p79',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

  // Merge custom local sites
  const localSites = getLocalCustomSites()
  const currentSlugs = new Set([...dbSites.map((s) => s.slug), ...staticSites.map((s) => s.slug)])
  const uniqueLocal = localSites.filter((l) => !currentSlugs.has(l.slug))

  const allSites = [...uniqueLocal, ...dbSites, ...staticSites]
  return allSites
}

/**
 * Creates a new heritage site. Attempts Supabase insertion with fallback to local cache.
 */
export async function createHeritageSite(data: AdminSiteFormData): Promise<HeritageSite> {
  const newId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `site-${Date.now()}`

  // Auto-detect area if omitted
  const detectedArea = detectNearestArea(data.latitude, data.longitude)
  const finalAreaId = data.areaId || detectedArea.areaId

  const now = new Date().toISOString()
  const newSite: HeritageSite = {
    id: newId,
    slug: data.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    name_vi: data.nameVi.trim(),
    name_en: data.nameEn.trim(),
    story_vi: data.storyVi.trim(),
    story_en: data.storyEn.trim(),
    description_vi: data.descriptionVi?.trim() || null,
    description_en: data.descriptionEn?.trim() || null,
    latitude: data.latitude,
    longitude: data.longitude,
    cover_image_url: data.coverImageUrl.trim(),
    audio_url: data.audioUrl?.trim() || null,
    source_reference: data.sourceReference?.trim() || null,
    is_published: data.isPublished,
    area_id: finalAreaId,
    created_at: now,
    updated_at: now,
  }

  // 1. Try Supabase insert
  try {
    const { data: inserted, error } = await supabase
      .from('heritage_sites')
      .insert({
        slug: newSite.slug,
        name_vi: newSite.name_vi,
        name_en: newSite.name_en,
        story_vi: newSite.story_vi,
        story_en: newSite.story_en,
        description_vi: newSite.description_vi,
        description_en: newSite.description_en,
        latitude: newSite.latitude,
        longitude: newSite.longitude,
        cover_image_url: newSite.cover_image_url,
        audio_url: newSite.audio_url,
        source_reference: newSite.source_reference,
        is_published: newSite.is_published,
        area_id: newSite.area_id,
      })
      .select()
      .single()

    if (!error && inserted) {
      // Also create pin design if needed
      await supabase.from('pin_designs').insert({
        site_id: inserted.id,
        name: `Con dấu ${newSite.name_vi}`,
        image_url: newSite.cover_image_url,
      })

      // Also persist to local custom sites for instant offline resilience
      const locals = getLocalCustomSites()
      saveLocalCustomSites([inserted as HeritageSite, ...locals.filter((s) => s.id !== inserted.id)])

      if (data.sections && Array.isArray(data.sections)) {
        saveSiteSections(inserted.id, data.sections)
        saveSiteSections(newSite.slug, data.sections)
      }

      window.dispatchEvent(new CustomEvent('heritage_sites_updated'))
      return inserted as HeritageSite
    }
  } catch (err) {
    console.warn('[AdminHeritage] Cloud insert error, saving locally:', err)
  }

  // 2. Fallback save locally
  const locals = getLocalCustomSites()
  saveLocalCustomSites([newSite, ...locals])

  if (data.sections && Array.isArray(data.sections)) {
    saveSiteSections(newSite.id, data.sections)
    saveSiteSections(newSite.slug, data.sections)
  }

  window.dispatchEvent(new CustomEvent('heritage_sites_updated'))

  return newSite
}

/**
 * Updates an existing heritage site.
 */
export async function updateHeritageSite(
  id: string,
  data: Partial<AdminSiteFormData>
): Promise<void> {
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (data.nameVi !== undefined) updates.name_vi = data.nameVi.trim()
  if (data.nameEn !== undefined) updates.name_en = data.nameEn.trim()
  if (data.storyVi !== undefined) updates.story_vi = data.storyVi.trim()
  if (data.storyEn !== undefined) updates.story_en = data.storyEn.trim()
  if (data.descriptionVi !== undefined) updates.description_vi = data.descriptionVi?.trim() || null
  if (data.descriptionEn !== undefined) updates.description_en = data.descriptionEn?.trim() || null
  if (data.latitude !== undefined) updates.latitude = data.latitude
  if (data.longitude !== undefined) updates.longitude = data.longitude
  if (data.coverImageUrl !== undefined) updates.cover_image_url = data.coverImageUrl.trim()
  if (data.audioUrl !== undefined) updates.audio_url = data.audioUrl?.trim() || null
  if (data.sourceReference !== undefined) updates.source_reference = data.sourceReference?.trim() || null
  if (data.isPublished !== undefined) updates.is_published = data.isPublished
  if (data.areaId !== undefined) {
    updates.area_id = data.areaId || null
  } else if (data.latitude !== undefined && data.longitude !== undefined) {
    updates.area_id = detectNearestArea(data.latitude, data.longitude).areaId
  }

  if (data.sections && Array.isArray(data.sections)) {
    saveSiteSections(id, data.sections)
    if (data.slug) {
      saveSiteSections(data.slug, data.sections)
    }
  }

  // 1. Try Supabase update
  try {
    await supabase.from('heritage_sites').update(updates as never).eq('id', id)
  } catch (err) {
    console.warn('[AdminHeritage] Cloud update failed:', err)
  }

  // 2. Also update local custom sites
  const locals = getLocalCustomSites()
  const updatedLocals = locals.map((s) => (s.id === id ? { ...s, ...updates } : s))
  saveLocalCustomSites(updatedLocals)

  window.dispatchEvent(new CustomEvent('heritage_sites_updated'))
}

/**
 * Toggles a heritage site's published status.
 */
export async function toggleSitePublishStatus(id: string, currentStatus: boolean): Promise<boolean> {
  const nextStatus = !currentStatus
  await updateHeritageSite(id, { isPublished: nextStatus })
  return nextStatus
}

/**
 * Deletes a heritage site.
 */
export async function deleteHeritageSite(id: string): Promise<void> {
  try {
    await supabase.from('heritage_sites').delete().eq('id', id)
  } catch (err) {
    console.warn('[AdminHeritage] Cloud delete failed:', err)
  }

  const locals = getLocalCustomSites()
  saveLocalCustomSites(locals.filter((s) => s.id !== id))

  window.dispatchEvent(new CustomEvent('heritage_sites_updated'))
}
