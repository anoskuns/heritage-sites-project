import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Landmark,
  Users,
  Newspaper,
  QrCode,
  ArrowLeft,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '../../features/authentication'
import { DongSonIcon, ChimLac } from '../../components/decorative/DongSonMotifs'

export type AdminActiveTab = 'overview' | 'sites' | 'users' | 'posts' | 'qr'

interface AdminLayoutProps {
  activeTab: AdminActiveTab
  onTabChange: (tab: AdminActiveTab) => void
  children: React.ReactNode
  onOpenCreateSite?: () => void
}

export function AdminLayout({
  activeTab,
  onTabChange,
  children,
  onOpenCreateSite: _onOpenCreateSite,
}: AdminLayoutProps) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'overview' as const, label: 'Tổng quan hệ thống', icon: LayoutDashboard },
    { id: 'sites' as const, label: 'Quản lý Di sản', icon: Landmark },
    { id: 'users' as const, label: 'Quản lý Tài khoản', icon: Users },
    { id: 'posts' as const, label: 'Bài viết và tin tức', icon: Newspaper },
    { id: 'qr' as const, label: 'Mã QR & Tem Độc Bản', icon: QrCode },
  ]

  const handleLogout = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex flex-col md:flex-row text-[#2D2723]">
      {/* Mobile Top Navigation */}
      <div className="md:hidden bg-[#FAF6EE] border-b border-[#E8DECB] p-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <DongSonIcon className="w-6 h-6 text-[#8B2E1E]" />
          <span className="font-serif font-black text-sm text-[#8B2E1E]">
            Heritage Admin
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-white border border-[#E8DECB] text-gray-700 cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          isMobileMenuOpen ? 'block' : 'hidden'
        } md:flex flex-col w-full md:w-64 bg-[#FAF6EE] border-r border-[#E8DECB] shrink-0 sticky top-0 md:h-screen z-30 justify-between`}
      >
        <div className="p-4 sm:p-5 space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#E8DECB]">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8B2E1E] to-[#6A1E14] text-[#F4E1BA] flex items-center justify-center shadow-md border border-[#D6AD60] shrink-0">
              <DongSonIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-black text-base text-[#8B2E1E] tracking-tight">
                  Heritage ĐMST
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#8B2E1E] text-white">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-[#7A6E60] font-medium">
                Cổng Quản Trị Hệ Thống
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A6E60] px-3 block mb-1">
              Phân Hệ Quản Trị
            </span>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onTabChange(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-serif text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#8B2E1E] to-[#6A1E14] text-[#F7F0E2] shadow-sm border border-[#D6AD60]'
                      : 'text-[#5D5246] hover:text-[#8B2E1E] hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#F4E1BA]' : 'text-[#8B2E1E]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChimLac className="w-3.5 h-3.5 text-[#F4E1BA]" />}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#E8DECB] space-y-2 bg-[#F7F0E2]/60">
          <Link
            to="/"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#5D5246] hover:text-[#8B2E1E] hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về giao diện người dùng</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất Quản trị</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-[#E8DECB] px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#7A6E60]">
            <Link to="/admin" className="font-semibold hover:text-[#8B2E1E]">
              Admin
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-bold text-[#2D2723] capitalize">
              {navItems.find((n) => n.id === activeTab)?.label}
            </span>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-3">
            {/* Live Database Indicator */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Database Online</span>
            </div>

            {/* Admin User Info */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#8B2E1E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {(profile?.display_name || user?.email || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <span className="font-bold text-xs text-[#2D2723] block leading-tight">
                  {profile?.display_name || 'Admin'}
                </span>
                <span className="text-[10px] text-gray-400 block font-mono">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
