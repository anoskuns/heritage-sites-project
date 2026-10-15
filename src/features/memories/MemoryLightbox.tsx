import { X, Calendar } from 'lucide-react'
import { useTranslation } from '../../i18n'
import type { MemoryWithUrl } from './types'

interface MemoryLightboxProps {
  memory: MemoryWithUrl | null
  isOpen: boolean
  onClose: () => void
}

export function MemoryLightbox({ memory, isOpen, onClose }: MemoryLightboxProps) {
  const { language } = useTranslation()

  if (!isOpen || !memory) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* High-res Image */}
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/40 max-h-[75vh] flex items-center justify-center">
          <img
            src={memory.signedUrl}
            alt={memory.caption || 'Memory photo'}
            className="max-h-[75vh] w-auto max-w-full object-contain"
          />
        </div>

        {/* Caption & Metadata Footer */}
        <div className="w-full mt-3 text-center space-y-1 px-4 text-white">
          {memory.caption && (
            <p className="text-sm sm:text-base font-medium leading-relaxed italic text-white/95">
              "{memory.caption}"
            </p>
          )}
          <p className="text-xs text-white/60 flex items-center justify-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {new Date(memory.created_at).toLocaleDateString(
                language === 'vi' ? 'vi-VN' : 'en-US',
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }
              )}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

