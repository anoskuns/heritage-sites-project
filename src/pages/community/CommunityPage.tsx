import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Users, AlertCircle, RefreshCw, Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '../../features/authentication'
import { useTranslation } from '../../i18n'
import {
  fetchCommunityPosts,
  togglePostLike,
  deleteCommunityPost,
  PostCard,
  type CommunityPostItem,
} from '../../features/community'

export function CommunityPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [posts, setPosts] = useState<CommunityPostItem[]>([])
  const [page, setPage] = useState<number>(1)
  const [hasMore, setHasMore] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    const timer = setTimeout(() => setToastMessage(null), 3500)
    return () => clearTimeout(timer)
  }, [])

  // Initial load
  const loadPosts = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const result = await fetchCommunityPosts(1, 10, user?.id)
      setPosts(result.posts)
      setHasMore(result.hasMore)
      setPage(1)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.errors.generic
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [user, t])

  useEffect(() => {
    let ignore = false
    async function init() {
      try {
        const result = await fetchCommunityPosts(1, 10, user?.id)
        if (!ignore) {
          setPosts(result.posts)
          setHasMore(result.hasMore)
          setPage(1)
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : t.errors.generic
          setErrorMessage(msg)
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    init()
    return () => {
      ignore = true
    }
  }, [user, t])

  // Load more pagination
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    const nextPage = page + 1

    try {
      const result = await fetchCommunityPosts(nextPage, 10, user?.id)
      setPosts((prev) => [...prev, ...result.posts])
      setHasMore(result.hasMore)
      setPage(nextPage)
    } catch (err: unknown) {
      console.warn('Failed to load more posts:', err)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Like toggle handler
  const handleLikeToggle = async (postId: string, newLikedState: boolean) => {
    if (!user) return
    await togglePostLike(postId, user.id, !newLikedState)
  }

  // Delete post handler
  const handleDeletePost = async (postId: string, imagePath?: string | null) => {
    if (!user) return
    await deleteCommunityPost(postId, user.id, imagePath)
    setPosts((prev) => prev.filter((p) => p.id !== postId))
    showToast(t.community.deleteSuccess)
  }

  const handleRequireAuth = () => {
    navigate('/auth?redirectTo=/community')
  }

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 p-3.5 rounded-2xl bg-gray-900 text-white text-xs font-semibold shadow-xl border border-gray-700 animate-in fade-in slide-in-from-top-3">
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-white p-6 sm:p-8 rounded-3xl shadow-md border border-amber-800/80">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-800/70 border border-amber-700 text-amber-200 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t.common.appName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.community.title}
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
            {t.community.subtitle}
          </p>
        </div>

        {/* Create Post CTA */}
        <Link
          to={user ? '/community/create' : '/auth?redirectTo=/community/create'}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-sm shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t.community.createPostCta}</span>
        </Link>
      </div>

      {/* Error State */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={loadPosts}
            className="font-semibold underline hover:no-underline cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.common.retry}</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-44 bg-white border border-gray-200/80 rounded-3xl p-6" />
          <div className="h-44 bg-white border border-gray-200/80 rounded-3xl p-6" />
          <div className="h-44 bg-white border border-gray-200/80 rounded-3xl p-6" />
        </div>
      ) : posts.length === 0 ? (
        /* Empty Feed */
        <div className="bg-white border border-gray-200/90 rounded-3xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-bold text-gray-900 text-base">
              {t.community.emptyFeed}
            </h3>
            <p className="text-xs text-gray-500">
              {t.community.subtitle}
            </p>
          </div>
          <Link
            to={user ? '/community/create' : '/auth?redirectTo=/community/create'}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.community.createPostCta}</span>
          </Link>
        </div>
      ) : (
        /* Feed List */
        <div className="space-y-5">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              onLikeToggle={handleLikeToggle}
              onDelete={handleDeletePost}
              onRequireAuth={handleRequireAuth}
            />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-2.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 active:scale-95 text-xs font-semibold text-gray-700 shadow-xs transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.community.loadingMore}</span>
                  </>
                ) : (
                  <span>{t.community.loadMore}</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
