import { useState } from 'react'
import {
  ChevronDown,
  MapPin,
  Sparkles,
  ArrowRight,
  Lock,
  CheckCircle2,
  Search,
  Building2,
  Compass,
} from 'lucide-react'
import { useTranslation } from '../../i18n'
import type { RegionItem, AreaItem } from '../../features/heritage'

interface RegionAccordionProps {
  regions: RegionItem[]
  selectedRegionSlug: string | null
  onToggleRegion: (slug: string) => void
  onSelectArea: (areaSlug: string, regionSlug: string) => void
}

export function RegionAccordion({
  regions,
  selectedRegionSlug,
  onToggleRegion,
  onSelectArea,
}: RegionAccordionProps) {
  const { language } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="space-y-4">
      {/* Quick Search across provinces */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            language === 'vi'
              ? 'Tìm nhanh tỉnh / thành phố trong 34 tỉnh thành...'
              : 'Search across 34 provinces & cities...'
          }
          className="w-full pl-10 pr-4 py-2.5 bg-white/90 focus:bg-white rounded-2xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm text-gray-800 placeholder-gray-400 transition-all outline-hidden shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {regions.map((region) => {
        const isExpanded = selectedRegionSlug === region.slug || Boolean(searchQuery.trim())
        const regionName = language === 'vi' ? region.nameVi : region.nameEn
        const regionDesc = language === 'vi' ? region.descriptionVi : region.descriptionEn
        const isSouthFocus = region.slug === 'nam'

        // Filter areas by search query
        const filteredAreas = region.areas.filter((area) => {
          if (!searchQuery.trim()) return true
          const q = searchQuery.toLowerCase().trim()
          return (
            area.nameVi.toLowerCase().includes(q) ||
            area.nameEn.toLowerCase().includes(q) ||
            area.slug.toLowerCase().includes(q)
          )
        })

        if (searchQuery.trim() && filteredAreas.length === 0) {
          return null
        }

        // Split into Featured hubs (has sites or isActive) vs other 34 merged provinces
        const featuredAreas = filteredAreas.filter((a) => a.isActive || a.siteCount > 0)
        const regularAreas = filteredAreas.filter((a) => !a.isActive && a.siteCount === 0)

        return (
          <div
            key={region.id}
            className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
              isExpanded
                ? 'bg-white shadow-md border-amber-300 ring-2 ring-amber-500/20'
                : 'bg-white/80 hover:bg-white border-gray-200/90 shadow-xs'
            }`}
          >
            {/* Header Accordion Bar */}
            <button
              type="button"
              onClick={() => onToggleRegion(region.slug)}
              className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-hidden"
              aria-expanded={isExpanded}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                    isSouthFocus
                      ? 'bg-amber-600 text-white shadow-sm shadow-amber-900/20'
                      : isExpanded
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {region.orderIndex}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-gray-900 text-base sm:text-lg tracking-tight">
                      {regionName}
                    </h4>

                    {isSouthFocus && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>{language === 'vi' ? 'Trọng tâm phát triển' : 'Featured Region'}</span>
                      </span>
                    )}

                    <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
                      ({region.areas.length} {language === 'vi' ? 'tỉnh thành' : 'provinces'})
                    </span>
                  </div>

                  {regionDesc && (
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                      {regionDesc}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-gray-800">
                    {region.siteCount} {language === 'vi' ? 'di tích' : 'sites'}
                  </div>
                  <div className="text-[11px] text-amber-700 font-medium">
                    {region.unlockedCount} {language === 'vi' ? 'đã mở' : 'unlocked'}
                  </div>
                </div>

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-500 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 bg-amber-50 text-amber-800 border-amber-200' : ''
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </button>

            {/* Accordion Content: Areas List */}
            {isExpanded && (
              <div className="px-4 pb-5 sm:px-5 pt-1 border-t border-gray-100 animate-in fade-in duration-200 space-y-4">
                {/* 1. Featured Hubs (e.g. TP.HCM, Hà Nội, Huế, Quảng Ninh...) */}
                {featuredAreas.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider pt-2">
                      <Compass className="w-3.5 h-3.5 text-amber-700" />
                      <span>
                        {language === 'vi'
                          ? 'Địa bàn trọng điểm & Di tích đã số hóa'
                          : 'Key Hubs & Digitized Heritage'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {featuredAreas.map((area: AreaItem) => {
                        const areaName = language === 'vi' ? area.nameVi : area.nameEn
                        const isAreaActive = area.isActive // TP.HCM

                        return (
                          <div
                            key={area.id}
                            className={`rounded-2xl p-4 border transition-all ${
                              isAreaActive
                                ? 'bg-gradient-to-br from-amber-500/10 via-amber-100/30 to-amber-500/5 border-amber-300 shadow-sm relative overflow-hidden group hover:border-amber-400'
                                : 'bg-amber-50/40 border-amber-200/70 text-gray-700 hover:border-amber-300'
                            }`}
                          >
                            {isAreaActive && (
                              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-2">
                                <span className="inline-block bg-amber-600 text-white text-[9px] font-bold uppercase tracking-wider py-0.5 px-6 rotate-12 shadow-xs">
                                  ACTIVE
                                </span>
                              </div>
                            )}

                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5 font-bold text-gray-900 text-sm sm:text-base">
                                  <MapPin
                                    className={`w-4 h-4 shrink-0 ${
                                      isAreaActive ? 'text-amber-700' : 'text-amber-600'
                                    }`}
                                  />
                                  <span>{areaName}</span>
                                </div>

                                <p className="text-xs text-gray-500 mt-1">
                                  {area.siteCount}{' '}
                                  {language === 'vi' ? 'danh lam, di tích' : 'heritage sites'}
                                </p>
                              </div>

                              {area.unlockedCount > 0 ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>
                                    {area.unlockedCount}/{area.siteCount}
                                  </span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                                  <Lock className="w-3 h-3 text-gray-400" />
                                  <span>0/{area.siteCount}</span>
                                </span>
                              )}
                            </div>

                            {/* Button */}
                            <div className="mt-4 pt-3 border-t border-amber-900/10 flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => onSelectArea(area.slug, region.slug)}
                                className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer ${
                                  isAreaActive
                                    ? 'bg-amber-800 hover:bg-amber-900 active:scale-[0.98] text-white'
                                    : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300'
                                }`}
                              >
                                <span>
                                  {isAreaActive
                                    ? language === 'vi'
                                      ? 'Khám phá Bản đồ TP.HCM (7 di tích)'
                                      : 'Explore HCMC Map (7 sites)'
                                    : language === 'vi'
                                    ? `Xem bản đồ ${areaName}`
                                    : `View ${areaName} Map`}
                                </span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Other 34 Official Provinces in this Region */}
                {regularAreas.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1.5 font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {language === 'vi'
                            ? `Các tỉnh, thành phố trực thuộc (${regularAreas.length})`
                            : `Provinces & Cities (${regularAreas.length})`}
                        </span>
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {language === 'vi' ? '34 tỉnh thành chính thức' : 'Official units'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {regularAreas.map((area) => {
                        const areaName = language === 'vi' ? area.nameVi : area.nameEn
                        return (
                          <button
                            key={area.id}
                            type="button"
                            onClick={() => onSelectArea(area.slug, region.slug)}
                            className="group p-2.5 rounded-xl border border-gray-200/80 hover:border-amber-400 bg-gray-50/60 hover:bg-amber-50/40 text-left transition-all cursor-pointer flex flex-col justify-between gap-1 shadow-2xs"
                          >
                            <div className="flex items-center gap-1 font-semibold text-gray-800 text-xs group-hover:text-amber-900 transition-colors">
                              <MapPin className="w-3 h-3 text-gray-400 group-hover:text-amber-600 shrink-0" />
                              <span className="truncate">{areaName}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-gray-400 group-hover:text-amber-700/80 pt-0.5">
                              <span>{language === 'vi' ? 'Sắp mở rộng' : 'Coming soon'}</span>
                              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
