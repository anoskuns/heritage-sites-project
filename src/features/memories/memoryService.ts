import { supabase } from '../../services/supabase/client'
import type { Memory } from '../../types/database.types'
import type { MemoryWithUrl, UploadMemoryParams } from './types'
import {
  compressImageToDataUrl,
  getLocalMemories,
  saveLocalMemory,
  deleteLocalMemory,
} from './memoryStorageService'

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
 * combining both cloud Supabase records and offline/demo local memories.
 */
export async function fetchSiteMemories(
  siteId: string,
  userId: string
): Promise<MemoryWithUrl[]> {
  const remoteMemories: MemoryWithUrl[] = []

  try {
    const { data: records, error } = await supabase
      .from('memories')
      .select('*')
      .eq('site_id', siteId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error && records && records.length > 0) {
      const withUrls = await Promise.all(
        records.map(async (record: Memory) => {
          const { data: signedData } = await supabase.storage
            .from('memories')
            .createSignedUrl(record.image_path, 3600)

          return {
            ...record,
            signedUrl: signedData?.signedUrl || '',
          }
        })
      )
      remoteMemories.push(...withUrls)
    }
  } catch (err) {
    console.warn('[MemoryService] Cloud fetch failed, reading local memories:', err)
  }

  // Fetch persistent local memories for this user & site
  const localList = getLocalMemories(userId, siteId)
  const localMemories: MemoryWithUrl[] = localList.map((m) => ({
    id: m.id,
    user_id: m.userId,
    site_id: m.siteId,
    image_path: m.imagePath,
    caption: m.caption,
    created_at: m.createdAt,
    updated_at: m.updatedAt || m.createdAt,
    signedUrl: m.signedUrl,
  }))

  // Merge unique by id
  const remoteIds = new Set(remoteMemories.map((m) => m.id))
  const merged = [
    ...remoteMemories,
    ...localMemories.filter((l) => !remoteIds.has(l.id)),
  ]

  // Sort descending by created_at
  merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return merged
}

/**
 * Uploads a new memory photo with atomic rollback protection and graceful local fallback.
 * If database or storage fails (e.g. storage bucket missing or offline), safely stores to local cache.
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

  // Enforce max 3 photos per site
  const existingMemories = await fetchSiteMemories(siteId, userId)
  if (existingMemories.length >= 3) {
    throw new Error('MAX_MEMORIES_REACHED')
  }

  // 1. Build storage path: ${user.id}/${site.id}/${uuid}.${ext}
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileUuid =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2) + Date.now().toString(36)
  const filePath = `${userId}/${siteId}/${fileUuid}.${ext}`

  try {
    // 2. Step 1: Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('memories')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      throw uploadError
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
      throw insertError || new Error('Database insert failed')
    }

    // 5. Generate signed URL for immediate rendering
    const { data: signedData } = await supabase.storage
      .from('memories')
      .createSignedUrl(filePath, 3600)

    const result: MemoryWithUrl = {
      ...memoryRecord,
      signedUrl: signedData?.signedUrl || '',
    }

    // Notify other components (Passport, Map, Heritage Detail)
    window.dispatchEvent(
      new CustomEvent('heritage_memory_updated', {
        detail: { siteId, userId },
      })
    )

    return result
  } catch (err: unknown) {
    // If it was already a business logic error like MAX_MEMORIES_REACHED, bubble it up
    if (err instanceof Error && err.message === 'MAX_MEMORIES_REACHED') {
      throw err
    }

    console.warn('[MemoryService] Cloud upload failed, saving to local fallback:', err)

    // Fallback: Compress and save locally
    const dataUrl = await compressImageToDataUrl(file)
    const local = saveLocalMemory(userId, siteId, dataUrl, caption)

    const result: MemoryWithUrl = {
      id: local.id,
      user_id: local.userId,
      site_id: local.siteId,
      image_path: local.imagePath,
      caption: local.caption,
      created_at: local.createdAt,
      updated_at: local.updatedAt || local.createdAt,
      signedUrl: local.signedUrl,
    }

    window.dispatchEvent(
      new CustomEvent('heritage_memory_updated', {
        detail: { siteId, userId },
      })
    )

    return result
  }
}

/**
 * Deletes a memory from both remote cloud storage/DB and local fallback.
 */
export async function deleteSiteMemory(memory: MemoryWithUrl): Promise<void> {
  // 1. Try remote DB & storage deletion
  try {
    await supabase
      .from('memories')
      .delete()
      .eq('id', memory.id)
      .eq('user_id', memory.user_id)

    await supabase.storage.from('memories').remove([memory.image_path])
  } catch (remoteErr) {
    console.warn('[MemoryService] Cloud delete skipped/failed:', remoteErr)
  }

  // 2. Delete from local cache
  deleteLocalMemory(memory.id, memory.user_id)

  window.dispatchEvent(
    new CustomEvent('heritage_memory_updated', {
      detail: { siteId: memory.site_id, userId: memory.user_id },
    })
  )
}
