import { NavLink } from 'react-router-dom'
import { Landmark, Compass, BookOpen, Users, QrCode } from 'lucide-react'
import { useTranslation } from '../../i18n'
import { DongSonSun } from '../decorative/DongSonMotifs'

export function BottomNav() {
  const { t } = useTranslation()

  const navItems = [
    { to: '/', label: t.nav.home, icon: Landmark, end: true },
    { to: '/map', label: t.nav.map, icon: Compass },
    { to: '/unlock', label: 'Quét mã', icon: QrCode, isProminent: true },
    { to: '/passport', label: t.nav.passport, icon: BookOpen },
    { to: '/community', label: t.nav.community, icon: Users },
  ]

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-[1100] bg-[#F7F0E2]/95 backdrop-blur-md border-t border-[#E8DECB] shadow-[0_-4px_20px_rgba(45,39,35,0.06)] pb-safe"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
        {navItems.map((item) => {
          // Central Prominent QR Scan Button
          if (item.isProminent) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="relative -top-3.5 flex flex-col items-center justify-center select-none group focus:outline-hidden"
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`relative w-12 h-12 rounded-full bg-gradient-to-tr from-[#8B2E1E] via-[#752014] to-[#A33824] border-2 border-[#D6AD60] shadow-[0_6px_20px_rgba(139,46,30,0.35)] flex items-center justify-center text-[#F4E1BA] transition-all duration-200 group-hover:scale-105 active:scale-95 overflow-hidden ${
                        isActive ? 'ring-3 ring-[#D6AD60]/70 scale-105' : ''
                      }`}
                    >
                      {/* Subtle rotating motif in background */}
                      <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
                        <DongSonSun className="w-10 h-10 text-[#D6AD60]" />
                      </div>
                      <QrCode className="relative z-10 w-5 h-5 text-[#F4E1BA] drop-shadow-xs group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <span
                      className={`text-[9.5px] font-serif font-bold tracking-tight mt-0.5 transition-colors ${
                        isActive ? 'text-[#8B2E1E]' : 'text-[#7A6E60] group-hover:text-[#8B2E1E]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            )
          }

          // Standard Nav Tab
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 select-none ${
                  isActive
                    ? 'text-[#8B2E1E] font-bold'
                    : 'text-[#7A6E60] hover:text-[#8B2E1E] font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1 rounded-xl transition-all duration-200 ${
                      isActive ? 'bg-[#8B2E1E]/10' : 'bg-transparent'
                    }`}
                  >
                    <item.icon
                      className={`w-4.5 h-4.5 transition-transform duration-150 ${
                        isActive ? 'scale-110 stroke-[2.25] text-[#8B2E1E]' : 'stroke-[1.75]'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-serif tracking-tight leading-tight truncate max-w-[58px] text-center mt-0.5">
                    {item.label}
                  </span>
                  {isActive ? (
                    <span className="w-1 h-1 bg-[#D6AD60] rounded-full mt-0.5 shadow-2xs" />
                  ) : (
                    <span className="w-1 h-1 bg-transparent rounded-full mt-0.5" />
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
