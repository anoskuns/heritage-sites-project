import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { useTranslation } from '../../i18n'

const CURRENT_YEAR = new Date().getFullYear()

export function MainLayout() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-900 antialiased">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 md:pb-8">
        <Outlet />
      </main>

      {/* Desktop Footer */}
      <footer className="hidden md:block border-t border-gray-200/80 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>
            © {CURRENT_YEAR} {t.common.appName} — {t.common.appTagline}
          </p>
          <p className="text-gray-400">
            Powered by React, Supabase & Tailwind CSS
          </p>
        </div>
      </footer>

      {/* Mobile-first Bottom Navigation Bar */}
      <BottomNav />
    </div>
  )
}
