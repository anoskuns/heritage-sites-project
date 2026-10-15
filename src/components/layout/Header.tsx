import { NavLink } from 'react-router-dom'
import { Landmark, Compass, BookOpen, Users, User, LogIn } from 'lucide-react'
import { useTranslation } from '../../i18n'
import { useAuth } from '../../features/authentication'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Header() {
  const { t } = useTranslation()
  const { user, profile } = useAuth()

  const navItems = [
    { to: '/', label: t.nav.home, icon: Landmark, end: true },
    { to: '/passport', label: t.nav.passport, icon: BookOpen },
    { to: '/map', label: t.nav.map, icon: Compass },
    { to: '/community', label: t.nav.community, icon: Users },
  ]

  return (
    <header className="sticky top-0 z-[1050] w-full border-b border-amber-900/10 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-2.5 group focus:outline-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-red-700 flex items-center justify-center text-white shadow-sm shadow-amber-900/20 group-hover:scale-105 transition-transform duration-150">
            <Landmark className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base sm:text-lg tracking-tight text-gray-900 group-hover:text-amber-800 transition-colors">
              {t.common.appName}
            </span>
            <span className="text-[11px] text-amber-800/70 font-medium hidden sm:inline">
              {t.common.appTagline}
            </span>
          </div>
        </NavLink>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center gap-1.5 ${
                  isActive
                    ? 'text-amber-800 bg-amber-50 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right side actions: Language Switcher & Profile / Auth link */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <LanguageSwitcher />

          {user ? (
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-amber-800 bg-amber-50 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-5 h-5 rounded-full object-cover border border-amber-300"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
              <span className="max-w-[120px] truncate">
                {profile?.display_name || t.nav.profile}
              </span>
            </NavLink>
          ) : (
            <NavLink
              to="/auth"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 active:bg-amber-900 shadow-xs transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>{t.nav.login}</span>
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}
