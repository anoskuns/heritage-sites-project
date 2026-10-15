import { NavLink } from 'react-router-dom'
import { Landmark, Compass, BookOpen, Users, User } from 'lucide-react'
import { useTranslation } from '../../i18n'

export function BottomNav() {
  const { t } = useTranslation()

  const navItems = [
    { to: '/', label: t.nav.home, icon: Landmark, end: true },
    { to: '/passport', label: t.nav.passport, icon: BookOpen },
    { to: '/map', label: t.nav.map, icon: Compass },
    { to: '/community', label: t.nav.community, icon: Users },
    { to: '/profile', label: t.nav.profile, icon: User },
  ]

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-[1100] bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-lg pb-safe"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-all duration-150 select-none ${
                isActive
                  ? 'text-amber-800 font-semibold'
                  : 'text-gray-500 hover:text-gray-900 font-normal'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-110 stroke-[2.25]' : 'stroke-[1.75]'
                  }`}
                />
                <span className="text-[10px] tracking-tight leading-none truncate max-w-[64px]">
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 bg-amber-700 rounded-full mt-0.5" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

