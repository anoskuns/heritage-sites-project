import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Compass, RotateCcw } from 'lucide-react'
import { useTranslation } from '../../i18n'
import type { MapSiteItem } from '../../features/heritage'
import { SiteSummaryCard } from './SiteSummaryCard'

// Official CARTO Basemaps API key & HD Raster Style
const CARTO_API_KEY =
  (import.meta.env.VITE_CARTO_API_KEY as string) || 'cb1_4llv_1_5863e28ee5fdc6bbcb1f93e7'

const CARTO_RASTER_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'carto-voyager': {
      type: 'raster',
      tiles: [
        `https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png?key=${CARTO_API_KEY}`,
        `https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png?key=${CARTO_API_KEY}`,
        `https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png?key=${CARTO_API_KEY}`,
        `https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png?key=${CARTO_API_KEY}`,
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxzoom: 20,
    },
  },
  layers: [
    {
      id: 'carto-voyager-layer',
      type: 'raster',
      source: 'carto-voyager',
      minzoom: 0,
      maxzoom: 20,
    },
  ],
}

interface HeritageMapViewProps {
  sites: MapSiteItem[]
  selectedSite: MapSiteItem | null
  onSelectSite: (site: MapSiteItem | null) => void
  initialCenter?: [number, number] // [lat, lng]
  initialZoom?: number
  minZoom?: number
  showFloatingCard?: boolean
  className?: string
}

