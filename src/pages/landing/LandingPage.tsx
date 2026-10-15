import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  QrCode,
  BookOpen,
  Compass,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Users,
} from 'lucide-react'
import { useTranslation } from '../../i18n'
import { useAuth } from '../../features/authentication'
import { supabase } from '../../services/supabase/client'

interface FeaturedSite {
  id: string
  slug: string
  name_vi: string
  name_en: string
  cover_image_url: string
  description_vi: string | null
  description_en: string | null
}

export function LandingPage() {
  const { t, language } = useTranslation()
  const { user } = useAuth()

  const [featuredSites, setFeaturedSites] = useState<FeaturedSite[]>([])
  const [isLoadingSites, setIsLoadingSites] = useState<boolean>(true)

  useEffect(() => {
    let ignore = false
    async function fetchFeatured() {
      try {
        const { data, error } = await supabase
          .from('heritage_sites')
          .select('id, slug, name_vi, name_en, cover_image_url, description_vi, description_en')
          .eq('is_published', true)
          .limit(4)

        if (!ignore && !error && data) {
          setFeaturedSites(data)
        }
      } catch (err) {
        console.warn('Failed to load featured sites:', err)
      } finally {
        if (!ignore) {
          setIsLoadingSites(false)
        }
      }
    }

    fetchFeatured()
    return () => {
      ignore = true
    }
  }, [])

  return (
    <div className="py-6 sm:py-12 max-w-5xl mx-auto space-y-16 sm:space-y-24">
      {/* 1. Hero Section */}
      <div className="text-center space-y-6 pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 text-amber-900 text-xs font-semibold tracking-wide uppercase shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>{t.common.appName} — {t.common.appTagline}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.15]">
          {t.landing.heroTitle}
        </h1>

        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {t.landing.heroSubtitle}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Link
            to="/unlock"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-800 text-white font-semibold text-sm shadow-lg shadow-amber-900/15 hover:bg-amber-900 active:scale-[0.98] transition-all"
          >
            <QrCode className="w-5 h-5" />
            <span>{t.landing.heroCtaSecondary}</span>
          </Link>

          <Link
            to="/map"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-gray-300 text-gray-800 font-semibold text-sm shadow-xs hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            <Compass className="w-5 h-5 text-amber-800" />
            <span>{t.landing.heroCta}</span>
          </Link>

          {!user && (
            <Link
              to="/auth"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-semibold text-sm transition-all"
            >
              <span>{t.nav.login}</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Visual Pin-to-Digital Illustration */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 text-white p-8 sm:p-12 overflow-hidden shadow-xl border border-amber-800/80">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-800/80 border border-amber-700 text-amber-300 text-xs font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>{t.landing.pinFeatureTitle}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              Mỗi chiếc Pin — Một câu chuyện di sản bất tận
            </h2>
            <p className="text-sm sm:text-base text-amber-100/90 leading-relaxed">
              {t.landing.pinFeatureDesc}
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-amber-200">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Mã QR độc nhất chống giả</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Tích hợp Hộ chiếu số trọn đời</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl flex flex-col items-center text-center space-y-4 max-w-xs">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-1 shadow-lg">
                <div className="w-full h-full rounded-xl bg-amber-950 flex flex-col items-center justify-center text-amber-200 space-y-1">
                  <Award className="w-10 h-10 text-amber-400" />
                  <span className="text-[10px] font-bold tracking-wider uppercase">Pin Di Sản</span>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-white">Hoàng thành Thăng Long</h3>
                <p className="text-[11px] text-amber-200/80">Quét mã QR ở mặt sau để mở khóa</p>
              </div>
              <Link
                to="/unlock"
                className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs transition-all shadow-md"
              >
                Mở khóa ngay
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. How It Works Section */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t.landing.howItWorksTitle}
          </h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Hành trình 3 bước đơn giản biến kỷ vật lưu niệm thành kho tàng tri thức số cá nhân
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-gray-200/90 shadow-xs flex flex-col items-center text-center space-y-3.5 hover:shadow-md transition-all">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">{t.landing.step1Title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{t.landing.step1Desc}</p>
          </div>

          {/* Step 2 */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-gray-200/90 shadow-xs flex flex-col items-center text-center space-y-3.5 hover:shadow-md transition-all">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <QrCode className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">{t.landing.step2Title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{t.landing.step2Desc}</p>
          </div>

          {/* Step 3 */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-gray-200/90 shadow-xs flex flex-col items-center text-center space-y-3.5 hover:shadow-md transition-all">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">{t.landing.step3Title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{t.landing.step3Desc}</p>
          </div>
        </div>
      </div>

      {/* 4. Featured Heritage Sites (Live Data from Database) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t.landing.featuredSitesTitle}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Các di sản văn hóa và thiên nhiên tiêu biểu đang chờ bạn khám phá
            </p>
          </div>
          <Link
            to="/map"
            className="text-xs sm:text-sm font-semibold text-amber-800 hover:text-amber-900 inline-flex items-center gap-1 group"
          >
            <span>{t.landing.exploreMore}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {isLoadingSites ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-3xl" />
            <div className="aspect-square bg-gray-200 rounded-3xl" />
            <div className="aspect-square bg-gray-200 rounded-3xl" />
            <div className="aspect-square bg-gray-200 rounded-3xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredSites.map((site) => {
              const name = language === 'vi' ? site.name_vi : site.name_en
              const desc = language === 'vi' ? site.description_vi : site.description_en

              return (
                <Link
                  key={site.id}
                  to={`/heritage/${site.slug}`}
                  className="group rounded-3xl overflow-hidden bg-white border border-gray-200/90 shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  <div className="aspect-video w-full bg-gray-100 overflow-hidden relative">
                    <img
                      src={site.cover_image_url}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="p-1 rounded-lg bg-black/60 backdrop-blur-xs text-white flex items-center justify-center">
                        <MapPin className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                      {name}
                    </h3>
                    {desc && (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {desc}
                      </p>
                    )}
                    <span className="text-[11px] font-semibold text-amber-800 inline-flex items-center gap-1 pt-1">
                      <span>{t.heritageDetail.historicalOverview}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* 5. Community & Exploration Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>{t.community.title}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900">
            Cùng cộng đồng lưu giữ ngàn năm di sản
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md leading-relaxed">
            Xem những khoảnh khắc, cảm xúc và kỷ niệm đẹp từ những nhà thám hiểm di sản trên khắp mọi miền tổ quốc.
          </p>
        </div>

        <Link
          to="/community"
          className="px-6 py-3 rounded-2xl bg-amber-800 hover:bg-amber-900 active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-md transition-all shrink-0 cursor-pointer"
        >
          {t.community.createPostCta}
        </Link>
      </div>
    </div>
  )
}
