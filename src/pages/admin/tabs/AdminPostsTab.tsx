import React, { useState } from 'react'
import {
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Send,
  Sparkles,
  ShieldCheck,
  Heart,
  X,
} from 'lucide-react'
import type { AdminPostItem } from '../../../features/admin'
import {
  createOfficialAnnouncementPost,
  updatePostStatus,
} from '../../../features/admin'
import { useAuth } from '../../../features/authentication'

interface AdminPostsTabProps {
  posts: AdminPostItem[]
  onRefresh: () => void
}

export function AdminPostsTab({ posts, onRefresh }: AdminPostsTabProps) {
  const { user, profile } = useAuth()

  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'hidden'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newBody, setNewBody] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredPosts = posts.filter((p) => {
    if (filterStatus === 'all') return true
    return p.status === filterStatus
  })

  const handleToggleStatus = async (post: AdminPostItem) => {
    const nextStatus = post.status === 'published' ? 'hidden' : 'published'
    try {
      await updatePostStatus(post.id, nextStatus)
      onRefresh()
    } catch (err) {
      console.error('Failed to update post status:', err)
    }
  }

  const handleDelete = async (post: AdminPostItem) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa bài viết của "${post.authorName}" không?`
    )
    if (!confirmed) return

    try {
      await updatePostStatus(post.id, 'deleted')
      onRefresh()
    } catch (err) {
      console.error('Failed to delete post:', err)
    }
  }

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBody.trim() || !user) return

    setIsSubmitting(true)
    try {
      await createOfficialAnnouncementPost(
        user.id,
        profile?.display_name || 'Ban Quản Trị Di Sản',
        newBody
      )
      setNewBody('')
      setIsModalOpen(false)
      onRefresh()
    } catch (err) {
      console.error('Failed to create announcement:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top action bar */}
      <div className="bg-white border border-[#E8DECB] rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'all'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Tất cả bài viết ({posts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'published'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Đang hiển thị
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('hidden')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'hidden'
                ? 'bg-white text-amber-800 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Đã ẩn / Vi phạm
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#8B2E1E] to-[#6A1E14] hover:from-[#732619] hover:to-[#571910] text-[#F7F0E2] font-serif font-bold text-xs sm:text-sm border border-[#D6AD60] shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4 text-[#F4E1BA]" />
          <span>Đăng Thông Báo Mới (BQT)</span>
        </button>
      </div>

      {/* Posts List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-gray-400 bg-white border border-[#E8DECB] rounded-2xl">
            Không có bài viết nào phù hợp.
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-[#E8DECB] rounded-2xl p-5 shadow-2xs space-y-3 hover:border-[#D6AD60]/60 transition-colors"
            >
              {/* Header: Author info & Status */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B2E1E] to-[#6A1E14] text-[#F4E1BA] font-bold text-xs flex items-center justify-center">
                    {post.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#2D2723]">
                        {post.authorName}
                      </span>
                      {post.authorRole === 'admin' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#8B2E1E] text-white px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3 text-[#D6AD60]" />
                          <span>BQT Di Sản</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString('vi-VN')} {post.siteName ? `• Tại: ${post.siteName}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      post.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800'
                        : post.status === 'hidden'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {post.status === 'published'
                      ? 'Hiển thị'
                      : post.status === 'hidden'
                      ? 'Đã ẩn'
                      : 'Đã xóa'}
                  </span>
                </div>
              </div>

              {/* Body */}
              <p className="text-xs sm:text-sm text-[#4A3B32] leading-relaxed whitespace-pre-line">
                {post.body}
              </p>

              {/* Footer Actions */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                  <span>{post.likesCount} lượt thích</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(post)}
                    className="py-1 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                  >
                    {post.status === 'published' ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                        <span>Ẩn bài</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mở hiển thị</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(post)}
                    className="py-1 px-2.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FAF6EE] border-2 border-[#D6AD60] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DECB] pb-3">
              <h3 className="text-base font-serif font-bold text-[#2D2723] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8B2E1E]" />
                <span>Đăng Thông Báo Chính Thức Từ BQT</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5D5246] mb-1">
                  Nội dung thông báo / Bản tin di sản *
                </label>
                <textarea
                  required
                  rows={5}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Nhập nội dung cập nhật hoạt động, tin tức di sản hoặc thông báo phát hành con dấu mới..."
                  className="w-full p-3.5 rounded-xl border border-[#D6AD60]/60 bg-white text-xs sm:text-sm text-[#2D2723] focus:ring-2 focus:ring-[#8B2E1E] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newBody.trim()}
                  className="py-2 px-5 rounded-xl bg-gradient-to-r from-[#8B2E1E] to-[#6A1E14] text-[#F7F0E2] font-serif font-bold text-xs sm:text-sm border border-[#D6AD60] shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5 text-[#F4E1BA]" />
                  <span>{isSubmitting ? 'Đang gửi...' : 'Đăng Ngay'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
