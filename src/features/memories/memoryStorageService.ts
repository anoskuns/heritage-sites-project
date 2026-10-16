/**
 * Local Memory Storage Service
 * Provides offline & demo-mode fallback for user memory photos.
 * Compresses images to lightweight JPEG data URLs before caching in localStorage.
 * Ensures users can always upload personal photos at unlocked heritage sites.
 */

export interface LocalMemoryItem {
  id: string
  userId: string
  siteId: string
  imagePath: string
  caption: string | null
  signedUrl: string
  createdAt: string
  updatedAt: string
}

const MEMORIES_STORAGE_KEY = 'heritage_user_memories_v2'

/**
 * Compresses an image file using an HTML5 Canvas to a lightweight JPEG Data URL.
 * Resizes large photos to a max dimension of 1200px and sets compression quality to 0.8,
 * keeping file sizes ~100-200KB so multiple memories fit safely in browser storage.
 */
export async function compressImageToDataUrl(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target?.result as string
      if (!src) {
        resolve('')
        return
      }
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(src)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => resolve(src)
      img.src = src
    }
    reader.onerror = () => resolve('')
    reader.readAsDataURL(file)
  })
}

/**
 * Retrieves all stored local memories, optionally filtered by user ID and site ID.
 */
export function getLocalMemories(userId?: string, siteId?: string): LocalMemoryItem[] {
  try {
    const raw = localStorage.getItem(MEMORIES_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LocalMemoryItem[]
    if (!Array.isArray(parsed)) return []

    return parsed.filter((m) => {
      if (userId && m.userId && m.userId !== userId) return false
      if (siteId && m.siteId !== siteId) return false
      return true
    })
  } catch (err) {
    console.warn('[MemoryStorage] Failed to read local memories:', err)
    return []
  }
}

/**
 * Stores a new memory photo locally.
 */
export function saveLocalMemory(
  userId: string,
  siteId: string,
  dataUrl: string,
  caption?: string
): LocalMemoryItem {
  const current = getLocalMemories()

  const now = new Date().toISOString()
  const newMemory: LocalMemoryItem = {
    id: `local-mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId,
    siteId,
    imagePath: `local://${siteId}/${Date.now()}`,
    caption: caption?.trim() || null,
    signedUrl: dataUrl,
    createdAt: now,
    updatedAt: now,
  }

  try {
    const updated = [newMemory, ...current]
    localStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.warn('[MemoryStorage] Failed to save local memory to storage:', err)
  }

  return newMemory
}

/**
 * Deletes a local memory photo by its ID.
 */
export function deleteLocalMemory(memoryId: string, userId?: string): boolean {
  const current = getLocalMemories()
  const filtered = current.filter((m) => {
    if (m.id !== memoryId) return true
    if (userId && m.userId && m.userId !== userId) return true
    return false
  })

  const removed = filtered.length < current.length
  if (removed) {
    try {
      localStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(filtered))
    } catch (err) {
      console.warn('[MemoryStorage] Failed to update storage after memory deletion:', err)
    }
  }
  return removed
}

/**
 * Counts total local memories by site ID for a user.
 */
export function countAllLocalMemoriesByUser(userId?: string): Record<string, number> {
  const memories = getLocalMemories(userId)
  const map: Record<string, number> = {}
  for (const m of memories) {
    if (m.siteId) {
      map[m.siteId] = (map[m.siteId] || 0) + 1
    }
  }
  return map
}
