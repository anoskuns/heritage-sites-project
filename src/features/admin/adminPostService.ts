import { supabase } from '../../services/supabase/client'
import type { AdminPostItem } from './types'

const LOCAL_ADMIN_POSTS_KEY = 'heritage_admin_posts_cache_v2'

function getLocalPosts(): AdminPostItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_ADMIN_POSTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AdminPostItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveLocalPosts(posts: AdminPostItem[]) {
  try {
    localStorage.setItem(LOCAL_ADMIN_POSTS_KEY, JSON.stringify(posts))
  } catch (err) {
    console.warn('[AdminPost] Failed to save posts locally:', err)
  }
}

/**
 * Fetches all posts for the admin moderation list.
 */
export async function fetchAllAdminPosts(): Promise<AdminPostItem[]> {
  const posts: AdminPostItem[] = []

  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        user_id,
        site_id,
        body,
        image_path,
        visibility,
        status,
        created_at,
        profiles (
          id,
          display_name,
          avatar_url,
          role
        ),
        heritage_sites (
          id,
          name_vi
        )
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      for (const p of data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyPost = p as any
        posts.push({
          id: anyPost.id,
          userId: anyPost.user_id,
          authorName: anyPost.profiles?.display_name || 'Thành viên',
          authorAvatar: anyPost.profiles?.avatar_url,
          authorRole: anyPost.profiles?.role || 'user',
          siteId: anyPost.site_id,
          siteName: anyPost.heritage_sites?.name_vi || null,
          body: anyPost.body,
          imagePath: anyPost.image_path,
          visibility: anyPost.visibility || 'public',
          status: anyPost.status || 'published',
          likesCount: 0,
          createdAt: anyPost.created_at,
        })
      }
    }
  } catch (err) {
    console.warn('[AdminPost] Error fetching remote posts:', err)
  }

  // Merge local posts
  const localPosts = getLocalPosts()
  const dbIds = new Set(posts.map((p) => p.id))
  const merged = [...posts, ...localPosts.filter((lp) => !dbIds.has(lp.id))]

  if (merged.length === 0) {
    // Seed an initial official announcement
    const defaultAnnouncement: AdminPostItem = {
      id: 'post-announcement-01',
      userId: 'admin-official',
      authorName: 'Ban Quản Trị Di Sản',
      authorAvatar: null,
      authorRole: 'admin',
      siteId: null,
      siteName: 'Toàn quốc',
      body: 'Chào mừng bạn đến với Hộ chiếu Số Di sản Văn hóa Việt Nam! Cổng thông tin và các trạm tem độc bản đã chính thức đi vào hoạt động trên cả nước.',
      imagePath: null,
      visibility: 'public',
      status: 'published',
      likesCount: 24,
      createdAt: new Date().toISOString(),
    }
    saveLocalPosts([defaultAnnouncement])
    return [defaultAnnouncement]
  }

  return merged
}

/**
 * Creates an official editorial announcement post from the Admin.
 */
export async function createOfficialAnnouncementPost(
  authorId: string,
  authorName: string,
  body: string,
  siteId?: string,
  imagePath?: string
): Promise<AdminPostItem> {
  const newPostId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `post-admin-${Date.now()}`

  const now = new Date().toISOString()
  const newPost: AdminPostItem = {
    id: newPostId,
    userId: authorId,
    authorName,
    authorRole: 'admin',
    siteId: siteId || null,
    body: body.trim(),
    imagePath: imagePath || null,
    visibility: 'public',
    status: 'published',
    likesCount: 0,
    createdAt: now,
  }

  // Try Supabase insert
  try {
    await supabase.from('posts').insert({
      user_id: authorId,
      site_id: siteId || null,
      body: body.trim(),
      image_path: imagePath || null,
      visibility: 'public',
      status: 'published',
    })
  } catch (err) {
    console.warn('[AdminPost] Cloud insert failed, saving locally:', err)
  }

  const locals = getLocalPosts()
  saveLocalPosts([newPost, ...locals])

  window.dispatchEvent(new CustomEvent('heritage_admin_posts_updated'))
  return newPost
}

/**
 * Updates a post status (publish, hide, delete).
 */
export async function updatePostStatus(
  postId: string,
  status: 'published' | 'hidden' | 'deleted'
): Promise<void> {
  try {
    await supabase.from('posts').update({ status }).eq('id', postId)
  } catch (err) {
    console.warn('[AdminPost] Cloud update failed:', err)
  }

  const locals = getLocalPosts()
  const updated = locals.map((p) => (p.id === postId ? { ...p, status } : p))
  saveLocalPosts(updated)

  window.dispatchEvent(new CustomEvent('heritage_admin_posts_updated'))
}

