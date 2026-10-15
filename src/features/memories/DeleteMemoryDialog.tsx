import { AlertTriangle, Loader2 } from 'lucide-react'
import { useTranslation } from '../../i18n'
import type { MemoryWithUrl } from './types'

interface DeleteMemoryDialogProps {
  memory: MemoryWithUrl | null
  isOpen: boolean
  isDeleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteMemoryDialog({
  memory,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteMemoryDialogProps) {
  const { t } = useTranslation()

  if (!isOpen || !memory) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
    >
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-center space-y-2">
          <h3 id="delete-dialog-title" className="font-bold text-gray-900 text-base">
            {t.memories.deleteModalTitle}
          </h3>
          <p id="delete-dialog-desc" className="text-xs text-gray-500 leading-relaxed">
            {t.memories.deleteModalText}
          </p>
        </div>

        {/* Thumbnail Preview */}
        {memory.signedUrl && (
          <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden border border-gray-200 shadow-xs">
            <img
              src={memory.signedUrl}
              alt="Memory preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-100 disabled:opacity-50 cursor-pointer transition-colors"
          >
            {t.memories.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:bg-gray-400"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t.common.loading}</span>
              </>
            ) : (
              <span>{t.memories.confirmDelete}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

