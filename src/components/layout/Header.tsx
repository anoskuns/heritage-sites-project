import { useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { Landmark, Compass, BookOpen, Users, User, LogIn, QrCode, ShieldCheck } from 'lucide-react'
import { useTranslation } from '../../i18n'
import { useAuth } from '../../features/authentication'
import { LanguageSwitcher } from './LanguageSwitcher'
import { NotificationBell } from '../../features/notifications'
import { ChimLac, DongSonSun } from '../decorative/DongSonMotifs'
import { useDemoMode } from '../../services/demoModeService'
import { checkIsAdmin } from '../../features/admin'

export function Header() {
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const { isDemoMode, toggleDemoMode } = useDemoMode()
  const logoClickCountRef = useRef(0)
  const logoClickTimerRef = useRef<number | null>(null)

  const handleLogoClick = () => {
    logoClickCountRef.current += 1
    if (logoClickTimerRef.current) clearTimeout(logoClickTimerRef.current)

    logoClickTimerRef.current = window.setTimeout(() => {
      logoClickCountRef.current = 0
    }, 1500)

    if (logoClickCountRef.current >= 3) {
      logoClickCountRef.current = 0
      toggleDemoMode()
    }
  }

  // Core navigation destinations (browsing & exploring)
  const navItems = [
    { to: '/', label: t.nav.home, icon: Landmark, end: true },
    { to: '/map', label: t.nav.map, icon: Compass },
    { to: '/passport', label: t.nav.passport, icon: BookOpen },
    { to: '/community', label: t.nav.community, icon: Users },
  ]

  return (
    <header className="sticky top-0 z-[1050] w-full border-b border-[#E8DECB] bg-[#F7F0E2]/95 backdrop-blur-md shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand / Logo: Trống đồng Đông Sơn mạ vàng + Chữ Serif cổ điển */}
        <NavLink
          to="/"
          onClick={handleLogoClick}
          title="Di sản Số — Nhấp 3 lần để Bật/Tắt Chế độ Demo"
          className="flex items-center gap-2.5 sm:gap-3 group focus:outline-hidden cursor-pointer select-none shrink-0"
        >
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#8B2E1E] to-[#6A1E14] text-[#D6AD60] flex items-center justify-center shadow-md border border-[#D6AD60]/60 group-hover:scale-105 transition-transform duration-200 overflow-hidden">
            <img 
              src="/images/hoatietvanhoa/sun-cloud.jpg" 
              alt="Mặt trời ngàn năm" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen scale-125" 
            />
            <DongSonSun className="relative z-10 w-6 h-6 sm:w-7 sm:h-7 text-[#F4E1BA] drop-shadow-md" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-base sm:text-xl tracking-tight text-[#6A1E14] group-hover:text-[#8B2E1E] transition-colors leading-tight">
              {t.common.appName}
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold text-[#8C7A68]">
              {t.common.appTagline}
            </span>
          </div>
        </NavLink>

        {/* Desktop Navigation Links: Phong cách Thẻ Bài Liễn Cung Đình (Imperial Plaque Tabs) */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2.5 h-full py-3.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex items-center gap-2 px-3.5 lg:px-4.5 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer select-none border text-xs lg:text-sm ${
                  isActive
                    ? 'bg-gradient-to-b from-[#FAF4E8] via-[#F4E8D3] to-[#EBD5B3] border-[#8B2E1E] text-[#8B2E1E] font-bold shadow-[0_4px_16px_rgba(139,46,30,0.15)] ring-1 ring-[#D6AD60]/60'
                    : 'bg-white/40 hover:bg-[#FAF6EE] border-[#E8DECB] hover:border-[#D6AD60]/80 text-[#5D5246] hover:text-[#8B2E1E] font-medium shadow-2xs'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Góc triện cổ ở 2 góc trên tab khi active */}
                  {isActive && (
                    <>
                      <span className="absolute top-1 left-1.5 w-1.5 h-1.5 border-t border-l border-[#8B2E1E]/70 pointer-events-none" />
                      <span className="absolute top-1 right-1.5 w-1.5 h-1.5 border-t border-r border-[#8B2E1E]/70 pointer-events-none" />
                      <span className="absolute bottom-1 left-1.5 w-1.5 h-1.5 border-b border-l border-[#8B2E1E]/70 pointer-events-none" />
                      <span className="absolute bottom-1 right-1.5 w-1.5 h-1.5 border-b border-r border-[#8B2E1E]/70 pointer-events-none" />
                    </>
                  )}

                  {/* Icon tab */}
                  <item.icon
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isActive ? 'text-[#8B2E1E] scale-110' : 'text-[#8C7A68] group-hover:text-[#8B2E1E]'
                    }`}
                  />

                  {/* Label tab */}
                  <span className="font-serif tracking-wide leading-none pt-0.5 whitespace-nowrap">
                    {item.label}
                  </span>

                  {/* Chim Lạc bay nhỏ khi Active */}
                  {isActive && (
                    <ChimLac className="w-3.5 h-3.5 text-[#8B2E1E] ml-0.5 animate-pulse hidden xl:inline" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right side actions: Quét QR CTA Button, Language Switcher, Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Dedicated Call-To-Action: Nút Quét Mã Di Sản */}
          <NavLink
            to="/unlock"
            title="Quét mã di sản vật lý để mở khóa con dấu"
            className={({ isActive }) =>
              `hidden sm:inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-serif font-bold transition-all duration-200 cursor-pointer shadow-xs border ${
                isActive
                  ? 'bg-gradient-to-r from-[#8B2E1E] to-[#6A1E14] text-[#FAF6EE] border-[#D6AD60] shadow-sm ring-2 ring-[#D6AD60]/50'
                  : 'bg-gradient-to-r from-[#8B2E1E] via-[#7A2416] to-[#6A1E14] hover:from-[#732315] hover:to-[#57170e] text-[#FAF6EE] border-[#D6AD60]/70 hover:border-[#D6AD60] hover:scale-102 active:scale-98 shadow-sm'
              }`
            }
          >
            <QrCode className="w-3.5 h-3.5 text-[#F4E1BA]" />
            <span>Quét mã</span>
          </NavLink>

          {/* Demo Mode Active Indicator */}
          {isDemoMode && (
            <button
              type="button"
              onClick={toggleDemoMode}
              title="Chế độ Demo đang BẬT. Bấm để TẮT."
              className="hidden xl:inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/15 text-amber-900 border border-amber-500/40 text-[10px] font-bold cursor-pointer hover:bg-amber-500/25 transition-all shadow-2xs"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
              <span>Demo</span>
            </button>
          )}

          <NotificationBell />

          {/* Nút Quản Trị Hệ Thống (Chỉ hiển thị cho Admin) */}
          {checkIsAdmin(user, profile) && (
            <NavLink
              to="/admin"
              title="Cổng Quản Trị Hệ Thống"
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-serif font-bold transition-all duration-200 cursor-pointer shadow-2xs border ${
                  isActive
                    ? 'bg-gradient-to-r from-[#8B2E1E] to-[#6A1E14] text-[#F7F0E2] border-[#D6AD60] shadow-sm'
                    : 'bg-[#8B2E1E]/10 hover:bg-[#8B2E1E]/20 text-[#8B2E1E] border-[#8B2E1E]/30'
                }`
              }
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#8B2E1E]" />
              <span className="hidden sm:inline">Quản trị</span>
            </NavLink>
          )}

          <LanguageSwitcher />

          {user ? (
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isActive
                    ? 'text-[#8B2E1E] bg-[#E8DECB]/50 border-[#D6AD60]/60'
                    : 'text-[#6D5D4E] hover:text-[#8B2E1E] border-[#E8DECB] hover:bg-white/80'
                }`
              }
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-5 h-5 rounded-full object-cover border border-[#D6AD60]"
                />
              ) : (
                <User className="w-4 h-4 text-[#8B2E1E]" />
              )}
              <span className="max-w-[100px] truncate font-serif">
                {profile?.display_name || t.nav.profile}
              </span>
            </NavLink>
          ) : (
            <NavLink
              to="/auth"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#8B2E1E] to-[#6A1E14] hover:from-[#732315] hover:to-[#57170e] shadow-xs transition-all cursor-pointer border border-[#D6AD60]/40"
            >
              <LogIn className="w-3.5 h-3.5 text-[#D6AD60]" />
              <span>{t.nav.login}</span>
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}
