import { Compass, Sparkles, BookOpen, QrCode, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../../i18n'
import type { RegionItem } from '../../features/heritage'
import { VietnamSvgMap } from '../../components/map/VietnamSvgMap'
import { RegionAccordion } from '../../components/map/RegionAccordion'

interface VietnamOverviewViewProps {
  regions: RegionItem[]
  selectedRegionSlug: string
  onSelectRegion: (slug: string) => void
  onSelectArea: (areaSlug: string, regionSlug: string) => void
}

export function VietnamOverviewView({
  regions,
  selectedRegionSlug,
  onSelectRegion,
  onSelectArea,
}: VietnamOverviewViewProps) {
  const { language } = useTranslation()

  // Calculate totals
  const totalSites = regions.reduce((sum, r) => sum + r.siteCount, 0)
  const totalUnlocked = regions.reduce((sum, r) => sum + r.unlockedCount, 0)

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-amber-950/15 relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 rounded-full bg-red-500/10 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-amber-200 backdrop-blur-md border border-white/10">
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {language === 'vi'
                ? 'Hành trình Khám phá Di sản'
                : 'National Heritage Exploration'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {language === 'vi'
              ? 'Bản đồ Di sản Tương tác Việt Nam'
              : 'Interactive Vietnam Heritage Map'}
          </h1>

          <p className="text-sm sm:text-base text-amber-100/90 leading-relaxed">
            {language === 'vi'
              ? 'Khám phá các danh lam thắng cảnh và di tích lịch sử qua 3 Miền Bắc – Trung – Nam. Giai đoạn này tập trung đặc biệt vào 7 di tích tiêu biểu tại Thành phố Hồ Chí Minh.'
              : 'Explore cultural and historical landmarks across North, Central, and Southern Vietnam, featuring 7 iconic sites in Ho Chi Minh City.'}
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <div className="text-xs text-amber-200/80 font-medium">
              {language === 'vi' ? '3 Vùng Miền' : '3 Regions'}
            </div>
            <div className="text-lg sm:text-xl font-bold text-white mt-0.5">
              Bắc • Trung • Nam
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <div className="text-xs text-amber-200/80 font-medium">
              {language === 'vi' ? 'Tổng số Di tích' : 'Total Sites'}
            </div>
            <div className="text-lg sm:text-xl font-bold text-white mt-0.5">
              {totalSites} {language === 'vi' ? 'địa điểm' : 'places'}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <div className="text-xs text-amber-200/80 font-medium">
              {language === 'vi' ? 'Đã sưu tầm' : 'Unlocked'}
            </div>
            <div className="text-lg sm:text-xl font-bold text-emerald-300 mt-0.5">
              {totalUnlocked}/{totalSites}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex flex-col justify-center">
            <button
              type="button"
              onClick={() => onSelectArea('tp-ho-chi-minh', 'nam')}
              className="inline-flex items-center justify-between text-xs font-bold text-amber-200 hover:text-white group cursor-pointer"
            >
              <span>{language === 'vi' ? 'Vào xem TP.HCM' : 'Open HCMC Map'}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: SVG Map on Left, Region Accordion on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Interactive Vietnam SVG Map Overlay on Watercolor Image */}
        <div className="lg:col-span-5 sticky top-20">
          <VietnamSvgMap
            regions={regions}
            selectedRegionSlug={selectedRegionSlug}
            onSelectRegion={onSelectRegion}
            onSelectArea={(areaSlug, regionSlug = 'nam') =>
              onSelectArea(areaSlug, regionSlug)
            }
            mapImageUrl="/images/vietnam-watercolor-map.png"
          />

          {/* Quick Shortcuts below map */}
          <div className="mt-4 flex items-center justify-between gap-3 px-2">
            <Link
              to="/unlock"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-xl border border-amber-200/80 transition-colors"
            >
              <QrCode className="w-4 h-4 text-amber-700" />
              <span>{language === 'vi' ? 'Quét QR Mở khóa' : 'Scan QR to Unlock'}</span>
            </Link>

            <Link
              to="/passport"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 transition-colors shadow-2xs"
            >
              <BookOpen className="w-4 h-4 text-amber-800" />
              <span>{language === 'vi' ? 'Hộ chiếu số' : 'My Passport'}</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Region Accordion and Areas Detail */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>
                {language === 'vi'
                  ? 'Danh sách Miền & Khu vực'
                  : 'Regions & Highlighted Areas'}
              </span>
            </h2>
            <span className="text-xs text-gray-500">
              {language === 'vi' ? 'Bấm để mở rộng' : 'Click to expand'}
            </span>
          </div>

          <RegionAccordion
            regions={regions}
            selectedRegionSlug={selectedRegionSlug}
            onToggleRegion={onSelectRegion}
            onSelectArea={onSelectArea}
          />
        </div>
      </div>
    </div>
  )
}