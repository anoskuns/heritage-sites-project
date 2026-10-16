import {
  ShieldCheck,
  MapPin,
  Sparkles,
  RefreshCw,
  X,
  AlertTriangle,
  UserCheck,
} from 'lucide-react'
import { DongSonSun, ChimLac } from '../../components/decorative/DongSonMotifs'
import type { PreviewQrTokenSuccess } from './types'

interface UnlockConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isUnlocking: boolean
  previewData: PreviewQrTokenSuccess | null
  userDisplayName: string
}

export function UnlockConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isUnlocking,
  previewData,
  userDisplayName,
}: UnlockConfirmationModalProps) {
  if (!isOpen || !previewData) return null

  const site = previewData.site

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fadeIn"
    >
      <div className="relative w-full max-w-lg bg-[#FAF6EE] border-2 border-[#D6AD60] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden p-6 sm:p-7 space-y-6">
        {/* Subtle decorative background motifs */}
        <div className="absolute -top-8 -right-8 w-32 h-32 text-[#D6AD60]/10 pointer-events-none">
          <DongSonSun className="w-full h-full" />
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isUnlocking}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#E8DECB]/60 hover:bg-[#E8DECB] text-[#7A6E60] hover:text-[#2D2723] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B2E1E] to-[#6A1E14] text-[#D6AD60] border border-[#D6AD60]/60 flex items-center justify-center shadow-md shrink-0">
            <ShieldCheck className="w-6 h-6 text-[#F4E1BA]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8B2E1E] tracking-wider uppercase">
              <ChimLac className="w-3.5 h-3.5 text-[#8B2E1E]" />
              <span>Xác thực quyền sở hữu độc bản</span>
            </div>
            <h2
              id="confirm-modal-title"
              className="text-xl font-serif font-black text-[#2D2723] tracking-tight"
            >
              Xác nhận mở khóa
            </h2>
          </div>
        </div>

        {/* Site Details Card */}
        <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white border border-[#E8DECB] shadow-xs">
          <img
            src={site.cover_image_url}
            alt={site.name_vi}
            className="w-20 h-20 rounded-xl object-cover border border-[#E8DECB] shrink-0"
          />
          <div className="space-y-1 min-w-0">
            <h3 className="font-serif font-bold text-base text-[#2D2723] truncate">
              {site.name_vi}
            </h3>
            <p className="text-xs text-[#7A6E60] italic truncate">
              {site.name_en}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-[#8C7A68]">
              <MapPin className="w-3.5 h-3.5 text-[#8B2E1E] shrink-0" />
              <span>
                {Number(site.latitude).toFixed(4)}, {Number(site.longitude).toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        {/* Ownership Guarantee Notice Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#F7F0E2] to-[#FAF4E8] border border-[#D6AD60]/60 space-y-2 text-xs leading-relaxed text-[#4A3B32]">
          <div className="flex items-center gap-2 font-bold text-[#8B2E1E]">
            <UserCheck className="w-4 h-4 text-[#8B2E1E] shrink-0" />
            <span>Tài khoản sở hữu: {userDisplayName}</span>
          </div>
          <p className="text-[#5D5246]">
            Con dấu di sản này sẽ được đóng vĩnh viễn vào Hộ chiếu số của tài khoản bạn. Sau khi mở khóa, con dấu này sẽ thuộc về bạn độc bản và <strong>không thể chuyển nhượng</strong>.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-[#A66120] pt-1 border-t border-[#E8DECB]/60">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Dữ liệu mở khóa sẽ lập tức đồng bộ hiển thị trên Bản đồ di sản.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isUnlocking}
            className="flex-1 py-3 px-4 rounded-xl border border-[#D6AD60]/60 bg-white hover:bg-[#FAF6EE] text-[#5D5246] font-semibold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isUnlocking}
            className="flex-2 py-3 px-5 rounded-xl bg-gradient-to-r from-[#8B2E1E] via-[#A33824] to-[#6A1E14] hover:from-[#732619] hover:to-[#571910] text-[#F7F0E2] font-serif font-bold text-xs sm:text-sm border border-[#D6AD60] shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isUnlocking ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#F4E1BA]" />
                <span>Đang đóng dấu...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#F4E1BA]" />
                <span>Xác nhận đóng dấu</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

