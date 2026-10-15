import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  UploadCloud,
  X,
  AlertCircle,
  Loader2,
  Sparkles,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react'
import { useAuth } from '../../features/authentication'
import { useTranslation } from '../../i18n'
import {
  createCommunityPost,
  fetchPublishedSitesForSelect,
  validatePostImage,
  type AttachedHeritageSite,
} from '../../features/community'

export function CreatePostPage() {
  const { user } = useAuth()
  const { t, language } = useTranslation()
  const navigate = useNavigate()

  const [body, setBody] = useState<string>('')
  const [selectedSiteId, setSelectedSiteId] = useState<string>('')
  const [availableSites, setAvailableSites] = useState<AttachedHeritageSite[]>([])

  // Image upload state
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Status & error handling
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Load published heritage sites for tag dropdown
  useEffect(() => {
    let ignore = false
    async function loadSites() {
      try {
        const sites = await fetchPublishedSitesForSelect()
        if (!ignore) {
          setAvailableSites(sites)
        }
      } catch (err) {
        console.warn('Failed to load sites for post tag:', err)
      }
    }
    loadSites()
    return () => {
      ignore = true
    }
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null)
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validatePostImage(file)
    if (!validation.valid) {
      if (validation.error === 'INVALID_FORMAT') {
        setErrorMessage(t.createPost.invalidFormat)
      } else if (validation.error === 'FILE_TOO_LARGE') {
        setErrorMessage(t.createPost.fileTooLarge)
      }
      setImageFile(null)
      setImagePreview(null)
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || isSubmitting) return

    const trimmed = body.trim()
    if (trimmed.length < 5) {
      setErrorMessage(t.createPost.minCharacters)
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await createCommunityPost({
        userId: user.id,
        body: trimmed,
        siteId: selectedSiteId || null,
        imageFile,
      })

      // Clean up object URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }

      // Redirect to community feed
      navigate('/community', { replace: true })
    } catch (err: unknown) {
      let msg = t.createPost.postError
      if (err instanceof Error) {
        if (err.message === 'MIN_CHARACTERS') {
          msg = t.createPost.minCharacters
        } else if (err.message === 'FILE_TOO_LARGE') {
          msg = t.createPost.fileTooLarge
        } else if (err.message === 'INVALID_FORMAT') {
          msg = t.createPost.invalidFormat
        } else {
          msg = err.message
        }
      }
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-8 space-y-6">
      {/* Back button & Page title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            {t.createPost.title}
          </h1>
          <p className="text-xs text-gray-500">
            {t.community.subtitle}
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 space-y-6 shadow-xs"
      >
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="space-y-1.5">
          <label htmlFor="post-body" className="block text-xs font-semibold text-gray-800">
            {t.createPost.contentLabel} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="post-body"
            rows={5}
            maxLength={2000}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isSubmitting}
            placeholder={t.createPost.contentPlaceholder}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700 resize-none disabled:bg-gray-50 leading-relaxed"
          />
          <div className="flex justify-between items-center text-[11px] text-gray-400">
            <span>{t.createPost.minCharacters}</span>
            <span>{body.length} / 2000</span>
          </div>
        </div>

        {/* Tag Heritage Site (Optional) */}
        <div className="space-y-1.5">
          <label htmlFor="post-site" className="block text-xs font-semibold text-gray-800 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-700" />
            <span>{t.createPost.selectSiteLabel}</span>
          </label>
          <select
            id="post-site"
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700 disabled:bg-gray-50"
          >
            <option value="">{t.createPost.selectSitePlaceholder}</option>
            {availableSites.map((site) => (
              <option key={site.id} value={site.id}>
                {language === 'vi' ? site.nameVi : site.nameEn}
              </option>
            ))}
          </select>
        </div>

        {/* Photo Attachment (Optional) */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-800 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
            <span>{t.createPost.photoLabel}</span>
          </label>

          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 aspect-video max-h-72 bg-gray-100 group">
              <img
                src={imagePreview}
                alt="Selected post preview"
                className="w-full h-full object-cover"
              />
              {!isSubmitting && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/75 hover:bg-black text-white transition-colors cursor-pointer shadow-md"
                  aria-label={t.common.delete}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="w-full rounded-2xl border-2 border-dashed border-gray-200 hover:border-amber-600 bg-gray-50/70 hover:bg-amber-50/40 p-5 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-gray-800">
                  {t.createPost.photoLabel}
                </p>
                <p className="text-[11px] text-gray-400">
                  {t.createPost.uploadHint}
                </p>
              </div>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            disabled={isSubmitting}
            className="hidden"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {t.common.cancel}
          </button>

          <button
            type="submit"
            disabled={isSubmitting || body.trim().length < 5}
            className="px-6 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.createPost.submitting}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t.createPost.submitButton}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
