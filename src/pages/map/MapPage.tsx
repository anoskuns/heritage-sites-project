import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '../../features/authentication'
import { useTranslation } from '../../i18n'
import {
  fetchRegionsWithAreas,
  fetchMapSites,
  type RegionItem,
  type MapSiteItem,
} from '../../features/heritage'
import { VietnamOverviewView } from './VietnamOverviewView'
import { DetailedAreaView } from './DetailedAreaView'

export function MapPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const [regions, setRegions] = useState<RegionItem[]>([])
  const [allSites, setAllSites] = useState<MapSiteItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // URL search query synchronization
  const areaParam = searchParams.get('area')
  const regionParam = searchParams.get('region') || 'nam'
  const highlightSiteId = searchParams.get('highlightSite')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const [regionsData, sitesData] = await Promise.all([
        fetchRegionsWithAreas(user?.id),
        fetchMapSites(user?.id),
      ])
      setRegions(regionsData)
      setAllSites(sitesData.sites)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.errors.generic
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [user, t])

  // Listen to unlock / revoke event for immediate real-time map data sync
  useEffect(() => {
    const handleUnlockedEvent = () => {
      loadData()
    }
    window.addEventListener('heritage_site_unlocked', handleUnlockedEvent)
    window.addEventListener('heritage_passport_revoked', handleUnlockedEvent)
    window.addEventListener('passport_stamp_revoked', handleUnlockedEvent)
    window.addEventListener('heritage_sites_updated', handleUnlockedEvent)
    return () => {
      window.removeEventListener('heritage_site_unlocked', handleUnlockedEvent)
      window.removeEventListener('heritage_passport_revoked', handleUnlockedEvent)
      window.removeEventListener('passport_stamp_revoked', handleUnlockedEvent)
      window.removeEventListener('heritage_sites_updated', handleUnlockedEvent)
    }
  }, [loadData])

  useEffect(() => {
    let ignore = false
    async function init() {
      try {
        const [regionsData, sitesData] = await Promise.all([
          fetchRegionsWithAreas(user?.id),
          fetchMapSites(user?.id),
        ])
        if (!ignore) {
          setRegions(regionsData)
          setAllSites(sitesData.sites)
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : t.errors.generic
          setErrorMessage(msg)
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    init()
    return () => {
      ignore = true
    }
  }, [user, t])

  // Find active area object if areaParam is present
  let currentAreaInfo: { area: (typeof regions)[0]['areas'][0]; regionSlug: string } | null = null
  if (areaParam) {
    for (const r of regions) {
      const found = r.areas.find((a) => a.slug === areaParam)
      if (found) {
        currentAreaInfo = { area: found, regionSlug: r.slug }
        break
      }
    }
  }

  // Sites belonging to the currently selected area
  const areaSites = areaParam ? allSites.filter((s) => s.areaSlug === areaParam) : []

  // Navigation handlers
  const handleSelectRegion = (slug: string) => {
    setSearchParams({ region: slug })
  }

  const handleSelectArea = (areaSlug: string, regionSlug: string) => {
    setSearchParams({ region: regionSlug, area: areaSlug })
  }

  const handleBackToOverview = () => {
    setSearchParams({ region: regionParam })
  }

  // Loading state skeleton
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-8 space-y-6 animate-pulse">
        <div className="h-36 bg-amber-100/60 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-[450px] bg-gray-200 rounded-3xl" />
          <div className="lg:col-span-7 space-y-4">
            <div className="h-24 bg-gray-200 rounded-3xl" />
            <div className="h-24 bg-gray-200 rounded-3xl" />
            <div className="h-24 bg-gray-200 rounded-3xl" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (errorMessage) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{t.errors.generic}</h2>
        <p className="text-sm text-gray-600">{errorMessage}</p>
        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-800 text-white text-sm font-semibold hover:bg-amber-900 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t.common.retry}</span>
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6">
      {areaParam ? (
        /* Mode 2: Detailed GIS Area Map (TP. Hồ Chí Minh or other area) */
        <DetailedAreaView
          areaSlug={areaParam}
          areaNameVi={currentAreaInfo?.area.nameVi ?? 'TP. Hồ Chí Minh'}
          areaNameEn={currentAreaInfo?.area.nameEn ?? 'Ho Chi Minh City'}
          regionSlug={currentAreaInfo?.regionSlug ?? regionParam}
          centerLat={currentAreaInfo?.area.centerLat}
          centerLng={currentAreaInfo?.area.centerLng}
          defaultZoom={currentAreaInfo?.area.defaultZoom}
          initialSelectedSiteId={highlightSiteId}
          sites={areaSites}
          onBack={handleBackToOverview}
          onExploreHcm={() => handleSelectArea('tp-ho-chi-minh', 'nam')}
        />
      ) : (
        /* Mode 1: Interactive S-Curve Overview Map of Vietnam */
        <VietnamOverviewView
          regions={regions}
          selectedRegionSlug={regionParam}
          onSelectRegion={handleSelectRegion}
          onSelectArea={handleSelectArea}
        />
      )}
    </div>
  )
}
