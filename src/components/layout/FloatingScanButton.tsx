import { Link, useLocation } from 'react-router-dom'
import { QrCode, Sparkles } from 'lucide-react'
import { DongSonSun } from '../decorative/DongSonMotifs'

export function FloatingScanButton() {
  const location = useLocation()

  // Hide when already on unlock/scan page or on interactive map view to avoid blocking map controls
  if (location.pathname === '/unlock' || location.pathname === '/map') {
    return null
  }

  return (
    <aside
      aria-label="Lối tắt quét mã di sản"
      className="hidden md:flex fixed bottom-8 right-8 z-[900] items-center group select-none animate-fadeIn"
    >
      <Link
        to="/unlock"
        className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#8B2E1E] via-[#7A2416] to-[#6A1E14] text-[#F7F0E2] border-2 border-[#D6AD60] shadow-[0_8px_25px_rgba(139,46,30,0.3)] hover:shadow-[0_12px_32px_rgba(139,46,30,0.45)] hover:scale-105 active:scale-95 transition-all duration-300 ring-2 ring-[#D6AD60]/40 group-hover:ring-[#D6AD60]/80 cursor-pointer overflow-hidden"
      >
        {/* Subtle background sun pattern glow */}
        <div className="absolute -left-2 -top-2 w-12 h-12 text-[#D6AD60]/15 pointer-events-none group-hover:rotate-45 transition-transform duration-700">
          <DongSonSun className="w-full h-full" />
        </div>

        {/* Pulse beacon glow effect */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D6AD60] opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D6AD60]" />
        </span>

        {/* QR Code Icon with golden drop-shadow */}
        <div className="relative z-10 w-6 h-6 rounded-lg bg-[#FAF4E8]/10 flex items-center justify-center border border-[#D6AD60]/40 shadow-xs">
          <QrCode className="w-3.5 h-3.5 text-[#F4E1BA] group-hover:scale-110 transition-transform duration-200" />
        </div>

        {/* Label & Subtitle */}
        <div className="relative z-10 flex flex-col text-left pr-1">
          <span className="font-serif font-bold text-xs tracking-wide text-white leading-tight flex items-center gap-1">
            <span>Quét mã</span>
            <Sparkles className="w-3 h-3 text-[#D6AD60] animate-pulse" />
          </span>
          <span className="text-[10px] text-[#F4E1BA]/80 font-medium leading-none">
            Mở khóa di sản
          </span>
        </div>
      </Link>
    </aside>
  )
}
