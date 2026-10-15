import { Link } from 'react-router-dom'
import { Award, Camera, Calendar, ArrowUpRight } from 'lucide-react'
import type { PassportItem } from './passportService'
import { useTranslation } from '../../i18n'

interface PassportStampCardProps {
  item: PassportItem
}

export function PassportStampCard({ item }: PassportStampCardProps) {
  const { t, language } = useTranslation()

  const siteName = language === 'vi' ? item.nameVi : item.nameEn
  const collectionName = language === 'vi' ? item.collectionNameVi : item.collectionNameEn

  const formattedDate = new Date(item.unlockedAt).toLocaleDateString(
    language === 'vi' ? 'vi-VN' : 'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
  )

  return (
    <Link
      to={`/heritage/${item.slug}`}
      className="group relative bg-white border border-amber-900/15 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-amber-600 transition-all duration-200 flex flex-col justify-between overflow-hidden"
    >
      {/* Decorative Passport Stamp Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100/80 border border-amber-300 text-amber-800 flex items-center justify-center shadow-xs">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900/60 block">
              Passport Stamp
            </span>
            <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-600" />
              <span>{formattedDate}</span>
            </span>
          </div>
        </div>

        {collectionName && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 truncate max-w-[130px]">
            {collectionName}
          </span>
        )}
      </div>

      {/* Image Thumbnail */}
      <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-gray-100 mb-3">
        <img
          src={item.coverImageUrl}
          alt={siteName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Floating memories count badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[11px] font-medium flex items-center gap-1 shadow-xs">
          <Camera className="w-3 h-3 text-amber-400" />
          <span>
            {item.memoriesCount} {t.passport.memoriesCount}
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
        <h3 className="font-bold text-sm text-gray-900 group-hover:text-amber-800 transition-colors line-clamp-1">
          {siteName}
        </h3>
        <div className="p-1 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-amber-100 group-hover:text-amber-800 transition-colors">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  )
}

