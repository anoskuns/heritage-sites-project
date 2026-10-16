import { useState } from 'react'
import {
  Search,
  Copy,
  Check,
  ShieldAlert,
  Award,
  Users,
} from 'lucide-react'
import type { AdminUserSummary } from '../../../features/admin'
import { toggleUserAdminRole } from '../../../features/admin'

interface AdminUsersTabProps {
  users: AdminUserSummary[]
  onRefresh: () => void
}

export function AdminUsersTab({ users, onRefresh }: AdminUsersTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedUid, setCopiedUid] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const filteredUsers = users.filter((u) => {
    return (
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid)
    setCopiedUid(uid)
    setTimeout(() => setCopiedUid(null), 2000)
  }

  const handleToggleRole = async (user: AdminUserSummary) => {
    const actionLabel = user.role === 'admin' ? 'hạ quyền Quản trị xuống Thành viên' : 'cấp quyền Quản trị viên (Admin)'
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn ${actionLabel} cho tài khoản "${user.displayName}"?\n\nUID: ${user.id}`
    )
    if (!confirmed) return

    setIsUpdating(user.id)
    try {
      await toggleUserAdminRole(user.id, user.role)
      onRefresh()
    } catch (err) {
      console.error('Failed to toggle role:', err)
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top bar with Search */}
      <div className="bg-white border border-[#E8DECB] rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo Tên, Email hoặc UID người dùng..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-[#FAF6EE]/50 text-xs sm:text-sm text-[#2D2723] focus:ring-2 focus:ring-[#8B2E1E] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-[#5D5246] font-semibold shrink-0">
          <Users className="w-4 h-4 text-[#8B2E1E]" />
          <span>Tổng số: {users.length} tài khoản</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-[#E8DECB] rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6EE] text-[#5D5246] border-b border-[#E8DECB] uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4">Tài khoản </th>
                <th className="py-3 px-4">UID </th>
                <th className="py-3 px-4 text-center">Vai trò (Role)</th>
                <th className="py-3 px-4 text-center">Con dấu</th>
                <th className="py-3 px-4 text-right">Phân quyền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                    {/* User Profile */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B2E1E] to-[#6A1E14] text-[#F4E1BA] font-bold text-xs flex items-center justify-center shrink-0">
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-sm text-[#2D2723] block">
                            {user.displayName}
                          </span>
                          <span className="text-[11px] text-gray-500 block">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* UID with 1-click copy */}
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-lg border border-gray-200 transition-colors">
                        <span className="font-mono text-[11px] text-gray-700">
                          {user.id}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyUid(user.id)}
                          title="Sao chép UID"
                          className="text-gray-400 hover:text-[#8B2E1E] cursor-pointer"
                        >
                          {copiedUid === user.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3 px-4 text-center">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#8B2E1E] to-[#6A1E14] text-[#F7F0E2] text-[10px] font-bold shadow-2xs border border-[#D6AD60]">
                          <ShieldAlert className="w-3 h-3 text-[#F4E1BA]" />
                          <span>Admin</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold border border-gray-200">
                          <span>Thành viên</span>
                        </span>
                      )}
                    </td>

                    {/* Stamps count */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <Award className="w-3.5 h-3.5 text-amber-700" />
                        <span>{user.stampsCount}</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleRole(user)}
                        disabled={isUpdating === user.id}
                        className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                          user.role === 'admin'
                            ? 'border-gray-300 bg-white hover:bg-red-50 hover:text-red-700 text-gray-600'
                            : 'border-[#D6AD60] bg-amber-50 hover:bg-amber-100 text-[#8B2E1E]'
                        }`}
                      >
                        {user.role === 'admin' ? 'Hạ quyền' : 'Cấp Admin'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
