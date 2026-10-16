import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Sparkles,
  MapPin,
  Compass,
  QrCode,
  Layers,
  ChevronRight,
  ExternalLink,
  BookOpen,
} from 'lucide-react'
import { useTranslation } from '../../i18n'
import type { MapSiteItem } from '../../features/heritage'
import { HeritageMapView } from '../../components/map/HeritageMapView'

type FilterType = 'all' | 'unlocked' | 'locked'

interface DetailedAreaViewProps {
  areaSlug: string
  areaNameVi?: string
  areaNameEn?: string
  regionSlug?: string
  sites: MapSiteItem[]
  centerLat?: number
  centerLng?: number
  defaultZoom?: number
  initialSelectedSiteId?: string | null
  onBack: () => void
  onExploreHcm?: () => void
}

export function DetailedAreaView({
  areaSlug,
  areaNameVi = 'TP. Hồ Chí Minh',
  areaNameEn = 'Ho Chi Minh City',
  sites,
  centerLat,
  centerLng,
  defaultZoom = 13,
  initialSelectedSiteId,
  onBack,
  onExploreHcm,
}: DetailedAreaViewProps) {
  const { t, language } = useTranslation()

  const [filter, setFilter] = useState<FilterType>('all')
  const [viewMode, setViewMode] = useState<'detail' | 'list'>('detail')
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(
    initialSelectedSiteId ?? sites[0]?.id ?? null
  )
  const [prevInitialId, setPrevInitialId] = useState<string | null | undefined>(
    initialSelectedSiteId
  )

  if (initialSelectedSiteId && initialSelectedSiteId !== prevInitialId) {
    setPrevInitialId(initialSelectedSiteId)
    setSelectedSiteId(initialSelectedSiteId)
    setViewMode('detail')
  }

  const selectedSite = useMemo(() => {
    if (viewMode === 'list') return null
    if (selectedSiteId) {
      const match = sites.find((s) => s.id === selectedSiteId)
      if (match) return match
    }
    return sites[0] ?? null
  }, [viewMode, sites, selectedSiteId])

  const handleSelectSite = (site: MapSiteItem | null) => {
    if (site) {
      setSelectedSiteId(site.id)
      setViewMode('detail')
    } else {
      setViewMode('list')
    }
  }

  const displayName = language === 'vi' ? areaNameVi : areaNameEn
  const isHcm = areaSlug === 'tp-ho-chi-minh'

  // Center coordinates for map view
  const mapCenter: [number, number] = useMemo(() => {
    if (centerLat && centerLng) return [centerLat, centerLng]
    if (isHcm) return [10.776944, 106.7009]
    if (sites.length > 0) return [sites[0].latitude, sites[0].longitude]
    return [10.776944, 106.7009]
  }, [centerLat, centerLng, isHcm, sites])

  // Filtered sites according to filter state
  const filteredSites = useMemo(() => {
    if (filter === 'unlocked') {
      return sites.filter((s) => s.isUnlocked)
    }
    if (filter === 'locked') {
      return sites.filter((s) => !s.isUnlocked)
    }
    return sites
  }, [sites, filter])

  const unlockedCount = sites.filter((s) => s.isUnlocked).length
  const totalCount = sites.length

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Breadcrumb Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          {/* Back button link */}
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
            <span>
              {language === 'vi' ? 'Quay lại Bản đồ 3 Miền' : 'Back to 3-Region Overview'}
            </span>
          </button>

          <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Compass className="w-6 h-6 text-amber-700" />
              <span>{displayName}</span>
            </h1>

            {isHcm && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === 'vi' ? 'Trọng tâm phát triển' : 'Focus Area'}</span>
              </span>
            )}

            <span className="text-xs text-gray-500 font-medium">
              ({unlockedCount}/{totalCount} {language === 'vi' ? 'đã mở khóa' : 'unlocked'})
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl">
            {isHcm
              ? language === 'vi'
                ? 'Khám phá 7 di tích lịch sử và văn hóa tiêu biểu bậc nhất tại TP.HCM. Bấm vào từng địa điểm trên bản đồ hoặc danh sách bên phải để xem thông tin chi tiết.'
                : 'Discover 7 iconic historical and cultural landmarks in Ho Chi Minh City. Click on the map pins or select from the list.'
              : language === 'vi'
              ? `Danh sách các địa điểm di tích nổi tiếng tại ${displayName}.`
              : `Heritage landmarks in ${displayName}.`}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 self-start md:self-center overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              filter === 'all'
                ? 'bg-amber-800 text-white border-amber-900 shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {t.map.filterAll} ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter('unlocked')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              filter === 'unlocked'
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                : 'bg-white text-emerald-800 border-gray-200 hover:bg-emerald-50/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>{t.map.filterUnlocked} ({unlockedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('locked')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              filter === 'locked'
                ? 'bg-gray-800 text-white border-gray-900 shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-gray-400" />
            <span>{t.map.filterLocked} ({totalCount - unlockedCount})</span>
          </button>
        </div>
      </div>

      {/* 50/50 Split View: Left = Interactive Map, Right = Detailed Info Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* ================= LEFT COLUMN: MAP VIEW (50%) ================= */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="sticky top-20 flex-1">
            <HeritageMapView
              sites={filteredSites}
              selectedSite={selectedSite}
              onSelectSite={handleSelectSite}
              initialCenter={mapCenter}
              initialZoom={isHcm ? 14 : defaultZoom}
              minZoom={10}
              showFloatingCard={false} /* Right panel displays details on Desktop */
              className="h-[420px] sm:h-[500px] lg:h-[720px] shadow-md border-amber-900/10"
            />
          </div>
        </div>

        {/* ================= RIGHT COLUMN: INFO PANEL (50%) ================= */}
        <div className="lg:col-span-6 flex flex-col">
          {selectedSite ? (
            /* CASE 1: Rich Full View of Selected Site */
            <div className="bg-white rounded-3xl border border-gray-200/90 shadow-md p-5 sm:p-7 flex flex-col justify-between space-y-5 h-full animate-in fade-in duration-200">
              <div className="space-y-4">
                {/* Top Action Bar */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>{language === 'vi' ? 'Di tích tiêu biểu' : 'Featured Landmark'}</span>
                    </span>

                    {selectedSite.isUnlocked ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t.map.legendUnlocked}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                        <Lock className="w-3.5 h-3.5 text-gray-500" />
                        <span>{t.map.legendLocked}</span>
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectSite(null)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-amber-800 hover:underline cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{language === 'vi' ? `Xem danh sách (${filteredSites.length})` : 'View all sites'}</span>
                  </button>
                </div>

                {/* Cover Image */}
                <div className="relative h-60 sm:h-72 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-inner group">
                  <img
                    src={selectedSite.coverImageUrl}
                    alt={language === 'vi' ? selectedSite.nameVi : selectedSite.nameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-[11px] font-semibold text-amber-200 uppercase tracking-wider">
                      {selectedSite.collectionNameVi || 'Di sản Sài Gòn — TP. Hồ Chí Minh'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold leading-snug drop-shadow-sm">
                      {language === 'vi' ? selectedSite.nameVi : selectedSite.nameEn}
                    </h2>
                  </div>
                </div>

                {/* Address & GPS */}
                <div className="bg-amber-50/50 rounded-2xl p-3.5 border border-amber-200/60 space-y-1.5 text-xs text-gray-700">
                  {selectedSite.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span className="font-semibold text-gray-900">{selectedSite.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-500 pl-6">
                    <span>
                      Tọa độ: {selectedSite.latitude.toFixed(6)}°B, {selectedSite.longitude.toFixed(6)}°Đ
                    </span>
                  </div>
                </div>

                {/* Cultural Story / Description */}
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wider text-amber-900">
                    {language === 'vi' ? 'Giá trị Lịch sử & Văn hóa' : 'Historical & Cultural Value'}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed max-h-44 overflow-y-auto pr-1">
                    {language === 'vi' ? selectedSite.descriptionVi : selectedSite.descriptionEn}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  to={`/heritage/${selectedSite.slug}`}
                  className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-amber-800 hover:bg-amber-900 active:scale-95 text-white text-sm font-bold shadow-md transition-all"
                >
                  <span>{language === 'vi' ? 'Khám phá Chi tiết Di sản' : 'Explore Heritage Story'}</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>

                {selectedSite.isUnlocked ? (
                  <Link
                    to="/passport"
                    className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-sm font-bold transition-all shadow-xs"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>{language === 'vi' ? 'Đã mở khóa (Xem Hộ chiếu)' : 'Unlocked (View Passport)'}</span>
                  </Link>
                ) : (
                  <Link
                    to="/unlock"
                    className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-sm font-bold transition-all shadow-xs"
                  >
                    <QrCode className="w-4 h-4 text-amber-700" />
                    <span>{language === 'vi' ? 'Quét mã mở khóa' : 'Scan to Unlock'}</span>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            /* CASE 2: List View of all sites in this area (or Empty State) */
            <div className="bg-white rounded-3xl border border-gray-200/90 shadow-md p-5 sm:p-6 space-y-4 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-700" />
                    <span>
                      {isHcm
                        ? language === 'vi'
                          ? 'Danh sách Di tích TP.HCM'
                          : 'All HCMC Landmarks'
                        : language === 'vi'
                        ? `Danh sách Di tích tại ${displayName}`
                        : `Heritage Sites in ${displayName}`}{' '}
                      ({filteredSites.length})
                    </span>
                  </h3>
                  {filteredSites.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {language === 'vi' ? 'Bấm để xem trên bản đồ' : 'Click to locate on map'}
                    </span>
                  )}
                </div>
              </div>

              {filteredSites.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-4 my-auto animate-in fade-in duration-200">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 flex items-center justify-center mx-auto shadow-xs border border-amber-300/50">
                    <Compass className="w-8 h-8 text-amber-800" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-gray-900 text-base sm:text-lg">
                      {language === 'vi'
                        ? `Dữ liệu di tích tại ${displayName} đang được số hóa`
                        : `Heritage sites in ${displayName} are coming soon`}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                      {language === 'vi'
                        ? 'Hệ thống Hộ chiếu Di sản số đang chuẩn bị mở rộng thêm các di tích tại tỉnh thành này. Trong giai đoạn thử nghiệm, 7 di tích tiêu biểu tại TP. Hồ Chí Minh đã sẵn sàng!'
                        : 'The Digital Heritage Passport is preparing to expand to this province. Currently, 7 iconic landmarks in Ho Chi Minh City are fully active!'}
                    </p>
                  </div>
                  {onExploreHcm && !isHcm && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={onExploreHcm}
                        className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-amber-800 hover:bg-amber-900 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>
                          {language === 'vi'
                            ? 'Khám phá Bản đồ TP. Hồ Chí Minh (7 di tích)'
                            : 'Explore Ho Chi Minh City (7 sites)'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Scrollable List */
                <div className="space-y-3 overflow-y-auto max-h-[620px] pr-1 flex-1">
                  {filteredSites.map((site) => {
                    const name = language === 'vi' ? site.nameVi : site.nameEn
                    const desc = language === 'vi' ? site.descriptionVi : site.descriptionEn

                    return (
                      <div
                        key={site.id}
                        onClick={() => handleSelectSite(site)}
                        className="p-3.5 rounded-2xl border border-gray-200 hover:border-amber-400 bg-white hover:bg-amber-50/40 transition-all cursor-pointer flex gap-3.5 items-center group shadow-2xs"
                      >
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 relative">
                          <img
                            src={site.coverImageUrl}
                            alt={name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-1 right-1">
                            {site.isUnlocked ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow">
                                ✓
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-gray-800 text-white flex items-center justify-center text-[10px] font-bold shadow">
                                🔒
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-gray-900 text-sm group-hover:text-amber-800 transition-colors truncate">
                              {name}
                            </h4>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
                          </div>

                          {site.address && (
                            <p className="text-[11px] text-gray-500 flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
                              <span>{site.address}</span>
                            </p>
                          )}

                          {desc && (
                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                              {desc}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