export function HeritageMapView({
  sites,
  selectedSite,
  onSelectSite,
  initialCenter = [10.776944, 106.7009],
  initialZoom = 14,
  minZoom = 10,
  showFloatingCard = false,
  className = '',
}: HeritageMapViewProps) {
  const { t, language } = useTranslation()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  const centerLngLat: [number, number] = [initialCenter[1], initialCenter[0]]

  // Helper to load boundary overlay
  const addBoundaryLayer = (map: maplibregl.Map) => {
    fetch('/data/hcmc-boundary.geojson')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load HCMC geojson')
        return res.json()
      })
      .then((geojsonData) => {
        if (!map.getSource('hcmc-boundary')) {
          map.addSource('hcmc-boundary', {
            type: 'geojson',
            data: geojsonData,
          })

          map.addLayer({
            id: 'hcmc-boundary-fill',
            type: 'fill',
            source: 'hcmc-boundary',
            paint: {
              'fill-color': '#d97706',
              'fill-opacity': 0.05,
            },
          })

          map.addLayer({
            id: 'hcmc-boundary-line',
            type: 'line',
            source: 'hcmc-boundary',
            paint: {
              'line-color': '#b45309',
              'line-width': 2.5,
              'line-opacity': 0.7,
              'line-dasharray': [3, 2],
            },
          })
        }
      })
      .catch(() => {
        // Continue silently if boundary overlay is not found
      })
  }

  // 1. Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: CARTO_RASTER_STYLE,
      center: centerLngLat,
      zoom: initialZoom,
      minZoom: minZoom,
      attributionControl: {
        compact: true,
      },
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

    map.on('load', () => {
      addBoundaryLayer(map)
      map.resize()
    })

    // Safety resizes to prevent zero-height blank canvas on initial flex render
    const t1 = setTimeout(() => map.resize(), 100)
    const t2 = setTimeout(() => map.resize(), 400)
    const t3 = setTimeout(() => map.resize(), 1000)

    // ResizeObserver on the container
    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      ro = new ResizeObserver(() => {
        map.resize()
      })
      ro.observe(mapContainerRef.current)
    }

    mapRef.current = map

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      if (ro) ro.disconnect()
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Initialize once

  // 2. FlyTo when selected site or initialCenter changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (selectedSite) {
      map.flyTo({
        center: [selectedSite.longitude, selectedSite.latitude],
        zoom: Math.max(map.getZoom(), 15.5),
        speed: 1.2,
        curve: 1.4,
        essential: true,
      })
    }
  }, [selectedSite])

  // 3. Render Custom Pin Markers for Heritage Sites
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    sites.forEach((site) => {
      const isSelected = selectedSite?.id === site.id
      const isUnlocked = site.isUnlocked
      const siteName = language === 'vi' ? site.nameVi : site.nameEn

      // Create custom marker container DOM element
      const el = document.createElement('div')
      el.className = 'group flex flex-col items-center cursor-pointer transition-transform duration-200'
      if (isSelected) {
        el.className += ' scale-110 z-30'
      } else {
        el.className += ' hover:scale-105 z-10'
      }

      // Marker inner markup
      if (isSelected) {
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <span class="absolute -inset-2 rounded-full bg-amber-500/30 animate-ping"></span>
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-500 border-2 border-white shadow-xl flex items-center justify-center text-white transform rotate-45">
              <span class="transform -rotate-45 text-base font-extrabold">✦</span>
            </div>
          </div>
          <div class="mt-1 px-2.5 py-0.5 rounded-full bg-amber-900/90 backdrop-blur-md border border-amber-300/40 text-[11px] font-bold text-white shadow-lg whitespace-nowrap">
            ${siteName}
          </div>
        `
      } else if (isUnlocked) {
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs">
              ✓
            </div>
          </div>
          <div class="mt-1 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs border border-emerald-300 text-[10px] font-semibold text-emerald-900 shadow-xs whitespace-nowrap hidden group-hover:block">
            ${siteName}
          </div>
        `
      } else {
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-stone-600 to-stone-800 border-2 border-white shadow-md flex items-center justify-center text-white text-[11px]">
              🔒
            </div>
          </div>
          <div class="mt-1 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs border border-stone-200 text-[10px] font-medium text-stone-700 shadow-xs whitespace-nowrap hidden group-hover:block">
            ${siteName}
          </div>
        `
      }

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        onSelectSite(site)
      })

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([site.longitude, site.latitude])
        .addTo(map)

      markersRef.current.push(marker)
    })
  }, [sites, selectedSite, language, onSelectSite])

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: centerLngLat,
        zoom: initialZoom,
        speed: 1.2,
      })
      onSelectSite(null)
    }
  }

  return (
    <div
      className={`relative w-full h-full min-h-[460px] rounded-3xl overflow-hidden border border-amber-900/10 shadow-md ${className}`}
    >
      {/* MapLibre DOM Mount Point - absolute inset-0 guarantees full canvas fill */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Top Left Controls: Reset View */}
      <div className="absolute top-4 left-4 z-10">
        <button
          type="button"
          onClick={handleResetView}
          title={t.map.resetView}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 text-gray-800 text-xs font-semibold shadow-md hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-800" />
          <span className="hidden sm:inline">{t.map.resetView}</span>
        </button>
      </div>

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 p-2.5 shadow-md flex flex-col gap-1.5 text-xs">
        <div className="font-bold text-gray-900 flex items-center gap-1.5 pb-1 border-b border-gray-100">
          <Compass className="w-3.5 h-3.5 text-amber-800" />
          <span>
            {language === 'vi'
              ? 'Bản đồ Di sản (CARTO HD)'
              : 'Heritage Map (CARTO HD)'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 border border-white text-white flex items-center justify-center text-[9px] font-bold">
            ✓
          </div>
          <span className="text-gray-700 text-[11px]">{t.map.legendUnlocked}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-stone-600 border border-white text-white flex items-center justify-center text-[8px]">
            🔒
          </div>
          <span className="text-gray-700 text-[11px]">{t.map.legendLocked}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-amber-600 border-2 border-amber-300 text-white flex items-center justify-center text-[9px] font-bold">
            ✦
          </div>
          <span className="text-gray-700 text-[11px] font-medium">{t.map.legendSelected}</span>
        </div>
      </div>

      {/* Floating Selected Site Summary Card (if enabled) */}
      {showFloatingCard && selectedSite && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-20 flex justify-end">
          <SiteSummaryCard site={selectedSite} onClose={() => onSelectSite(null)} />
        </div>
      )}
    </div>
  )
}
