import { supabase } from '../../services/supabase/client'
import type { Memory } from '../../types/database.types'
import type { MemoryWithUrl, UploadMemoryParams } from './types'

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

/**
 * Validates file type and size using JavaScript before network upload.
 * Do not rely solely on the HTML <input accept="..."> attribute.
 */
export function validateMemoryFile(file: File): { valid: boolean; errorCode?: 'INVALID_FORMAT' | 'FILE_TOO_LARGE' } {
  // 1. Validate MIME type
  const mimeValid = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  const extValid = ALLOWED_EXTENSIONS.includes(ext)

  if (!mimeValid || !extValid) {
    return { valid: false, errorCode: 'INVALID_FORMAT' }
  }

  // 2. Validate file size (<= 5MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, errorCode: 'FILE_TOO_LARGE' }
  }

  return { valid: true }
}

/**
 * Fetches all memories for a user at a specific heritage site,
 * generating private signed URLs for each image (expiry 1 hour).
 */
export async function fetchSiteMemories(
  siteId: string,
  userId: string
): Promise<MemoryWithUrl[]> {
  const { data: records, error } = await supabase
    .from('memories')
    .select('*')
    .eq('site_id', siteId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  if (!records || records.length === 0) {
    return []
  }

  // Generate signed URLs in parallel for the private objects
  const withUrls = await Promise.all(
    records.map(async (record: Memory) => {
      const { data: signedData, error: signedError } = await supabase.storage
        .from('memories')
        .createSignedUrl(record.image_path, 3600)

      return {
        ...record,
        signedUrl: signedError || !signedData ? '' : signedData.signedUrl,
      }
    })
  )

  return withUrls
}

/**
 * Uploads a new memory photo with atomic rollback protection.
 * If database INSERT fails, the uploaded storage file is immediately deleted
 * to prevent orphaned objects.
 */
export async function uploadSiteMemory({
  file,
  caption,
  siteId,
  userId,
}: UploadMemoryParams): Promise<MemoryWithUrl> {
  // Pre-upload validation
  const validation = validateMemoryFile(file)
  if (!validation.valid) {
    throw new Error(validation.errorCode)
  }

  // 1. Build storage path: ${user.id}/${site.id}/${uuid}.${ext}
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileUuid = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2) + Date.now().toString(36)
  const filePath = `${userId}/${siteId}/${fileUuid}.${ext}`

  // 2. Step 1: Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('memories')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  // 3. Step 2: Insert into database memories table
  const { data: memoryRecord, error: insertError } = await supabase
    .from('memories')
    .insert({
      user_id: userId,
      site_id: siteId,
      image_path: filePath,
      caption: caption?.trim() || null,
    })
    .select()
    .single()

  // 4. CRITICAL ROLLBACK: If DB insert fails (e.g. trigger limit of 3 exceeded, or network issue),
  // delete the uploaded file immediately to prevent orphan file
  if (insertError || !memoryRecord) {
    try {
      await supabase.storage.from('memories').remove([filePath])
    } catch (cleanupErr) {
      console.error('Failed to cleanup orphan file from storage after insert failure:', cleanupErr)
    }

    if (insertError?.message?.includes('MAX_MEMORIES_REACHED')) {
      throw new Error('MAX_MEMORIES_REACHED')
    }
    throw new Error(insertError?.message || 'Database insert failed')
  }

  // 5. Generate signed URL for immediate rendering
  const { data: signedData } = await supabase.storage
    .from('memories')
    .createSignedUrl(filePath, 3600)

  return {
    ...memoryRecord,
    signedUrl: signedData?.signedUrl || '',
  }
}

/**
 * Deletes a memory from both the database and Supabase Storage.
 */
export async function deleteSiteMemory(memory: MemoryWithUrl): Promise<void> {
  // 1. Delete database record
  const { error: dbError } = await supabase
    .from('memories')
    .delete()
    .eq('id', memory.id)
    .eq('user_id', memory.user_id)

  if (dbError) {
    throw new Error(dbError.message)
  }

  // 2. Delete file from storage
  const { error: storageError } = await supabase.storage
    .from('memories')
    .remove([memory.image_path])

  if (storageError) {
    console.warn('Warning: Storage file deletion failed:', storageError.message)
  }
}

