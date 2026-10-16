import {
  Landmark,
  Users,
  QrCode,
  Newspaper,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import type { AdminDashboardStats } from '../../../features/admin'
import { ChimLac, TrongDongGold } from '../../../components/decorative/DongSonMotifs'

interface AdminOverviewTabProps {
  stats: AdminDashboardStats
  onNavigateTab: (tab: 'sites' | 'users' | 'posts' | 'qr') => void
  onOpenCreateSite: () => void
  onOpenBatchQr: () => void
}

export function AdminOverviewTab({
  stats,
  onNavigateTab,
  onOpenCreateSite,
  onOpenBatchQr,
}: AdminOverviewTabProps) {
  const kpis = [
    {
      label: 'Tổng số Di sản / Địa danh',
      value: stats.totalSites,
      sub: `${stats.publishedSites} địa danh đã xuất bản`,
      icon: Landmark,
      color: 'from-[#8B2E1E] to-[#6A1E14]',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      tabKey: 'sites' as const,
    },
    {
      label: 'Tài khoản Thành viên',
      value: stats.totalUsers,
      sub: `${stats.totalAdminUsers} quản trị viên`,
      icon: Users,
      color: 'from-amber-700 to-amber-900',
      badgeColor: 'bg-blue-100 text-blue-800',
      tabKey: 'users' as const,
    },
    {
      label: 'Mã QR & Con dấu độc bản',
      value: stats.totalQrTokens,
      sub: `${stats.claimedQrTokens} mã đã được kích hoạt`,
      icon: QrCode,
      color: 'from-emerald-700 to-emerald-900',
      badgeColor: 'bg-amber-100 text-amber-800',
      tabKey: 'qr' as const,
    },
    {
      label: 'Bài viết & Thông báo',
      value: stats.totalPosts,
      sub: `${stats.publishedPosts} bài đăng công khai`,
      icon: Newspaper,
      color: 'from-stone-700 to-stone-900',
      badgeColor: 'bg-purple-100 text-purple-800',
      tabKey: 'posts' as const,
    },
  ]

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#8B2E1E] via-[#732619] to-[#571910] text-[#F7F0E2] p-6 sm:p-8 border-2 border-[#D6AD60] shadow-xl">
        <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
          <TrongDongGold className="w-80 h-80" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D6AD60]/20 border border-[#D6AD60]/50 text-xs font-bold text-[#F4E1BA]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hệ Thống Quản Trị Trung Tâm Heritage ĐMST</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight leading-snug">
            Bảng Điều Khiển Quản Trị Di Sản Số
          </h1>

          <p className="text-xs sm:text-sm text-[#F7F0E2]/80 leading-relaxed">
            Giám sát toàn diện mạng lưới di tích văn hóa, cấp phát các lô tem QR độc bản cho sản phẩm lưu niệm vật lý, quản lý tài khoản người dùng và nội dung cộng đồng.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onOpenCreateSite}
              className="py-2.5 px-4 rounded-xl bg-[#D6AD60] hover:bg-[#C49A4D] text-[#4A1E14] font-serif font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Di Tích Mới</span>
            </button>

            <button
              type="button"
              onClick={onOpenBatchQr}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs"
            >
              <QrCode className="w-4 h-4 text-[#F4E1BA]" />
              <span>Tạo Lô Mã QR Độc Bản</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(kpi.tabKey)}
              className="group bg-white border border-[#E8DECB] hover:border-[#D6AD60] rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${kpi.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#8B2E1E] transition-colors" />
              </div>

              <div className="mt-4 space-y-1">
                <span className="text-xs font-bold text-[#7A6E60] line-clamp-1">
                  {kpi.label}
                </span>
                <div className="text-2xl sm:text-3xl font-serif font-black text-[#2D2723]">
                  {kpi.value}
                </div>
                <p className="text-[11px] text-[#5D5246] pt-1 border-t border-gray-100 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span>{kpi.sub}</span>
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Operational Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Quick Management Guide */}
        <div className="lg:col-span-2 bg-[#FAF6EE] border border-[#E8DECB] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DECB] pb-3">
            <h2 className="text-sm font-serif font-bold text-[#2D2723] flex items-center gap-2">
              <ChimLac className="w-4 h-4 text-[#8B2E1E]" />
              <span>Quy trình Quản trị & Nghiệp vụ</span>
            </h2>
            <span className="text-[11px] text-[#8B2E1E] font-semibold bg-[#8B2E1E]/10 px-2.5 py-0.5 rounded-full">
              Hướng dẫn nhanh
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-[#5D5246]">
            <div className="p-3.5 rounded-xl bg-white border border-[#E8DECB]/80 space-y-1.5">
              <span className="font-bold text-[#8B2E1E] block">1. Cập nhật Di tích từ Google Maps</span>
              <p className="text-[11px] leading-relaxed text-[#7A6E60]">
                Chỉ cần dán link Maps vào ô nhập liệu, hệ thống tự động bóc tách vĩ độ và kinh độ chuẩn xác, ghim trực tiếp lên bản đồ Việt Nam.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E8DECB]/80 space-y-1.5">
              <span className="font-bold text-[#8B2E1E] block">2. In tem QR Độc bản cho Sản phẩm</span>
              <p className="text-[11px] leading-relaxed text-[#7A6E60]">
                Tạo theo lô 50-100 mã cho mỗi đợt sản xuất vật lý. Mỗi chiếc pin cài áo chỉ cấp quyền sở hữu độc quyền cho duy nhất một tài khoản người mua.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E8DECB]/80 space-y-1.5">
              <span className="font-bold text-[#8B2E1E] block">3. Quản lý Thành viên & Tra cứu UID</span>
              <p className="text-[11px] leading-relaxed text-[#7A6E60]">
                Tra cứu tài khoản, sao chép UID Supabase nhanh chỉ với 1 click, và cấp quyền Quản trị viên cho cộng sự.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E8DECB]/80 space-y-1.5">
              <span className="font-bold text-[#8B2E1E] block">4. Đăng Bài & Kiểm duyệt Cộng đồng</span>
              <p className="text-[11px] leading-relaxed text-[#7A6E60]">
                Đăng bài thông báo chính thức có huy hiệu Quản trị viên, duyệt bài viết du khách và ẩn/xóa nội dung không phù hợp.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: System Status & Security */}
        <div className="bg-white border border-[#E8DECB] rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-sm font-serif font-bold text-[#2D2723] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D6AD60]" />
              <span>Trạng Thái Kết Nối</span>
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200">
                <span className="font-semibold">Cơ sở dữ liệu Supabase:</span>
                <span className="font-bold text-[11px] px-2 py-0.5 rounded-full bg-emerald-200">Trực Tuyến</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
                <span className="font-semibold">Bộ nhớ đệm dự phòng:</span>
                <span className="font-bold text-[11px] px-2 py-0.5 rounded-full bg-amber-200">Hoạt Động</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 text-blue-900 border border-blue-200">
                <span className="font-semibold">Bảo mật RLS:</span>
                <span className="font-bold text-[11px] px-2 py-0.5 rounded-full bg-blue-200">Đã Kích Hoạt</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 text-center">
            <span className="text-[11px] text-gray-400 font-mono">
              Heritage ĐMST Admin v2.4 (Build 2026.10)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
