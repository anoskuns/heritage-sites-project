import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
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
  Lock,
  Map as MapIcon,
  RotateCcw,
  X,
  Clipboard,
} from 'lucide-react'
import {
  previewQrToken,
  unlockHeritageSite,
  revokeHeritageSiteUnlock,
  extractTokenFromQrString,
  CameraScanner,
  DemoTokenPicker,
  UnlockConfirmationModal,
  type PreviewQrTokenSuccess,
} from '../../features/qr-unlock'
import { useAuth } from '../../features/authentication'
import { useTranslation } from '../../i18n'
import { useDemoMode } from '../../services/demoModeService'
import { ChimLac } from '../../components/decorative/DongSonMotifs'

function getMapAreaForSiteSlug(slug: string): { area: string; region: string } {
  if (slug === 'hoang-thanh-thang-long') return { area: 'ha-noi', region: 'bac' }
  if (slug === 'vinh-ha-long') return { area: 'quang-ninh', region: 'bac' }
  if (slug === 'pho-co-hoi-an') return { area: 'quang-nam', region: 'trung' }
  if (slug === 'dai-noi-hue') return { area: 'thua-thien-hue', region: 'trung' }
  return { area: 'tp-ho-chi-minh', region: 'nam' }
}

export function UnlockPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { t, language } = useTranslation()
  const { isDemoMode, toggleDemoMode } = useDemoMode()

  const urlToken = searchParams.get('token') || ''
  const [inputToken, setInputToken] = useState<string>(urlToken)
  const [activeTab, setActiveTab] = useState<'manual' | 'camera'>(urlToken ? 'manual' : 'camera')

  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false)
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false)
  const [isRevoking, setIsRevoking] = useState<boolean>(false)

  const [previewData, setPreviewData] = useState<PreviewQrTokenSuccess | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [unlockSuccessInfo, setUnlockSuccessInfo] = useState<{
    newlyUnlocked: boolean
    siteId: string
  } | null>(null)

  // State for Confirmation Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false)

  const isPreviewingRef = useRef<boolean>(false)
  const lastPreviewedTokenRef = useRef<string>('')

  // 1. Preview Handler (Validates token and displays site card WITHOUT automatically unlocking)
  const handlePreviewToken = useCallback(
    async (tokenToVerify: string) => {
      const extracted = extractTokenFromQrString(tokenToVerify) || tokenToVerify.trim()
      if (!extracted) {
        setErrorMessage(t.qrUnlock.invalidToken)
        setPreviewData(null)
        setUnlockSuccessInfo(null)
        return
      }

      if (isPreviewingRef.current && lastPreviewedTokenRef.current === extracted) {
        return
      }

      isPreviewingRef.current = true
      setIsLoadingPreview(true)
      setErrorMessage(null)
      setUnlockSuccessInfo(null)
      lastPreviewedTokenRef.current = extracted

      try {
        const previewResult = await previewQrToken(extracted)

        if (!previewResult.success) {
          setPreviewData(null)
          if (previewResult.error_code === 'REVOKED_TOKEN') {
            setErrorMessage(t.qrUnlock.revokedToken)
          } else if (previewResult.error_code === 'SITE_UNPUBLISHED') {
            setErrorMessage(t.qrUnlock.siteUnpublished)
          } else {
            setErrorMessage(t.qrUnlock.invalidToken)
          }
          return
        }

        setPreviewData(previewResult)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t.errors.generic
        setErrorMessage(msg)
        setPreviewData(null)
      } finally {
        setIsLoadingPreview(false)
        isPreviewingRef.current = false
      }
    },
    [t]
  )

  // Auto-preview when token query parameter exists in URL
  useEffect(() => {
    if (urlToken && urlToken !== lastPreviewedTokenRef.current) {
      const extracted = extractTokenFromQrString(urlToken) || urlToken.trim()
      setInputToken(extracted)
      handlePreviewToken(extracted)
    }
  }, [urlToken, handlePreviewToken])

  // Select token from Demo Picker -> Previews the site card
  const handleSelectDemoToken = (selectedToken: string) => {
    const extracted = extractTokenFromQrString(selectedToken) || selectedToken.trim()
    setInputToken(extracted)
    setSearchParams({ token: extracted })
    handlePreviewToken(extracted)
  }

  // Handle camera detection -> Previews the site card
  const handleCameraScan = (scannedToken: string) => {
    const extracted = extractTokenFromQrString(scannedToken) || scannedToken.trim()
    setInputToken(extracted)
    setActiveTab('manual')
    setSearchParams({ token: extracted })
    handlePreviewToken(extracted)
  }

  // Handle manual submit -> Previews the site card
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const extracted = extractTokenFromQrString(inputToken) || inputToken.trim()
    if (!extracted) return
    setInputToken(extracted)
    setSearchParams({ token: extracted })
    handlePreviewToken(extracted)
  }

  // Handle clipboard paste
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        const extracted = extractTokenFromQrString(text) || text.trim()
        setInputToken(extracted)
        setSearchParams({ token: extracted })
        handlePreviewToken(extracted)
      }
    } catch {
      // Ignore clipboard permission restrictions
    }
  }

  // Handle clear input
  const handleClearInput = () => {
    setInputToken('')
    setErrorMessage(null)
    setPreviewData(null)
    setUnlockSuccessInfo(null)
    setSearchParams({})
    lastPreviewedTokenRef.current = ''
  }

  // 2. Open confirmation modal (Requires user to be logged in)
  const handleOpenConfirmModal = () => {
    if (!user) {
      const returnUrl = `/unlock?token=${encodeURIComponent(inputToken.trim())}`
      navigate(`/auth?redirectTo=${encodeURIComponent(returnUrl)}`)
      return
    }
    setIsConfirmModalOpen(true)
  }

  // 3. Confirm and Execute Unlock (Called only when user clicks Confirm in modal)
  const handleExecuteUnlock = async () => {
    if (!user) return
    if (!inputToken.trim() || !previewData?.site) return

    setIsUnlocking(true)
    setErrorMessage(null)

    try {
      const result = await unlockHeritageSite(inputToken.trim(), previewData.site)

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
        setIsConfirmModalOpen(false)
        return
      }

      // Close modal and set success state
      setIsConfirmModalOpen(false)
      setUnlockSuccessInfo({
        newlyUnlocked: result.newly_unlocked,
        siteId: result.site_id,
      })

      // Update preview state to unlocked
      setPreviewData({
        ...previewData,
        is_unlocked: true,
      })

      // Dispatch global event for immediate real-time map data sync
      window.dispatchEvent(
        new CustomEvent('heritage_site_unlocked', {
          detail: { siteId: result.site_id },
        })
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.errors.generic
      setErrorMessage(msg)
      setIsConfirmModalOpen(false)
    } finally {
      setIsUnlocking(false)
    }
  }

  // 4. Revoke unlocked stamp for QA testing
  const handleRevokeSite = async () => {
    if (!previewData?.site) return
    const name = language === 'vi' ? previewData.site.name_vi : previewData.site.name_en
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn thu hồi con dấu "${name}" không?\n\nThao tác này dùng để kiểm thử lại luồng quét mã và mở khóa con dấu.`
    )
    if (!confirmed) return

    setIsRevoking(true)
    try {
      await revokeHeritageSiteUnlock(previewData.site.id, name, user?.id)
      setPreviewData((prev) => (prev ? { ...prev, is_unlocked: false } : null))
      setUnlockSuccessInfo(null)
    } catch (err: unknown) {
      console.error('Revoke failed:', err)
    } finally {
      setIsRevoking(false)
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

  const userDisplayName =
    profile?.display_name || user?.email || (language === 'vi' ? 'Người dùng' : 'User')

  const targetMapInfo = site ? getMapAreaForSiteSlug(site.slug) : null

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Page Title */}
      <div className="text-center sm:text-left space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8DECB]/60 text-[#8B2E1E] text-xs font-semibold border border-[#D6AD60]/40">
          <QrCode className="w-3.5 h-3.5" />
          <span>Quét mã di sản</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#2D2723] tracking-tight">
          Quét mã mở khóa di sản
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6E60]">
          Quét mã QR trên huy hiệu kỷ niệm hoặc nhập mã xác thực để thu thập con dấu độc bản vào Hộ chiếu số
        </p>
      </div>

      {/* Guest Notice (If not logged in, clearly prompt authentication) */}
      {!user && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#FAF4E8] via-[#F7F0E2] to-[#FAF6EE] border-2 border-[#D6AD60] shadow-md space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8B2E1E] to-[#6A1E14] text-[#F4E1BA] flex items-center justify-center shrink-0 shadow-sm border border-[#D6AD60]/60">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif font-bold text-base text-[#2D2723]">
                Yêu cầu đăng nhập để mở khóa con dấu
              </h2>
              <p className="text-xs text-[#5D5246] leading-relaxed">
                Để bảo đảm tính xác thực và quyền sở hữu vĩnh viễn của từng con dấu di sản, bạn cần đăng nhập tài khoản trước khi thực hiện mở khóa và đóng dấu vào Hộ chiếu số.
              </p>
            </div>
          </div>

          <div className="pt-1 flex flex-wrap gap-2.5">
            <Link
              to={`/auth?redirectTo=${encodeURIComponent(urlToken ? `/unlock?token=${urlToken}` : '/unlock')}`}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#8B2E1E] to-[#6A1E14] hover:from-[#732619] hover:to-[#571910] text-[#F7F0E2] font-serif font-bold text-xs sm:text-sm border border-[#D6AD60] shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#F4E1BA]" />
              <span>Đăng nhập ngay</span>
            </Link>
            <Link
              to={`/auth?mode=signup&redirectTo=${encodeURIComponent(urlToken ? `/unlock?token=${urlToken}` : '/unlock')}`}
              className="py-2.5 px-4 rounded-xl border border-[#D6AD60]/60 bg-white hover:bg-[#FAF6EE] text-[#5D5246] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Đăng ký tài khoản mới
            </Link>
          </div>
        </div>
      )}

      {/* Demo Test Tokens Section (Only visible when Demo/QA Mode is activated) */}
      {isDemoMode && (
        <div className="space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Chế độ Demo / Kiểm thử đang BẬT</span>
            </span>
            <button
              type="button"
              onClick={toggleDemoMode}
              className="text-[11px] font-semibold text-amber-700 hover:text-red-700 underline cursor-pointer"
            >
              Ẩn danh sách mã mẫu
            </button>
          </div>
          <DemoTokenPicker
            activeToken={inputToken}
            onSelectToken={handleSelectDemoToken}
          />
        </div>
      )}

      {/* Input Mode Card */}
      <div className="bg-[#FAF6EE] border-2 border-[#E8DECB] rounded-3xl shadow-sm overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-[#E8DECB] bg-[#F7F0E2]/80 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-serif font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-gradient-to-b from-[#FAF4E8] via-[#F4E8D3] to-[#EBD5B3] text-[#8B2E1E] shadow-sm border border-[#8B2E1E]/40'
                : 'text-[#7A6E60] hover:text-[#8B2E1E] hover:bg-white/40'
            }`}
          >
            <Camera className="w-4 h-4 text-[#8B2E1E]" />
            <span>{t.qrUnlock.scannerTab}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-serif font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-gradient-to-b from-[#FAF4E8] via-[#F4E8D3] to-[#EBD5B3] text-[#8B2E1E] shadow-sm border border-[#8B2E1E]/40'
                : 'text-[#7A6E60] hover:text-[#8B2E1E] hover:bg-white/40'
            }`}
          >
            <Keyboard className="w-4 h-4 text-[#8B2E1E]" />
            <span>{t.qrUnlock.manualTab}</span>
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
              <div className="flex items-center justify-between">
                <label
                  htmlFor="tokenInput"
                  className="block text-xs font-bold text-[#5D5246]"
                >
                  {t.qrUnlock.tokenLabel}
                </label>
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B2E1E] hover:text-[#6A1E14] hover:underline cursor-pointer"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Dán từ bộ nhớ tạm</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    id="tokenInput"
                    type="text"
                    required
                    value={inputToken}
                    onChange={(e) => {
                      setInputToken(e.target.value)
                      if (errorMessage) setErrorMessage(null)
                    }}
                    placeholder={t.qrUnlock.inputPlaceholder}
                    disabled={isLoadingPreview || isUnlocking}
                    className="w-full pl-4 pr-10 py-2.5 sm:py-3 rounded-xl border border-[#D6AD60]/50 bg-white text-sm font-mono text-[#2D2723] focus:outline-hidden focus:ring-2 focus:ring-[#8B2E1E] focus:border-[#8B2E1E] transition-colors disabled:bg-gray-50 uppercase placeholder:normal-case placeholder:font-sans"
                  />
                  {inputToken && !isLoadingPreview && !isUnlocking && (
                    <button
                      type="button"
                      onClick={handleClearInput}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Xóa mã"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoadingPreview || isUnlocking || !inputToken.trim()}
                  className="py-2.5 sm:py-3 px-6 rounded-xl bg-gradient-to-r from-[#8B2E1E] to-[#6A1E14] hover:from-[#732619] hover:to-[#571910] text-[#F7F0E2] font-serif font-bold text-xs sm:text-sm border border-[#D6AD60] shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isLoadingPreview ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#F4E1BA]" />
                      <span>{t.qrUnlock.checking}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#F4E1BA]" />
                      <span>{t.qrUnlock.previewButton}</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-[#7A6E60] leading-relaxed">
                Gợi ý: Bạn có thể nhập trực tiếp mã di sản hoặc dán toàn bộ đường link quét được từ mã QR.
              </p>
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

      {/* Unlock Success Celebratory Banner with Direct Map Navigation */}
      {unlockSuccessInfo && site && (
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-50 via-[#FAF6EE] to-amber-50 border-2 border-emerald-300 text-emerald-950 space-y-5 animate-fadeIn shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                <Sparkles className="w-3 h-3" />
                <span>Mở khóa thành công độc bản</span>
              </div>
              <h3 className="font-serif font-black text-lg sm:text-xl text-emerald-950">
                {unlockSuccessInfo.newlyUnlocked
                  ? 'Chúc mừng bạn đã mở khóa di sản thành công!'
                  : 'Địa điểm này đã được mở khóa trước đó trong Hộ chiếu'}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                Con dấu di sản <strong>{siteName}</strong> đã được đóng vĩnh viễn vào Hộ chiếu số của tài khoản <strong>{userDisplayName}</strong>. Dữ liệu đã đồng bộ tự động lên Bản đồ di sản!
              </p>
            </div>
          </div>

          {/* Action Buttons: Prominent Map Navigation */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-emerald-200/80">
            {targetMapInfo && (
              <Link
                to={`/map?region=${targetMapInfo.region}&area=${targetMapInfo.area}&highlightSite=${site.id}&unlocked=true`}
                className="py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-serif font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <MapIcon className="w-4 h-4 text-emerald-200" />
                <span>Xem vị trí vừa mở khóa trên Bản đồ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              to="/passport"
              className="py-3 px-4 rounded-xl border border-emerald-400 bg-white hover:bg-emerald-50 text-emerald-950 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>Xem trang Hộ chiếu</span>
            </Link>

            <Link
              to={`/heritage/${site.slug}`}
              className="py-3 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-2xs ml-auto"
            >
              <span>Xem chi tiết di tích</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
            </Link>

            {/* Revoke / Test button on success banner (Only in Demo Mode) */}
            {isDemoMode && (
              <button
                type="button"
                onClick={handleRevokeSite}
                disabled={isRevoking}
                className="py-3 px-4 rounded-xl border border-red-300 bg-white hover:bg-red-50 text-red-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                title="Thu hồi con dấu để kiểm thử lại"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-red-600 ${isRevoking ? 'animate-spin' : ''}`} />
                <span>Thu hồi (Test lại)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Heritage Preview Card */}
      {site && (
        <div className="bg-white border border-[#E8DECB] rounded-3xl shadow-md overflow-hidden space-y-0 animate-fadeIn">
          {/* Cover image header */}
          <div className="relative h-48 sm:h-64 w-full bg-gray-100">
            <img
              src={site.cover_image_url}
              alt={siteName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Serial Code Badge Overlay */}
            {previewData.serial_code && (
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-xs text-[#F4E1BA] text-[11px] font-mono font-bold shadow-md border border-[#D6AD60]/60">
                  <Sparkles className="w-3 h-3 text-[#D6AD60]" />
                  <span>Bản độc bản #{previewData.serial_code}</span>
                </span>
              </div>
            )}

            {/* Status Badge overlay */}
            <div className="absolute top-4 right-4">
              {previewData.is_unlocked ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600/95 text-white text-xs font-bold backdrop-blur-xs shadow-md border border-emerald-300/40">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{t.qrUnlock.alreadyUnlockedBadge}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8B2E1E]/95 text-white text-xs font-bold backdrop-blur-xs shadow-md border border-[#D6AD60]/60">
                  <Compass className="w-3.5 h-3.5 text-[#F4E1BA]" />
                  <span>{language === 'vi' ? 'Xem trước di sản' : 'Heritage Preview'}</span>
                </span>
              )}
            </div>

            {/* Site Name and Location info */}
            <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
              <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight leading-tight drop-shadow-md">
                {siteName}
              </h2>
              <div className="flex items-center gap-3 text-xs text-gray-200">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D6AD60]" />
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
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B2E1E] flex items-center gap-1.5">
                  <ChimLac className="w-3.5 h-3.5 text-[#8B2E1E]" />
                  <span>{t.heritageDetail.culturalStory}</span>
                </h3>
                <Link
                  to={`/heritage/${site.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#8B2E1E] hover:text-[#6A1E14] transition-colors"
                >
                  <span>{t.qrUnlock.viewSite}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
              <p className="text-sm text-[#4A3B32] leading-relaxed line-clamp-4">
                {siteStory}
              </p>
            </div>

            {/* Unlock CTA Section (Explicit Button - Not auto triggered) */}
            <div className="pt-4 border-t border-[#E8DECB]/80">
              {previewData.claimed_by_other ? (
                /* Single-Claim Warning: Already Claimed by Another User */
                <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-900 space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <h4 className="font-serif font-bold text-sm text-red-950">
                      Mã Sản Phẩm Độc Bản Đã Có Chủ Sở Hữu
                    </h4>
                  </div>
                  <p className="text-xs leading-relaxed text-red-800">
                    Mã sản phẩm lưu niệm vật lý này ({previewData.serial_code ? `Bản #${previewData.serial_code}` : 'mã độc bản'}) đã được kích hoạt trước đó bởi tài khoản khác. Mỗi sản phẩm lưu niệm vật lý chỉ cấp quyền mở khóa con dấu số cho duy nhất một người mua đầu tiên.
                  </p>
                </div>
              ) : !user ? (
                /* Unauthenticated View: CTA to login */
                <div className="p-4 rounded-2xl bg-[#FAF4E8] border border-[#D6AD60]/60 text-center space-y-3">
                  <p className="text-xs sm:text-sm text-[#5D5246] font-medium">
                    Bạn cần đăng nhập để mở khóa con dấu này vào Hộ chiếu số
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenConfirmModal}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#8B2E1E] to-[#6A1E14] hover:from-[#732619] hover:to-[#571910] text-[#F7F0E2] font-serif font-bold text-sm shadow-md border border-[#D6AD60] flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <LogIn className="w-4 h-4 text-[#F4E1BA]" />
                    <span>Đăng nhập để mở khóa</span>
                  </button>
                </div>
              ) : previewData.is_unlocked ? (
                /* Already Unlocked View */
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {targetMapInfo && (
                      <Link
                        to={`/map?region=${targetMapInfo.region}&area=${targetMapInfo.area}&highlightSite=${site.id}&unlocked=true`}
                        className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-serif font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <MapIcon className="w-4 h-4 text-emerald-200" />
                        <span>Xem trên Bản đồ</span>
                      </Link>
                    )}
                    <Link
                      to="/passport"
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-[#D6AD60] bg-white hover:bg-[#FAF6EE] text-[#5D5246] font-semibold text-sm shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-[#8B2E1E]" />
                      <span>{t.qrUnlock.viewPassport}</span>
                    </Link>
                  </div>

                  {/* Revoke / QA Reset Button (Only in Demo Mode) */}
                  {isDemoMode && (
                    <button
                      type="button"
                      onClick={handleRevokeSite}
                      disabled={isRevoking}
                      className="w-full py-2.5 px-4 rounded-xl border border-red-300 bg-red-50/80 hover:bg-red-100 text-red-800 font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                      title="Thu hồi con dấu để kiểm thử lại luồng mở khóa"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 text-red-600 ${isRevoking ? 'animate-spin' : ''}`} />
                      <span>Thu hồi / Hủy con dấu này (Chế độ kiểm thử)</span>
                    </button>
                  )}
                </div>
              ) : (
                /* Authenticated & Ready to Unlock: Opens Confirmation Modal */
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleOpenConfirmModal}
                    disabled={isUnlocking}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#8B2E1E] via-[#A33824] to-[#6A1E14] hover:from-[#732619] hover:to-[#571910] active:scale-[0.99] text-[#F7F0E2] font-serif font-bold text-sm sm:text-base border border-[#D6AD60] shadow-lg shadow-[#8B2E1E]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                  >
                    <Sparkles className="w-5 h-5 text-[#F4E1BA]" />
                    <span>Mở khóa con dấu di sản</span>
                  </button>
                  <p className="text-[11px] text-center text-[#7A6E60]">
                    Bấm để kiểm tra thông tin và xác nhận quyền sở hữu con dấu
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Ensures user verifies ownership before permanent unlock */}
      <UnlockConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleExecuteUnlock}
        isUnlocking={isUnlocking}
        previewData={previewData}
        userDisplayName={userDisplayName}
      />
    </div>
  )
}
