import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  QrCode,
  Sparkles,
  Camera,
  Calendar,
  AlertCircle,
  RefreshCw,
  Award,
  RotateCcw,
} from 'lucide-react'
import { useAuth } from '../../features/authentication'
import { useTranslation } from '../../i18n'
import {
  fetchUserPassport,
  fetchGuestPassport,
  PassportStampCard,
  type UserPassportData,
  type PassportItem,
} from '../../features/passport'
import {
  revokeHeritageSiteUnlock,
  revokeAllHeritageSiteUnlocks,
} from '../../features/qr-unlock'
import { useDemoMode } from '../../services/demoModeService'

export function PassportPage() {
  const { user, profile } = useAuth()
  const { t, language } = useTranslation()
  const { isDemoMode } = useDemoMode()

  const [passportData, setPassportData] = useState<UserPassportData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadPassport = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const data = user ? await fetchUserPassport(user.id) : await fetchGuestPassport()
      setPassportData(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.errors.generic
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [user, t])

  // Listen to unlock / revoke / memory events for real-time passport updates
  useEffect(() => {
    const handleUpdate = () => {
      loadPassport()
    }
    window.addEventListener('heritage_site_unlocked', handleUpdate)
    window.addEventListener('heritage_passport_revoked', handleUpdate)
    window.addEventListener('passport_stamp_revoked', handleUpdate)
    window.addEventListener('heritage_memory_updated', handleUpdate)
    return () => {
      window.removeEventListener('heritage_site_unlocked', handleUpdate)
      window.removeEventListener('heritage_passport_revoked', handleUpdate)
      window.removeEventListener('passport_stamp_revoked', handleUpdate)
      window.removeEventListener('heritage_memory_updated', handleUpdate)
    }
  }, [loadPassport])

  useEffect(() => {
    let ignore = false

    async function init() {
      try {
        const data = user ? await fetchUserPassport(user.id) : await fetchGuestPassport()
        if (!ignore) setPassportData(data)
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : t.errors.generic
          setErrorMessage(msg)
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    init()
    return () => {
      ignore = true
    }
  }, [user, t])

  // Handle revoking a single stamp for QA testing
  const handleRevokeItem = async (item: PassportItem) => {
    const name = language === 'vi' ? item.nameVi : item.nameEn
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn thu hồi con dấu "${name}" không?\n\nThao tác này dùng để kiểm thử lại luồng quét mã và mở khóa con dấu.`
    )
    if (!confirmed) return

    try {
      await revokeHeritageSiteUnlock(item.siteId, name, user?.id, item.slug)
      await loadPassport()
    } catch (err) {
      console.error('Failed to revoke stamp:', err)
    }
  }

  // Handle resetting all stamps for QA testing
  const handleResetAllStamps = async () => {
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn thu hồi toàn bộ con dấu trong Hộ chiếu để kiểm thử lại từ đầu không?'
    )
    if (!confirmed) return

    try {
      await revokeAllHeritageSiteUnlocks(user?.id)
      await loadPassport()
    } catch (err) {
      console.error('Failed to reset all stamps:', err)
    }
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8 space-y-6 animate-pulse">
        <div className="h-40 bg-amber-100/50 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-64 bg-gray-100 rounded-2xl" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    )
  }

  // Error state
  if (errorMessage) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">{t.common.error}</h2>
        <p className="text-sm text-gray-500">{errorMessage}</p>
        <button
          type="button"
          onClick={loadPassport}
          className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t.common.retry}</span>
        </button>
      </div>
    )
  }

  const stats = passportData?.stats
  const items = passportData?.items || []
  const hasItems = items.length > 0

  const firstUnlockedDate = stats?.firstUnlockedAt
    ? new Date(stats.firstUnlockedAt).toLocaleDateString(
        language === 'vi' ? 'vi-VN' : 'en-US',
        {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }
      )
    : '—'

  const progressPercent =
    stats && stats.totalSites > 0
      ? Math.min(100, Math.round((stats.unlockedCount / stats.totalSites) * 100))
      : 0

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Passport Book Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-white p-6 sm:p-8 shadow-xl shadow-amber-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* User & Booklet Info */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide uppercase">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Digital Heritage Passport</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {user
                  ? profile?.display_name || user?.email?.split('@')[0]
                  : language === 'vi'
                    ? 'Hộ chiếu Du Khách'
                    : 'Guest Passport'}
              </h1>
              <p className="text-xs sm:text-sm text-amber-200/80">
                {user
                  ? t.passport.subtitle
                  : language === 'vi'
                    ? 'Bộ sưu tập con dấu di sản được lưu trữ trên thiết bị của bạn'
                    : 'Heritage stamps collected and stored on this device'}
              </p>
            </div>
          </div>

          {/* Quick CTA to unlock more */}
          <Link
            to="/unlock"
            className="self-start md:self-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all shrink-0"
          >
            <QrCode className="w-4 h-4" />
            <span>{t.passport.unlockMoreCta}</span>
          </Link>
        </div>

        {/* Stats Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-amber-500/20 text-center sm:text-left">
          {/* Stat 1: Unlocked Count */}
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-amber-300/80 block">
              {t.passport.statsUnlockedCount}
            </span>
            <div className="flex items-baseline gap-1 justify-center sm:justify-start">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {stats?.unlockedCount || 0}
              </span>
              <span className="text-xs text-amber-400 font-semibold">
                / {stats?.totalSites || 0}
              </span>
            </div>
          </div>

          {/* Stat 2: Progress */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-amber-300/80 block">
              {t.passport.totalSitesProgress}
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 block">
              {progressPercent}%
            </span>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Stat 3: Memories Saved */}
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-amber-300/80 block flex items-center gap-1 justify-center sm:justify-start">
              <Camera className="w-3 h-3 text-amber-400" />
              <span>{t.passport.statsTotalMemories}</span>
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white block">
              {stats?.memoriesCount || 0}
            </span>
          </div>

          {/* Stat 4: First Unlocked */}
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-amber-300/80 block flex items-center gap-1 justify-center sm:justify-start">
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>{t.passport.firstUnlocked}</span>
            </span>
            <span className="text-sm font-semibold text-white block truncate">
              {firstUnlockedDate}
            </span>
          </div>
        </div>
      </div>

      {/* Guest Banner if not logged in */}
      {!user && (
        <div className="p-4 rounded-2xl bg-[#F7F0E2] border border-[#D6AD60]/40 text-[#4A3B32] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8B2E1E] shrink-0" />
            <span>
              {language === 'vi'
                ? 'Bạn đang lưu tem vào Hộ chiếu Khách trên thiết bị này. Đăng nhập để đồng bộ vĩnh viễn lên đám mây!'
                : 'Stamps are saved to your guest passport on this device. Sign in to permanently sync to the cloud!'}
            </span>
          </div>
          <Link
            to="/auth?redirectTo=/passport"
            className="px-4 py-2 rounded-xl bg-[#8B2E1E] hover:bg-[#732619] text-white font-semibold text-xs whitespace-nowrap transition-colors shadow-xs"
          >
            {language === 'vi' ? 'Đăng nhập / Đăng ký' : 'Sign In / Sign Up'}
          </Link>
        </div>
      )}

      {/* Main Content Area */}
      {!hasItems ? (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white border border-gray-200/90 rounded-3xl shadow-xs space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8 stroke-[1.5]" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-gray-900">
              {t.passport.emptyTitle}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t.passport.emptySubtitle}
            </p>
          </div>

          <Link
            to="/unlock"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-bold text-sm shadow-md shadow-amber-900/10 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t.passport.scanNowCta}</span>
          </Link>
        </div>
      ) : (
        /* Passport Stamp Grid */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>{t.passport.title}</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                {items.length}
              </span>
            </h2>

            {/* QA Testing Reset Button (Only visible when Demo Mode is Active) */}
            {isDemoMode && (
              <button
                type="button"
                onClick={handleResetAllStamps}
                className="text-xs px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Thu hồi toàn bộ con dấu để test lại quy trình mở khóa"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-600" />
                <span>Đặt lại toàn bộ (Test)</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <PassportStampCard
                key={item.id}
                item={item}
                onRevoke={isDemoMode ? handleRevokeItem : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
