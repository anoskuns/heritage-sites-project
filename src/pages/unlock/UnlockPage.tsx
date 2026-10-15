import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import {
  QrCode,
  Camera,
  Keyboard,
  Compass,
  BookOpen,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import {
  previewQrToken,
  unlockHeritageSite,
  CameraScanner,
  DemoTokenPicker,
  type PreviewQrTokenSuccess,
} from '../../features/qr-unlock'
import { useAuth } from '../../features/authentication'
import { useTranslation } from '../../i18n'

export function UnlockPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t, language } = useTranslation()

  const urlToken = searchParams.get('token') || ''
  const [inputToken, setInputToken] = useState<string>(urlToken)
  const [activeTab, setActiveTab] = useState<'manual' | 'camera'>('manual')

  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false)
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false)

  const [previewData, setPreviewData] = useState<PreviewQrTokenSuccess | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [unlockSuccessInfo, setUnlockSuccessInfo] = useState<{
    newlyUnlocked: boolean
    siteId: string
  } | null>(null)

  const isUnlockingRef = useRef<boolean>(false)
  const lastCheckedTokenRef = useRef<string>('')

  // Execute preview for a given token
  const handlePreviewToken = useCallback(
    async (tokenToVerify: string) => {
      const trimmed = tokenToVerify.trim()
      if (!trimmed) {
        setErrorMessage(t.qrUnlock.invalidToken)
        setPreviewData(null)
        setUnlockSuccessInfo(null)
        return
      }

      setIsLoadingPreview(true)
      setErrorMessage(null)
      setUnlockSuccessInfo(null)
      lastCheckedTokenRef.current = trimmed

      try {
        const result = await previewQrToken(trimmed)

        if (!result.success) {
          setPreviewData(null)
          if (result.error_code === 'REVOKED_TOKEN') {
            setErrorMessage(t.qrUnlock.revokedToken)
          } else if (result.error_code === 'SITE_UNPUBLISHED') {
            setErrorMessage(t.qrUnlock.siteUnpublished)
          } else {
            setErrorMessage(t.qrUnlock.invalidToken)
          }
          return
        }

        setPreviewData(result)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t.errors.network
        setErrorMessage(msg)
        setPreviewData(null)
      } finally {
        setIsLoadingPreview(false)
      }
    },
    [t]
  )

  // Auto-preview when token query parameter exists in URL
  useEffect(() => {
    if (urlToken && urlToken !== lastCheckedTokenRef.current) {
      setInputToken(urlToken)
      handlePreviewToken(urlToken)
    }
  }, [urlToken, handlePreviewToken])

  // Select token from Demo Picker
  const handleSelectDemoToken = (selectedToken: string) => {
    setInputToken(selectedToken)
    setSearchParams({ token: selectedToken })
    handlePreviewToken(selectedToken)
  }

  // Handle camera detection
  const handleCameraScan = (scannedToken: string) => {
    setInputToken(scannedToken)
    setActiveTab('manual')
    setSearchParams({ token: scannedToken })
    handlePreviewToken(scannedToken)
  }

  // Handle manual submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputToken.trim()) return
    setSearchParams({ token: inputToken.trim() })
    handlePreviewToken(inputToken)
  }

  // Handle Unlock confirmation (RPC)
  const handleConfirmUnlock = async () => {
    if (!user) {
      // Redirect to auth with return destination
      const returnUrl = `/unlock?token=${encodeURIComponent(inputToken.trim())}`
      navigate(`/auth?redirectTo=${encodeURIComponent(returnUrl)}`)
      return
    }

    if (!inputToken.trim() || isUnlockingRef.current) return

    isUnlockingRef.current = true
    setIsUnlocking(true)
    setErrorMessage(null)

    try {
      const result = await unlockHeritageSite(inputToken.trim())

      if (!result.success) {
        if (result.error_code === 'REVOKED_TOKEN') {
          setErrorMessage(t.qrUnlock.revokedToken)
        } else if (result.error_code === 'UNAUTHORIZED') {
          setErrorMessage(t.errors.unauthorized)
        } else if (result.error_code === 'SITE_UNPUBLISHED') {
          setErrorMessage(t.qrUnlock.siteUnpublished)
        } else {
          setErrorMessage(t.qrUnlock.invalidToken)
        }
        return
      }

      setUnlockSuccessInfo({
        newlyUnlocked: result.newly_unlocked,
        siteId: result.site_id,
      })

      // Update preview is_unlocked state
      if (previewData) {
        setPreviewData({
          ...previewData,
          is_unlocked: true,
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.errors.generic
      setErrorMessage(msg)
    } finally {
      setIsUnlocking(false)
      isUnlockingRef.current = false
    }
  }

  const site = previewData?.site
  const siteName = site
    ? language === 'vi'
      ? site.name_vi
      : site.name_en
    : ''
  const siteStory = site
    ? language === 'vi'
      ? site.story_vi
      : site.story_en
    : ''

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Page Title */}
      <div className="text-center sm:text-left space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
          <QrCode className="w-3.5 h-3.5" />
          <span>{t.common.appName}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          {t.qrUnlock.title}
        </h1>
        <p className="text-sm text-gray-500">{t.qrUnlock.subtitle}</p>
      </div>

      {/* Demo Test Tokens Section */}
      <DemoTokenPicker
        activeToken={inputToken}
        onSelectToken={handleSelectDemoToken}
      />

      {/* Input Mode Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>{t.qrUnlock.manualTab}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{t.qrUnlock.scannerTab}</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 sm:p-6">
          {activeTab === 'camera' ? (
            <CameraScanner
              onScan={handleCameraScan}
              onFallbackToManual={() => setActiveTab('manual')}
            />
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <label
                htmlFor="tokenInput"
                className="block text-xs font-semibold text-gray-700"
              >
                {t.qrUnlock.tokenLabel}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="tokenInput"
                  type="text"
                  required
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  placeholder={t.qrUnlock.inputPlaceholder}
                  disabled={isLoadingPreview || isUnlocking}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-mono text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-colors disabled:bg-gray-50"
                />
                <button
                  type="submit"
                  disabled={isLoadingPreview || isUnlocking || !inputToken.trim()}
                  className="py-2.5 px-5 rounded-xl bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-semibold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoadingPreview ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t.qrUnlock.checking}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{t.qrUnlock.previewButton}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Error Feedback */}
      {errorMessage && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">{t.common.error}</p>
            <p className="text-xs text-red-700 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Unlock Success Banner */}
      {unlockSuccessInfo && (
        <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-4 animate-fadeIn shadow-xs">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-base text-emerald-950">
                {unlockSuccessInfo.newlyUnlocked
                  ? t.qrUnlock.newlyUnlockedSuccess
                  : t.qrUnlock.alreadyUnlockedNotice}
              </h3>
              <p className="text-xs text-emerald-700">
                {language === 'vi'
                  ? 'Con dấu di sản đã được bảo lưu an toàn trong Hộ chiếu số của bạn.'
                  : 'The heritage stamp has been securely preserved in your digital passport.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/passport"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.qrUnlock.viewPassport}</span>
            </Link>
            {site && (
              <Link
                to={`/heritage/${site.slug}`}
                className="px-4 py-2 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-900 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>{t.qrUnlock.viewSite}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Heritage Preview Card */}
      {site && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden space-y-0 animate-fadeIn">
          {/* Cover image header */}
          <div className="relative h-48 sm:h-64 w-full bg-gray-100">
            <img
              src={site.cover_image_url}
              alt={siteName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Status Badge overlay */}
            <div className="absolute top-4 right-4">
              {previewData.is_unlocked ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/90 text-white text-xs font-bold backdrop-blur-xs shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.qrUnlock.alreadyUnlockedBadge}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-600/90 text-white text-xs font-bold backdrop-blur-xs shadow-md">
                  <Compass className="w-3.5 h-3.5" />
                  <span>{language === 'vi' ? 'Khám phá di sản' : 'Heritage Preview'}</span>
                </span>
              )}
            </div>

            {/* Site Name and Location info */}
            <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                {siteName}
              </h2>
              <div className="flex items-center gap-3 text-xs text-gray-200">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {Number(site.latitude).toFixed(4)}, {Number(site.longitude).toFixed(4)}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Site Story Excerpt */}
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                {t.heritageDetail.culturalStory}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                {siteStory}
              </p>
              <Link
                to={`/heritage/${site.slug}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors pt-1"
              >
                <span>{t.qrUnlock.viewSite}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Unlock Action Button Area */}
            <div className="pt-4 border-t border-gray-100">
              {!user ? (
                /* Unauthenticated View: CTA to login */
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-3">
                  <p className="text-xs sm:text-sm text-amber-900 font-medium">
                    {t.qrUnlock.loginRequiredToUnlock}
                  </p>
                  <button
                    type="button"
                    onClick={handleConfirmUnlock}
                    className="w-full py-3 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-bold text-sm shadow-md shadow-amber-900/10 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{t.qrUnlock.loginAndUnlock}</span>
                  </button>
                </div>
              ) : previewData.is_unlocked ? (
                /* Already Unlocked View */
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    to="/passport"
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm shadow-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{t.qrUnlock.viewPassport}</span>
                  </Link>
                  <Link
                    to={`/heritage/${site.slug}`}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>{t.qrUnlock.viewSite}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                /* Authenticated & Ready to Unlock */
                <button
                  type="button"
                  onClick={handleConfirmUnlock}
                  disabled={isUnlocking}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-700 to-red-700 hover:from-amber-800 hover:to-red-800 active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isUnlocking ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>{t.qrUnlock.unlocking}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-amber-300" />
                      <span>{t.qrUnlock.unlockButton}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

