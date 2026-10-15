import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  Camera,
  Plus,
  Trash2,
  Lock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ZoomIn,
} from 'lucide-react'
import { useTranslation } from '../../i18n'
import {
  fetchSiteMemories,
  deleteSiteMemory,
} from './memoryService'
import type { MemoryWithUrl } from './types'
import { UploadMemoryModal } from './UploadMemoryModal'
import { DeleteMemoryDialog } from './DeleteMemoryDialog'
import { MemoryLightbox } from './MemoryLightbox'

interface MemoriesSectionProps {
  siteId: string
  isUnlocked: boolean
  user: User | null
}

export function MemoriesSection({ siteId, isUnlocked, user }: MemoriesSectionProps) {
  const { t, language } = useTranslation()

  const [memories, setMemories] = useState<MemoryWithUrl[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false)
  const [memoryToDelete, setMemoryToDelete] = useState<MemoryWithUrl | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [lightboxMemory, setLightboxMemory] = useState<MemoryWithUrl | null>(null)

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToast({ type, text })
    const timer = setTimeout(() => {
      setToast(null)
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  // Load memories
  const loadMemories = useCallback(async () => {
    if (!user || !isUnlocked) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    try {
      const items = await fetchSiteMemories(siteId, user.id)
      setMemories(items)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.errors.generic
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [siteId, user, isUnlocked, t])

  useEffect(() => {
    let ignore = false
    async function init() {
      if (!user || !isUnlocked) {
        setIsLoading(false)
        return
      }

      try {
        const items = await fetchSiteMemories(siteId, user.id)
        if (!ignore) {
          setMemories(items)
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
  }, [siteId, user, isUnlocked, t])

  // Handle successful upload
  const handleUploadSuccess = (newMemory: MemoryWithUrl) => {
    setMemories((prev) => [newMemory, ...prev])
    showToast('success', t.memories.uploadSuccess)
  }

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!memoryToDelete || !user) return

    setIsDeleting(true)
    try {
      await deleteSiteMemory(memoryToDelete)
      setMemories((prev) => prev.filter((m) => m.id !== memoryToDelete.id))
      setMemoryToDelete(null)
      showToast('success', t.memories.deleteSuccess)
    } catch {
      showToast('error', t.memories.deleteError)
    } finally {
      setIsDeleting(false)
    }
  }

  // Case 1: Site is NOT unlocked or user is NOT logged in
  if (!user || !isUnlocked) {
    return (
      <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-gray-900">
              {t.heritageDetail.memoriesTitle}
            </h2>
            <p className="text-xs text-gray-500">
              {t.heritageDetail.memoriesSubtitle}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-2">
          <p className="text-xs sm:text-sm text-gray-600 font-medium">
            {user ? t.heritageDetail.isLocked : t.heritageDetail.loginToUnlock}
          </p>
          <p className="text-xs text-gray-400">
            {t.heritageDetail.unlockCta}
          </p>
        </div>
      </div>
    )
  }

  // Case 2: Unlocked - Full memories section with upload & gallery
  const canUpload = memories.length < 3

  return (
    <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs relative">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="space-y-0.5">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-800" />
            <span>{t.heritageDetail.memoriesTitle}</span>
          </h2>
          <p className="text-xs text-gray-500">
            {t.heritageDetail.memoriesSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Count Badge */}
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100/90 text-amber-900 border border-amber-200">
            {memories.length} / 3 {t.memories.photoCount}
          </span>

          {/* Add Photo Button */}
          {canUpload ? (
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.memories.uploadButton}</span>
            </button>
          ) : (
            <span className="text-[11px] text-amber-800 font-medium bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              {t.memories.maxReachedWarning}
            </span>
          )}
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={loadMemories}
            className="font-semibold underline hover:no-underline cursor-pointer"
          >
            {t.common.retry}
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
          <div className="aspect-square bg-gray-100 rounded-2xl" />
          <div className="aspect-square bg-gray-100 rounded-2xl" />
          <div className="aspect-square bg-gray-100 rounded-2xl" />
        </div>
      ) : memories.length === 0 ? (
        /* Empty State */
        <div className="py-10 text-center space-y-3 bg-gray-50/70 border border-dashed border-gray-200 rounded-2xl p-6">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <Camera className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-800">
              {t.memories.emptyNotice}
            </p>
            <p className="text-xs text-gray-400">
              {t.memories.fileSizeHint}
            </p>
          </div>
          {canUpload && (
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.memories.uploadButton}</span>
            </button>
          )}
        </div>
      ) : (
        /* Memories Grid */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className="group relative rounded-2xl border border-gray-200/90 overflow-hidden bg-white shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              {/* Image with overlay action */}
              <div
                className="aspect-square w-full bg-gray-100 overflow-hidden relative cursor-pointer"
                onClick={() => setLightboxMemory(mem)}
              >
                <img
                  src={mem.signedUrl}
                  alt={mem.caption || 'Memory photo'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Hover overlay with zoom icon */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-medium">
                  <ZoomIn className="w-5 h-5" />
                  <span>{t.memories.viewPhoto}</span>
                </div>
              </div>

              {/* Caption */}
              {mem.caption && (
                <div className="p-3 text-xs text-gray-700 italic border-t border-gray-100 line-clamp-2">
                  "{mem.caption}"
                </div>
              )}

              {/* Footer: Date & Delete Button */}
              <div className="p-2.5 mt-auto text-[11px] text-gray-400 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                  <span>
                    {new Date(mem.created_at).toLocaleDateString(
                      language === 'vi' ? 'vi-VN' : 'en-US'
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setMemoryToDelete(mem)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                  title={t.common.delete}
                  aria-label={t.common.delete}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <UploadMemoryModal
        siteId={siteId}
        userId={user.id}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteMemoryDialog
        memory={memoryToDelete}
        isOpen={!!memoryToDelete}
        isDeleting={isDeleting}
        onClose={() => setMemoryToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Lightbox Modal */}
      <MemoryLightbox
        memory={lightboxMemory}
        isOpen={!!lightboxMemory}
        onClose={() => setLightboxMemory(null)}
      />
    </div>
  )
}

