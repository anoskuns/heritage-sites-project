import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User as UserIcon,
  Mail,
  Key,
  Globe,
  Calendar,
  Camera,
  Check,
  Copy,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Save,
} from 'lucide-react'
import { useAuth } from '../../features/authentication'
import { useTranslation, type Language } from '../../i18n'
import { uploadAvatar, deleteAvatarFile, validateAvatarFile } from '../../services/storage'
import type { Profile } from '../../types/database.types'

interface ProfileFormProps {
  profile: Profile
  userEmail?: string
  userId: string
  onSaveSuccess: () => void
  onAvatarUploadSuccess: (newUrl: string) => void
  setFeedback: (msg: { error?: string; success?: string }) => void
}

function ProfileForm({
  profile,
  userEmail,
  userId,
  onSaveSuccess,
  onAvatarUploadSuccess,
  setFeedback,
}: ProfileFormProps) {
  const { updateProfile } = useAuth()
  const { t, language, setLanguage } = useTranslation()

  const [displayName, setDisplayName] = useState<string>(profile.display_name || '')
  const [preferredLanguage, setPreferredLanguage] = useState<Language>(
    profile.preferred_language || language
  )
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url)

  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false)
  const [copiedId, setCopiedId] = useState<boolean>(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(userId)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    } catch (err) {
      console.warn('Clipboard copy failed:', err)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFeedback({})

    const validation = validateAvatarFile(file)
    if (!validation.isValid) {
      const errKey = validation.errorKey || 'avatarFormatError'
      setFeedback({ error: t.profile[errKey] })
      return
    }

    setIsUploadingAvatar(true)
    const oldAvatarUrl = profile.avatar_url

    try {
      const uploadResult = await uploadAvatar(file, userId)

      if (!uploadResult.success || !uploadResult.url) {
        setFeedback({ error: uploadResult.error || t.profile.avatarUploadError })
        return
      }

      const newAvatarUrl = uploadResult.url

      const updateResult = await updateProfile({
        avatar_url: newAvatarUrl,
      })

      if (!updateResult.success) {
        await deleteAvatarFile(newAvatarUrl, userId)
        setFeedback({ error: updateResult.error || t.profile.avatarUploadError })
        return
      }

      setAvatarPreview(newAvatarUrl)
      onAvatarUploadSuccess(newAvatarUrl)
      setFeedback({ success: t.profile.avatarUploadSuccess })

      if (oldAvatarUrl && oldAvatarUrl !== newAvatarUrl) {
        await deleteAvatarFile(oldAvatarUrl, userId)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.profile.avatarUploadError
      setFeedback({ error: msg })
    } finally {
      setIsUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback({})

    const trimmedName = displayName.trim()
    if (!trimmedName) {
      setFeedback({ error: t.auth.displayNameLabel })
      return
    }

    setIsSaving(true)

    try {
      const result = await updateProfile({
        display_name: trimmedName,
        preferred_language: preferredLanguage,
      })

      if (!result.success) {
        setFeedback({ error: result.error || t.profile.updateError })
        return
      }

      if (preferredLanguage !== language) {
        await setLanguage(preferredLanguage)
      }

      onSaveSuccess()
      setFeedback({ success: t.profile.updateSuccess })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Avatar Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-gray-100">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-amber-100 border-2 border-amber-300/80 shadow-inner flex items-center justify-center text-amber-800">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={profile.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-12 h-12 stroke-[1.5]" />
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            disabled={isUploadingAvatar || isSaving}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar || isSaving}
            title={t.profile.changeAvatar}
            className="absolute bottom-0 right-0 p-2 rounded-full bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white shadow-md cursor-pointer disabled:opacity-60 transition-transform active:scale-95"
          >
            {isUploadingAvatar ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <h2 className="text-lg font-bold text-gray-900">
            {profile.display_name || t.common.appName}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">{userEmail}</p>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSaveProfile} className="space-y-5">
        {/* Read-only: Account ID */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-700">
            {t.profile.accountId}
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                type="text"
                readOnly
                disabled
                value={userId}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/80 text-xs sm:text-sm font-mono text-gray-500 cursor-not-allowed select-all"
              />
            </div>
            <button
              type="button"
              onClick={handleCopyId}
              className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {copiedId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">{t.profile.copiedId}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.profile.copyId}</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 italic">
            {t.profile.readOnlyNotice}
          </p>
        </div>

        {/* Read-only: Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-700">
            {t.profile.email}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              readOnly
              disabled
              value={userEmail || ''}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/80 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>
          <p className="text-[11px] text-gray-400 italic">
            {t.profile.readOnlyNotice}
          </p>
        </div>

        {/* Editable: Display Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="profileDisplayName"
            className="block text-xs font-semibold text-gray-700"
          >
            {t.profile.displayName}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <UserIcon className="w-4 h-4" />
            </div>
            <input
              id="profileDisplayName"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t.profile.displayNamePlaceholder}
              disabled={isSaving || isUploadingAvatar}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-colors disabled:bg-gray-50 disabled:opacity-70"
            />
          </div>
        </div>

        {/* Editable: Preferred Language */}
        <div className="space-y-1.5">
          <label
            htmlFor="preferredLanguage"
            className="block text-xs font-semibold text-gray-700"
          >
            {t.profile.languagePref}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Globe className="w-4 h-4" />
            </div>
            <select
              id="preferredLanguage"
              value={preferredLanguage}
              onChange={(e) =>
                setPreferredLanguage(e.target.value as Language)
              }
              disabled={isSaving || isUploadingAvatar}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-colors disabled:bg-gray-50 disabled:opacity-70 cursor-pointer"
            >
              <option value="vi">Tiếng Việt (Vietnamese)</option>
              <option value="en">English (Tiếng Anh)</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving || isUploadingAvatar}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-semibold text-sm shadow-md shadow-amber-900/10 flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>{t.profile.saving}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{t.profile.saveButton}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export function ProfilePage() {
  const { user, profile, signOut, isLoading } = useAuth()
  const { t, language } = useTranslation()
  const navigate = useNavigate()

  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    setErrorMessage(null)
    try {
      const result = await signOut()
      if (result.success) {
        navigate('/', { replace: true })
      } else {
        setErrorMessage(result.error || t.errors.generic)
        setIsLoggingOut(false)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.errors.generic
      setErrorMessage(msg)
      setIsLoggingOut(false)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="py-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-amber-200 border-t-amber-700 rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">
          {t.common.loading}
        </p>
      </div>
    )
  }

  const memberSinceDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(
        language === 'vi' ? 'vi-VN' : 'en-US',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      )
    : '—'

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          {t.profile.title}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t.profile.subtitle}</p>
      </div>

      {/* Feedback Alerts */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span className="flex-1">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <span className="flex-1">{successMessage}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white border border-gray-200/90 rounded-2xl shadow-sm p-6 sm:p-8 space-y-8">
        {profile ? (
          <ProfileForm
            key={profile.updated_at || profile.id}
            profile={profile}
            userId={user.id}
            userEmail={user.email}
            onSaveSuccess={() => {}}
            onAvatarUploadSuccess={() => {}}
            setFeedback={({ error, success }) => {
              setErrorMessage(error || null)
              setSuccessMessage(success || null)
            }}
          />
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">
            {t.common.loading}
          </div>
        )}

        <div className="text-xs text-gray-400 flex items-center gap-1 pt-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {t.profile.memberSince} {memberSinceDate}
          </span>
        </div>

        {/* Sign Out Section */}
        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 text-center sm:text-left">
            {t.common.appName}
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
          >
            {isLoggingOut ? (
              <>
                <div className="w-4 h-4 border-2 border-red-400 border-t-red-700 rounded-full animate-spin" />
                <span>{t.profile.loggingOut}</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>{t.profile.logoutButton}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
