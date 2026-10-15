import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Compass,
  CheckCircle2,
  Lock,
  Play,
  Pause,
  Volume2,
  BookOpen,
  BookMarked,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { useAuth } from '../../features/authentication'
import { useTranslation } from '../../i18n'
import {
  fetchHeritageDetail,
  type HeritageDetailData,
} from '../../features/heritage'
import { MemoriesSection } from '../../features/memories'

export function HeritageDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const { t, language } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const [detailData, setDetailData] = useState<HeritageDetailData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Audio Player State
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false)
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0)
  const [audioDuration, setAudioDuration] = useState<number>(0)

  const loadDetail = useCallback(async () => {
    if (!slug) return

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const data = await fetchHeritageDetail(slug, user?.id)
      if (!data) {
        setErrorMessage(t.common.notFound)
      } else {
        setDetailData(data)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.errors.generic
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [slug, user, t])

  useEffect(() => {
    let ignore = false

    async function init() {
      if (!slug) return
      try {
        const data = await fetchHeritageDetail(slug, user?.id)
        if (!ignore) {
          if (!data) {
            setErrorMessage(t.common.notFound)
          } else {
            setDetailData(data)
          }
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
  }, [slug, user, t])

  // Audio player handlers
  const handleTogglePlayAudio = () => {
    if (!audioRef.current) return
    if (isPlayingAudio) {
      audioRef.current.pause()
      setIsPlayingAudio(false)
    } else {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {})
    }
  }

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration)
    }
  }

  const formatAudioTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-6 animate-pulse">
        <div className="h-80 bg-gray-200 rounded-3xl" />
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded-md w-3/4" />
          <div className="h-4 bg-gray-200 rounded-md w-1/2" />
        </div>
        <div className="h-40 bg-gray-100 rounded-2xl" />
      </div>
    )
  }

  // Error / Not found state
  if (errorMessage || !detailData) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          {errorMessage || t.common.notFound}
        </h2>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
          >
            {t.heritageDetail.back}
          </button>
          <button
            type="button"
            onClick={loadDetail}
            className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.common.retry}</span>
          </button>
        </div>
      </div>
    )
  }

  const { site, collection, isUnlocked, unlockedAt } = detailData

  const siteName = language === 'vi' ? site.name_vi : site.name_en
  const siteStory = language === 'vi' ? site.story_vi : site.story_en
  const siteDesc =
    language === 'vi'
      ? site.description_vi || site.description_en
      : site.description_en || site.description_vi
  const collectionName =
    language === 'vi' ? collection?.nameVi : collection?.nameEn

  const unlockedDateFormatted = unlockedAt
    ? new Date(unlockedAt).toLocaleDateString(
        language === 'vi' ? 'vi-VN' : 'en-US',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      )
    : ''

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-8">
      {/* Top Navigation & Back link */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.heritageDetail.back}</span>
        </button>

        {collectionName && (
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 border border-amber-200">
            {collectionName}
          </span>
        )}
      </div>

      {/* Hero Cover Card */}
      <div className="relative h-64 sm:h-96 w-full rounded-3xl overflow-hidden bg-gray-900 shadow-lg">
        <img
          src={site.cover_image_url}
          alt={siteName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

        {/* Floating Unlock Badge on image */}
        <div className="absolute top-5 right-5">
          {isUnlocked ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600/90 text-white text-xs font-bold backdrop-blur-md shadow-lg border border-emerald-400/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{t.heritageDetail.isUnlocked}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-700/85 text-white text-xs font-bold backdrop-blur-md shadow-lg border border-amber-400/30">
              <Lock className="w-3.5 h-3.5 text-amber-200" />
              <span>{t.heritageDetail.isLocked}</span>
            </div>
          )}
        </div>

        {/* Title & Metadata inside Hero */}
        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {siteName}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-200">
            <span className="flex items-center gap-1 text-amber-300">
              <MapPin className="w-4 h-4" />
              <span>
                {Number(site.latitude).toFixed(4)}, {Number(site.longitude).toFixed(4)}
              </span>
            </span>

            <Link
              to="/map"
              className="underline underline-offset-2 hover:text-white transition-colors"
            >
              {t.nav.map}
            </Link>
          </div>
        </div>
      </div>

      {/* Unlock Status Action Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {isUnlocked ? (
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {t.heritageDetail.isUnlocked}
              </p>
              <p className="text-xs text-gray-500">
                {unlockedDateFormatted && `${t.passport.unlockedOn} ${unlockedDateFormatted}`}
              </p>
            </div>
          </div>
        ) : !user ? (
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {t.heritageDetail.unlockStatus}
              </p>
              <p className="text-xs text-gray-500">
                {t.heritageDetail.loginToUnlock}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {t.heritageDetail.isLocked}
              </p>
              <p className="text-xs text-gray-500">
                {t.qrUnlock.subtitle}
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div>
          {isUnlocked ? (
            <Link
              to="/passport"
              className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-xs"
            >
              <BookOpen className="w-4 h-4" />
              <span>{t.heritageDetail.viewInPassport}</span>
            </Link>
          ) : !user ? (
            <Link
              to={`/auth?redirectTo=${encodeURIComponent(location.pathname)}`}
              className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.auth.loginPrompt}</span>
            </Link>
          ) : (
            <Link
              to="/unlock"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-red-700 hover:from-amber-800 hover:to-red-800 text-white text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-md shadow-amber-900/10"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.heritageDetail.unlockCta}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Audio Guide Player (If audio_url exists) */}
      {site.audio_url && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-stone-900 to-amber-950 text-white space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">
                  {t.heritageDetail.audioGuide}
                </h3>
                <span className="text-[11px] text-amber-200/70">
                  {formatAudioTime(audioCurrentTime)} / {formatAudioTime(audioDuration)}
                </span>
              </div>
            </div>

            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={handleTogglePlayAudio}
              className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center cursor-pointer transition-transform active:scale-95 shadow-md"
            >
              {isPlayingAudio ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all"
              style={{
                width: `${audioDuration > 0 ? (audioCurrentTime / audioDuration) * 100 : 0}%`,
              }}
            />
          </div>

          <audio
            ref={audioRef}
            src={site.audio_url}
            onTimeUpdate={handleAudioTimeUpdate}
            onLoadedMetadata={handleAudioLoadedMetadata}
            onEnded={() => setIsPlayingAudio(false)}
            className="hidden"
          />
        </div>
      )}

      {/* Cultural Narrative & Overview */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        {siteDesc && (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-amber-950 text-sm font-medium leading-relaxed italic">
            "{siteDesc}"
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
            {t.heritageDetail.culturalStory}
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
            {siteStory}
          </p>
        </div>

        {/* References and Citation */}
        {site.source_reference && (
          <div className="pt-6 border-t border-gray-100 text-xs text-gray-500 space-y-1">
            <span className="font-semibold text-gray-700 block">
              {t.heritageDetail.sourceReference}:
            </span>
            <p className="leading-relaxed text-gray-600">
              {site.source_reference}
            </p>
          </div>
        )}
      </div>

      {/* Memories Section (FR-10) */}
      <MemoriesSection
        siteId={site.id}
        isUnlocked={isUnlocked}
        user={user}
      />
    </div>
  )
}
