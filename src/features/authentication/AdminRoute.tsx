import React, { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, KeyRound, Sparkles } from 'lucide-react'
import { useAuth } from './useAuth'
import { checkIsAdmin, toggleLocalAdminOverride } from '../admin/adminService'
import { DongSonIcon, ChimLac } from '../../components/decorative/DongSonMotifs'

interface AdminRouteProps {
  children?: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, profile, isLoading } = useAuth()
  const [, setRefreshKey] = useState(0)

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <DongSonIcon className="w-12 h-12 text-[#8B2E1E] animate-spin" />
        <p className="text-sm font-serif font-bold text-[#5D5246] tracking-wide">
          Đang xác thực quyền Quản trị viên...
        </p>
      </div>
    )
  }

  const isAdmin = checkIsAdmin(user, profile)

  if (!user) {
    return <Navigate to="/auth?redirectTo=/admin" replace />
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#FAF6EE] border-2 border-[#E8DECB] rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-lg shadow-[#8B2E1E]/5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B2E1E] to-[#6A1E14] text-[#F4E1BA] flex items-center justify-center mx-auto shadow-md border border-[#D6AD60]">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B2E1E] flex items-center justify-center gap-1.5">
              <ChimLac className="w-3.5 h-3.5 text-[#8B2E1E]" />
              <span>Khu Vực Quản Trị Hệ Thống</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-[#2D2723]">
              Quyền Truy Cập Bị Giới Hạn
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6E60] leading-relaxed">
              Tài khoản <span className="font-semibold text-[#8B2E1E]">{user.email}</span> (UID: {user.id.slice(0, 8)}...) chưa được cấp vai trò Quản trị viên (<span className="font-mono text-xs">role: admin</span>).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-700" />
              <span>Gợi ý truy cập dành cho Nhà phát triển:</span>
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Bạn có thể đăng nhập bằng tài khoản <span className="font-bold">admin@heritage.vn</span> hoặc nhấn nút bên dưới để mở quyền thử nghiệm.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                toggleLocalAdminOverride()
                setRefreshKey((k) => k + 1)
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#8B2E1E] to-[#6A1E14] hover:from-[#732619] hover:to-[#571910] text-[#F7F0E2] font-serif font-bold text-xs sm:text-sm border border-[#D6AD60] shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#F4E1BA]" />
              <span>Bật quyền Admin Kiểm thử (Local QA)</span>
            </button>

            <Link
              to="/"
              className="w-full py-2.5 px-4 rounded-xl border border-[#D6AD60]/60 bg-white hover:bg-[#FAF6EE] text-[#5D5246] font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay về Trang chủ</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
