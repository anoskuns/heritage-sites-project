import { supabase } from '../supabase/client'

const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export interface UploadAvatarResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Validates an image file before upload.
 */
export function validateAvatarFile(file: File): { isValid: boolean; errorKey?: 'avatarSizeError' | 'avatarFormatError' } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { isValid: false, errorKey: 'avatarFormatError' }
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return { isValid: false, errorKey: 'avatarSizeError' }
  }

  return { isValid: true }
}

/**
 * Uploads a user avatar to Supabase Storage.
 * Attempts the dedicated 'avatars' bucket first; falls back to 'community-posts' if 'avatars' is not yet provisioned.
 */
export async function uploadAvatar(file: File, userId: string): Promise<UploadAvatarResult> {
  const validation = validateAvatarFile(file)
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.errorKey,
    }
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `avatar-${Date.now()}.${ext}`
  const filePath = `${userId}/${fileName}`

  // Attempt 1: Upload to 'avatars' bucket
  try {
    const { error: avatarsError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (!avatarsError) {
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
      return { success: true, url: urlData.publicUrl }
    }

    // If 'avatars' bucket does not exist or fails with bucket not found, fallback to 'community-posts'
    console.info('[Storage] Falling back to community-posts bucket for avatar upload:', avatarsError.message)
    const { error: fallbackError } = await supabase.storage
      .from('community-posts')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (fallbackError) {
      return {
        success: false,
        error: fallbackError.message,
      }
    }

    const { data: fallbackUrlData } = supabase.storage
      .from('community-posts')
      .getPublicUrl(filePath)

    return { success: true, url: fallbackUrlData.publicUrl }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown upload error'
    return { success: false, error: message }
  }
}

/**
 * Safely cleans up an old avatar from storage after a new one is committed.
 */
export async function deleteAvatarFile(avatarUrl: string, userId: string): Promise<void> {
  if (!avatarUrl || !avatarUrl.includes(userId)) {
    return
  }

  try {
    const isAvatarsBucket = avatarUrl.includes('/avatars/')
    const bucket = isAvatarsBucket ? 'avatars' : 'community-posts'
    const parts = avatarUrl.split(`/${bucket}/`)
    if (parts.length > 1) {
      const filePath = decodeURIComponent(parts[1])
      // Only delete if path belongs to this user
      if (filePath.startsWith(`${userId}/`)) {
        await supabase.storage.from(bucket).remove([filePath])
      }
    }
  } catch (err) {
    // Non-blocking cleanup failure
    console.warn('[Storage] Could not clean up old avatar:', err)
  }
}

