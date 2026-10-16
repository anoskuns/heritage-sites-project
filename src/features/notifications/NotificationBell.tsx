import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  Sparkles,
  Trash2,
  Check,
  Compass,
  X,
} from 'lucide-react'
import {
  getNotifications,
  markAllAsRead,
  clearNotifications,
  deleteNotification,
  getUnreadCount,
  type ActivityNotification,
} from './notificationService'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<ActivityNotification[]>(() => getNotifications())
  const [unreadCount, setUnreadCount] = useState<number>(() => getUnreadCount())
  const [filter, setFilter] = useState<'all' | 'unlock_success' | 'stamp_revoked'>('all')

  const containerRef = useRef<HTMLDivElement>(null)

  const reloadData = () => {
    setNotifications(getNotifications())
    setUnreadCount(getUnreadCount())
  }

  useEffect(() => {
    const onUpdate = () => {
      reloadData()
    }

    window.addEventListener('heritage_notification_updated', onUpdate)
    return () => {
      window.removeEventListener('heritage_notification_updated', onUpdate)
    }
  }, [])

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = () => {
    if (!isOpen && unreadCount > 0) {
      markAllAsRead()
      setUnreadCount(0)
    }
    setIsOpen((prev) => !prev)
  }

  const filteredNotifs =
    filter === 'all'
      ? notifications
      : notifications.filter((n) => n.type === filter)

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    } catch {
      return ''
    }
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Thông báo và nhật ký mở khóa"
        className="relative p-2.5 rounded-xl border border-[#E8DECB] bg-white/60 hover:bg-[#FAF6EE] hover:border-[#D6AD60] text-[#5D5246] hover:text-[#8B2E1E] transition-all cursor-pointer shadow-2xs select-none"
      >
        <Bell className="w-4 h-4 text-[#8B2E1E]" />

        {/* Unread Badge Counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-red-600 to-[#8B2E1E] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse border border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-3xl bg-[#FAF6EE] border-2 border-[#D6AD60] shadow-[0_16px_40px_rgba(0,0,0,0.2)] z-[1100] overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-4 border-b border-[#E8DECB] bg-[#F7F0E2] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#8B2E1E] text-[#F4E1BA] flex items-center justify-center shadow-2xs">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-serif font-bold text-sm text-[#2D2723]">
                Nhật ký & Thông báo
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={markAllAsRead}
                title="Đánh dấu đã đọc"
                className="p-1 rounded-lg hover:bg-[#E8DECB] text-[#7A6E60] hover:text-[#8B2E1E] transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={clearNotifications}
                title="Xóa tất cả nhật ký"
                className="p-1 rounded-lg hover:bg-[#E8DECB] text-[#7A6E60] hover:text-red-700 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-[#E8DECB] text-[#7A6E60] hover:text-[#2D2723] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#E8DECB]/60 bg-[#FAF4E8]/60 text-[11px] font-semibold text-[#5D5246]">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                filter === 'all'
                  ? 'bg-[#8B2E1E] text-white font-bold shadow-2xs'
                  : 'hover:bg-[#E8DECB]'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unlock_success')}
              className={`px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                filter === 'unlock_success'
                  ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                  : 'hover:bg-[#E8DECB]'
              }`}
            >
              Mở khóa
            </button>
            <button
              type="button"
              onClick={() => setFilter('stamp_revoked')}
              className={`px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                filter === 'stamp_revoked'
                  ? 'bg-amber-700 text-white font-bold shadow-2xs'
                  : 'hover:bg-[#E8DECB]'
              }`}
            >
              Thu hồi (Test)
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#E8DECB]/60 p-2 space-y-1">
            {filteredNotifs.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Sparkles className="w-8 h-8 text-[#D6AD60] mx-auto opacity-70" />
                <p className="text-xs text-[#7A6E60] font-medium">
                  Chưa có thông báo hoặc hoạt động nào
                </p>
                <p className="text-[11px] text-[#A39686]">
                  Các lượt quét mã, mở khóa di sản và thu hồi sẽ được ghi lại tại đây.
                </p>
              </div>
            ) : (
              filteredNotifs.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl transition-all space-y-1.5 ${
                    item.read
                      ? 'bg-white/50 hover:bg-white'
                      : 'bg-[#FAF4E8] hover:bg-white border-l-3 border-[#8B2E1E] shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {item.type === 'unlock_success' && (
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        </span>
                      )}
                      {item.type === 'stamp_revoked' && (
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                          <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                        </span>
                      )}
                      {item.type === 'scan_error' && (
                        <span className="w-5 h-5 rounded-full bg-red-100 text-red-800 flex items-center justify-center shrink-0">
                          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                        </span>
                      )}
                      <span className="font-serif font-bold text-xs text-[#2D2723]">
                        {item.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-[#8C7A68]">
                        {formatTime(item.timestamp)}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteNotification(item.id)}
                        className="text-[#B3A494] hover:text-red-700 p-0.5 cursor-pointer"
                        title="Xóa log này"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#5D5246] leading-relaxed pl-6">
                    {item.message}
                  </p>

                  {/* Context Actions */}
                  {item.siteId && (
                    <div className="flex items-center gap-2 pl-6 pt-1">
                      <Link
                        to={`/map?highlightSite=${item.siteId}&unlocked=true`}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B2E1E] hover:underline"
                      >
                        <Compass className="w-3 h-3" />
                        <span>Xem vị trí trên bản đồ</span>
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#E8DECB] bg-[#F7F0E2]/80 text-center text-[11px] text-[#8C7A68]">
            Lịch sử tự động lưu trên trình duyệt của bạn
          </div>
        </div>
      )}
    </div>
  )
}
