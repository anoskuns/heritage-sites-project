import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { FloatingScanButton } from './FloatingScanButton'
import { useTranslation } from '../../i18n'
import { ChimLac, DongSonBorderLine } from '../decorative/DongSonMotifs'

const CURRENT_YEAR = new Date().getFullYear()

export function MainLayout() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F0E2] text-[#2D2723] antialiased">
      {/* Top Header */}
      <Header />

      {/* Main Content Area: Proper safe clearance from BottomNav */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-10">
        <Outlet />
      </main>

      {/* Floating Scan Button (Bottom-Right) */}
      <FloatingScanButton />

      {/* Desktop Footer with Dong Son Trim */}
      <footer className="hidden md:block border-t border-[#E8DECB] bg-[#FAF6EE] pt-6 pb-8 mt-auto relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="text-[#D6AD60] opacity-40">
            <DongSonBorderLine className="w-full h-2.5 text-[#D6AD60]" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A6E60]">
            <div className="flex items-center gap-2">
              <ChimLac className="w-4 h-4 text-[#8B2E1E]" />
              <p className="font-serif">
                © {CURRENT_YEAR} {t.common.appName} — {t.common.appTagline}
              </p>
            </div>
            <p className="text-[11px] text-[#8E8375]">
              Hệ thống Hộ Chiếu Di Sản Số Hóa Quốc Gia Việt Nam
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile-first Bottom Navigation Bar */}
      <BottomNav />
    </div>
  )
}
