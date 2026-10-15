import { useState, useRef, type ChangeEvent } from 'react'
import { X, UploadCloud, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useTranslation } from '../../i18n'
import {
  validateMemoryFile,
  uploadSiteMemory,
} from './memoryService'
import type { MemoryWithUrl } from './types'

interface UploadMemoryModalProps {
  siteId: string
  userId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: (newMemory: MemoryWithUrl) => void
}

export function UploadMemoryModal({
  siteId,
  userId,
  isOpen,
  onClose,
  onSuccess,
}: UploadMemoryModalProps) {
  const { t } = useTranslation()

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [clientError, setClientError] = useState<string | null>(null)

  if (!isOpen) return null

  const resetForm = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setCaption('')
    setClientError(null)
    setIsSubmitting(false)
  }

  const handleClose = () => {
    if (isSubmitting) return
    resetForm()
    onClose()
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setClientError(null)
    const file = e.target.files?.[0]
    if (!file) return

    // JavaScript validation (format + size)
    const validation = validateMemoryFile(file)
    if (!validation.valid) {
      if (validation.errorCode === 'INVALID_FORMAT') {
        setClientError(t.memories.invalidFormat)
      } else if (validation.errorCode === 'FILE_TOO_LARGE') {
        setClientError(t.memories.fileTooLarge)
      } else {
        setClientError(t.memories.uploadError)
      }
      setSelectedFile(null)
      setPreviewUrl(null)
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!selectedFile || isSubmitting) return

    // Double check file validation
    const validation = validateMemoryFile(selectedFile)
    if (!validation.valid) {
      setClientError(
        validation.errorCode === 'FILE_TOO_LARGE'
          ? t.memories.fileTooLarge
          : t.memories.invalidFormat
      )
      return
    }

    setIsSubmitting(true)
    setClientError(null)

    try {
      const created = await uploadSiteMemory({
        file: selectedFile,
        caption: caption.trim() || undefined,
        siteId,
        userId,
      })

      resetForm()
      onSuccess(created)
      onClose()
    } catch (err: unknown) {
      let msg = t.memories.uploadError
      if (err instanceof Error) {
        if (err.message === 'MAX_MEMORIES_REACHED') {
          msg = t.memories.maxReachedWarning
        } else if (err.message === 'FILE_TOO_LARGE') {
          msg = t.memories.fileTooLarge
        } else if (err.message === 'INVALID_FORMAT') {
          msg = t.memories.invalidFormat
        }
      }
      setClientError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 id="upload-modal-title" className="font-bold text-gray-900 text-base flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-800" />
            <span>{t.memories.uploadModalTitle}</span>
          </h3>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
            aria-label={t.memories.cancel}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* File Picker / Preview Area */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              {t.memories.selectPhotoLabel}
            </label>

            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 aspect-video bg-gray-100 group">
                <img
                  src={previewUrl}
                  alt={t.memories.previewLabel}
                  className="w-full h-full object-cover"
                />
                {!isSubmitting && (
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click()
                    }}
                    className="absolute bottom-2 right-2 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black text-white text-xs font-medium backdrop-blur-xs transition-all cursor-pointer shadow-md"
                  >
                    {t.memories.changePhoto}
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-2xl border-2 border-dashed border-gray-300 hover:border-amber-600 bg-gray-50/70 hover:bg-amber-50/40 p-6 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-gray-800">
                    {t.memories.selectPhotoLabel}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    JPG, PNG, WebP (≤ 5MB)
                  </p>
                </div>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={isSubmitting}
              className="hidden"
            />
          </div>

          {/* Caption Input */}
          <div className="space-y-1.5">
            <label htmlFor="memory-caption" className="block text-xs font-semibold text-gray-700">
              {t.memories.captionLabel}
            </label>
            <textarea
              id="memory-caption"
              rows={3}
              maxLength={200}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={isSubmitting}
              placeholder={t.memories.captionPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700 resize-none disabled:bg-gray-100"
            />
            <div className="flex justify-end text-[10px] text-gray-400">
              <span>{caption.length} / 200</span>
            </div>
          </div>

          {/* Error Message */}
          {clientError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{clientError}</span>
            </div>
          )}

          {/* Rules hint */}
          <p className="text-[11px] text-gray-400 leading-relaxed">
            {t.memories.fileSizeHint}
          </p>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-100 disabled:opacity-50 cursor-pointer transition-colors"
          >
            {t.memories.cancel}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedFile || isSubmitting}
            className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t.memories.uploading}</span>
              </>
            ) : (
              <span>{t.memories.uploadButton}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
