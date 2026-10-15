import { supabase } from '../../services/supabase/client'
import type { CommunityPostItem, CreatePostParams, AttachedHeritageSite } from './types'

export const ALLOWED_POST_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp']
export const ALLOWED_POST_IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp']
export const MAX_POST_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

export function validatePostImage(file: File): { valid: boolean; error?: 'INVALID_FORMAT' | 'FILE_TOO_LARGE' } {
  const mime = file.type.toLowerCase()
  const ext = file.name.split('.').pop()?.toLowerCase() || ''

  if (!ALLOWED_POST_IMAGE_MIMES.includes(mime) || !ALLOWED_POST_IMAGE_EXTS.includes(ext)) {
    return { valid: false, error: 'INVALID_FORMAT' }
  }

  if (file.size > MAX_POST_IMAGE_SIZE) {
    return { valid: false, error: 'FILE_TOO_LARGE' }
  }

  return { valid: true }
}

export interface FetchPostsResult {
  posts: CommunityPostItem[]
  hasMore: boolean
  totalCount: number
}

/**
 * Fetches published public community posts in reverse chronological order with pagination.
 */
export async function fetchCommunityPosts(
  page = 1,
  pageSize = 10,
  currentUserId?: string
): Promise<FetchPostsResult> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('posts')
    .select(
      `
      id,
      user_id,
      site_id,
      body,
      image_path,
      visibility,
      status,
      created_at,
      updated_at,
      profiles:user_id (
        id,
        display_name,
        avatar_url
      ),
      heritage_sites:site_id (
        id,
        slug,
        name_vi,
        name_en
      ),
      post_likes (
        id,
        user_id
      )
    `,
      { count: 'exact' }
    )
    .eq('visibility', 'public')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  const rawPosts = data || []
  const totalCount = count || 0
  const hasMore = totalCount > to + 1

  const posts: CommunityPostItem[] = rawPosts.map((row) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyRow = row as any

    // Resolve author
    const authorProfile = anyRow.profiles
    const author = {
      id: authorProfile?.id || row.user_id,
      displayName: authorProfile?.display_name || 'Traveler',
      avatarUrl: authorProfile?.avatar_url || null,
    }

    // Resolve attached heritage site
    const siteRaw = anyRow.heritage_sites
    let heritageSite: AttachedHeritageSite | null = null
    if (siteRaw) {
      heritageSite = {
        id: siteRaw.id,
        slug: siteRaw.slug,
        nameVi: siteRaw.name_vi,
        nameEn: siteRaw.name_en,
      }
    }

    // Resolve image URL from public bucket
    let imageUrl: string | null = null
    if (row.image_path) {
      if (row.image_path.startsWith('http://') || row.image_path.startsWith('https://')) {
        imageUrl = row.image_path
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('community-posts')
          .getPublicUrl(row.image_path)
        imageUrl = publicUrlData?.publicUrl || null
      }
    }

    // Resolve likes
    const likesList: { id: string; user_id: string }[] = anyRow.post_likes || []
    const likesCount = likesList.length
    const isLikedByMe = currentUserId
      ? likesList.some((like) => like.user_id === currentUserId)
      : false

    return {
      id: row.id,
      userId: row.user_id,
      siteId: row.site_id,
      body: row.body,
      imagePath: row.image_path,
      imageUrl,
      visibility: row.visibility,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      author,
      heritageSite,
      likesCount,
      isLikedByMe,
    }
  })

  return {
    posts,
    hasMore,
    totalCount,
  }
}

/**
 * Toggles like on a post.
 */
export async function togglePostLike(
  postId: string,
  userId: string,
  currentlyLiked: boolean
): Promise<void> {
  if (currentlyLiked) {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: userId,
      })

    if (error) throw new Error(error.message)
  }
}

/**
 * Creates a new community post with optional image upload and rollback safety.
 */
export async function createCommunityPost({
  userId,
  body,
  siteId,
  imageFile,
}: CreatePostParams): Promise<string> {
  const trimmedBody = body.trim()
  if (trimmedBody.length < 5) {
    throw new Error('MIN_CHARACTERS')
  }

  let uploadedPath: string | null = null

  // 1. If image attached, validate and upload
  if (imageFile) {
    const validation = validatePostImage(imageFile)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const uuid = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2) + Date.now().toString(36)
    const filePath = `${userId}/${uuid}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('community-posts')
      .upload(filePath, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      })

    if (uploadError) {
      throw new Error(uploadError.message)
    }

    uploadedPath = filePath
  }

  // 2. Insert into posts table
  const { data: insertedPost, error: insertError } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      site_id: siteId || null,
      body: trimmedBody,
      image_path: uploadedPath,
      visibility: 'public',
      status: 'published',
    })
    .select('id')
    .single()

  // 3. Rollback if insert fails
  if (insertError || !insertedPost) {
    if (uploadedPath) {
      try {
        await supabase.storage.from('community-posts').remove([uploadedPath])
      } catch (err) {
        console.warn('Failed to cleanup post image after DB error:', err)
      }
    }
    throw new Error(insertError?.message || 'Failed to create post')
  }

  return insertedPost.id
}

/**
 * Deletes a post authored by the user and cleans up its storage image.
 */
export async function deleteCommunityPost(
  postId: string,
  userId: string,
  imagePath?: string | null
): Promise<void> {
  const { error: dbError } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', userId)

  if (dbError) {
    throw new Error(dbError.message)
  }

  if (imagePath && !imagePath.startsWith('http')) {
    try {
      await supabase.storage.from('community-posts').remove([imagePath])
    } catch (err) {
      console.warn('Failed to delete post image from storage:', err)
    }
  }
}

/**
 * Fetches published heritage sites for the site selector dropdown.
 */
export async function fetchPublishedSitesForSelect(): Promise<AttachedHeritageSite[]> {
  const { data, error } = await supabase
    .from('heritage_sites')
    .select('id, slug, name_vi, name_en')
    .eq('is_published', true)
    .order('name_vi', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map((s) => ({
    id: s.id,
    slug: s.slug,
    nameVi: s.name_vi,
    nameEn: s.name_en,
  }))
}

