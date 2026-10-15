import { Link } from 'react-router-dom'
import { CheckCircle2, Lock, ArrowRight, X, MapPin } from 'lucide-react'
import { useTranslation } from '../../i18n'
import type { MapSiteItem } from '../../features/heritage'

interface SiteSummaryCardProps {
  site: MapSiteItem
  onClose: () => void
}

export function SiteSummaryCard({ site, onClose }: SiteSummaryCardProps) {
  const { t, language } = useTranslation()

  const siteName = language === 'vi' ? site.nameVi : site.nameEn
  const siteDesc = language === 'vi' ? site.descriptionVi : site.descriptionEn
  const collectionName = language === 'vi' ? site.collectionNameVi : site.collectionNameEn

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/90 p-4 w-full sm:w-96 max-w-full transition-all duration-200 animate-in fade-in slide-in-from-bottom-3">
      {/* Header with Close Button */}
      <div className="flex items-start justify-between gap-2 pb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {site.isUnlocked ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{t.map.legendUnlocked}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
              <Lock className="w-3 h-3 text-gray-500" />
              <span>{t.map.legendLocked}</span>
            </span>
          )}

          {collectionName && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-900 border border-amber-200">
              {collectionName}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          aria-label={t.common.close}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body: Thumbnail and Info */}
      <div className="flex gap-3 pt-1">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
          <img
            src={site.coverImageUrl}
            alt={siteName}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="font-bold text-gray-900 text-sm line-clamp-1">
            {siteName}
          </h3>

          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
            <span className="truncate">
              {site.latitude.toFixed(4)}°B, {site.longitude.toFixed(4)}°Đ
            </span>
          </div>

          {siteDesc && (
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {siteDesc}
            </p>
          )}
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between gap-2">
        <span className="text-[11px] text-amber-800 font-medium">
          {site.isUnlocked ? t.heritageDetail.isUnlocked : t.heritageDetail.isLocked}
        </span>
        <Link
          to={`/heritage/${site.slug}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all"
        >
          <span>{t.map.viewDetails}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}

