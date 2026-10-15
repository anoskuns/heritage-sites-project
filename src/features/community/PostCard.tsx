import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2, MapPin, Calendar, AlertTriangle, Loader2 } from 'lucide-react'
import { useTranslation } from '../../i18n'
import type { CommunityPostItem } from './types'

interface PostCardProps {
  post: CommunityPostItem
  currentUserId?: string
  onLikeToggle: (postId: string, newLikedState: boolean) => Promise<void>
  onDelete: (postId: string, imagePath?: string | null) => Promise<void>
  onRequireAuth: () => void
}

export function PostCard({
  post,
  currentUserId,
  onLikeToggle,
  onDelete,
  onRequireAuth,
}: PostCardProps) {
  const { t, language } = useTranslation()

  // Local optimistic like state
  const [isLiked, setIsLiked] = useState<boolean>(post.isLikedByMe)
  const [likesCount, setLikesCount] = useState<number>(post.likesCount)
  const [isLiking, setIsLiking] = useState<boolean>(false)

  // Delete modal state
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const isOwner = Boolean(currentUserId && currentUserId === post.userId)

  const handleLikeClick = async () => {
    if (!currentUserId) {
      onRequireAuth()
      return
    }

    if (isLiking) return

    const nextState = !isLiked
    const nextCount = nextState ? likesCount + 1 : Math.max(0, likesCount - 1)

    // Optimistic update
    setIsLiked(nextState)
    setLikesCount(nextCount)
    setIsLiking(true)

    try {
      await onLikeToggle(post.id, nextState)
    } catch (err) {
      // Revert on failure
      console.warn('Like toggle failed:', err)
      setIsLiked(!nextState)
      setLikesCount(likesCount)
    } finally {
      setIsLiking(false)
    }
  }

  const handleDeleteClick = async () => {
    setIsDeleting(true)
    try {
      await onDelete(post.id, post.imagePath)
      setIsConfirmDeleteOpen(false)
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const siteName = post.heritageSite
    ? language === 'vi'
      ? post.heritageSite.nameVi
      : post.heritageSite.nameEn
    : null

  const authorInitial = post.author.displayName.charAt(0).toUpperCase() || 'U'

  return (
    <article className="bg-white rounded-3xl border border-gray-200/90 shadow-xs hover:shadow-sm transition-all overflow-hidden p-5 sm:p-6 space-y-4">
      {/* Header: Author & Options */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-full overflow-hidden bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
            {post.author.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-bold text-amber-900 text-sm">
                {authorInitial}
              </span>
            )}
          </div>

          {/* Author Name and Timestamp */}
          <div className="space-y-0.5">
            <h4 className="font-bold text-gray-900 text-sm leading-tight">
              {post.author.displayName}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(post.createdAt).toLocaleDateString(
                    language === 'vi' ? 'vi-VN' : 'en-US',
                    {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }
                  )}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Delete button (Visible ONLY to post author) */}
        {isOwner && (
          <button
            type="button"
            onClick={() => setIsConfirmDeleteOpen(true)}
            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            title={t.community.deletePost}
            aria-label={t.community.deletePost}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tagged Heritage Site Badge (if any) */}
      {post.heritageSite && siteName && (
        <div className="pt-0.5">
          <Link
            to={`/heritage/${post.heritageSite.slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>{siteName}</span>
          </Link>
        </div>
      )}

      {/* Post Text Body */}
      <div className="text-sm sm:text-base text-gray-800 leading-relaxed whitespace-pre-line">
        {post.body}
      </div>

      {/* Attached Photo */}
      {post.imageUrl && (
        <div className="rounded-2xl overflow-hidden border border-gray-100 max-h-96 w-full bg-gray-100">
          <img
            src={post.imageUrl}
            alt="Community post media"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Footer: Like Action Bar */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <button
          type="button"
          onClick={handleLikeClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none active:scale-95 ${
            isLiked
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform duration-150 ${
              isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-gray-500'
            }`}
          />
          <span>
            {likesCount} {isLiked ? t.community.liked : t.community.like}
          </span>
        </button>

        <span className="text-[11px] text-gray-400">
          {t.common.appName}
        </span>
      </div>

      {/* Delete Confirmation Modal */}
      {isConfirmDeleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="alertdialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-bold text-gray-900 text-base">
                {t.community.deletePost}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t.community.deleteConfirm}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-100 disabled:opacity-50 cursor-pointer transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:bg-gray-400"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.common.loading}</span>
                  </>
                ) : (
                  <span>{t.common.delete}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

