import type {
  AdminQrItem,
  BatchQrGenerateParams,
  CollectionBatchItem,
  QrItemLifecycleStatus,
} from './types'
import { removeLocalUnlockedStamp } from '../passport/passportStorageService'
import { addNotification } from '../notifications/notificationService'

const LOCAL_QR_REGISTRY_KEY = 'heritage_admin_qr_registry_v2'
const LOCAL_BATCHES_REGISTRY_KEY = 'heritage_admin_batches_registry_v2'

/**
 * Computes SHA-256 hash of a string using Web Crypto API.
 */
export async function sha256(message: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  let hash = 0
  for (let i = 0; i < message.length; i++) {
    hash = (hash << 5) - hash + message.charCodeAt(i)
    hash |= 0
  }
  return `hash-${Math.abs(hash)}`
}

/**
 * Retrieves local Collection Batches.
 */
export function getLocalBatchesRegistry(): CollectionBatchItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_BATCHES_REGISTRY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CollectionBatchItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveLocalBatchesRegistry(batches: CollectionBatchItem[]): void {
  try {
    localStorage.setItem(LOCAL_BATCHES_REGISTRY_KEY, JSON.stringify(batches))
  } catch (err) {
    console.warn('[AdminQr] Failed to save batches registry:', err)
  }
}

/**
 * Retrieves local QR tokens registry.
 */
export function getLocalQrRegistry(): AdminQrItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_QR_REGISTRY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AdminQrItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveLocalQrRegistry(items: AdminQrItem[]): void {
  try {
    localStorage.setItem(LOCAL_QR_REGISTRY_KEY, JSON.stringify(items))
  } catch (err) {
    console.warn('[AdminQr] Failed to save local QR registry:', err)
  }
}

/**
 * Formats full unlock URL encoded into the physical QR code.
 */
export function formatQrUrl(token: string, baseUrl?: string): string {
  const base =
    baseUrl?.trim() ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://heritagedmst.vn')
  const cleanBase = base.replace(/\/+$/, '')
  return `${cleanBase}/unlock?token=${encodeURIComponent(token)}`
}

/**
 * Fetches all batches, seeding initial ones if empty.
 */
export async function fetchAllCollectionBatches(): Promise<CollectionBatchItem[]> {
  const local = getLocalBatchesRegistry()
  if (local.length > 0) return local

  const initialBatches: CollectionBatchItem[] = [
    {
      id: 'batch-hue-2026',
      nameVi: 'Bộ sưu tập Hoàng Cung Huế - Phiên bản Mùa Thu 2026',
      nameEn: 'Hue Imperial Palace Limited Edition - Autumn 2026',
      batchCode: 'HUE26',
      siteId: 'site-dai-noi-hue',
      siteSlug: 'dai-noi-hue',
      siteNameVi: 'Đại Nội Huế',
      totalQuantity: 200,
      claimedCount: 1,
      status: 'active',
      description: 'Huy hiệu đúc đồng mạ vàng giới hạn 200 bản dành cho du khách tham quan Đại Nội.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'batch-httl-2026',
      nameVi: 'Bộ sưu tập Hoàng Thành Thăng Long - Ngàn Năm Văn Hiến',
      nameEn: 'Thang Long Imperial Citadel - Millennium Edition',
      batchCode: 'HTTL26',
      siteId: 'site-hoang-thanh',
      siteSlug: 'hoang-thanh-thang-long',
      siteNameVi: 'Hoàng Thành Thăng Long',
      totalQuantity: 500,
      claimedCount: 0,
      status: 'printing',
      description: 'Phiên bản kỷ niệm 500 chiếc đang hoàn thiện tại xưởng chế tác thủ công.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  saveLocalBatchesRegistry(initialBatches)
  return initialBatches
}

/**
 * Fetches all generated QR items for management.
 */
export async function fetchAllAdminQrItems(): Promise<AdminQrItem[]> {
  const localItems = getLocalQrRegistry()
  if (localItems.length > 0) {
    return localItems
  }

  // Seed sample serialized merchandise items for testing
  const seedItems: AdminQrItem[] = [
    {
      id: 'qr-sample-01',
      batchId: 'batch-httl-2026',
      batchName: 'Bộ sưu tập Hoàng Thành Thăng Long - Ngàn Năm Văn Hiến',
      designId: 'design-httl',
      siteId: 'site-hoang-thanh',
      siteNameVi: 'Hoàng Thành Thăng Long',
      siteSlug: 'hoang-thanh-thang-long',
      serialCode: 'HTTL26-001/500',
      editionNumber: 1,
      editionTotal: 500,
      rawToken: 'DEMO-HTTL-01',
      qrTokenHash: 'hash-demo-httl-01',
      fullUrl: formatQrUrl('DEMO-HTTL-01'),
      status: 'printing',
      claimedByUserId: null,
      claimedByUserName: null,
      claimedAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'qr-sample-02',
      batchId: 'batch-hue-2026',
      batchName: 'Bộ sưu tập Hoàng Cung Huế - Phiên bản Mùa Thu 2026',
      designId: 'design-hue',
      siteId: 'site-dai-noi-hue',
      siteNameVi: 'Đại Nội Huế',
      siteSlug: 'dai-noi-hue',
      serialCode: 'HUE26-042/200',
      editionNumber: 42,
      editionTotal: 200,
      rawToken: 'DEMO-HUE-01',
      qrTokenHash: 'hash-demo-hue-01',
      fullUrl: formatQrUrl('DEMO-HUE-01'),
      status: 'claimed',
      claimedByUserId: 'usr-admin-001',
      claimedByUserName: 'Ban Quản Trị Di Sản',
      claimedAt: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'qr-sample-03',
      batchId: 'batch-hue-2026',
      batchName: 'Bộ sưu tập Hoàng Cung Huế - Phiên bản Mùa Thu 2026',
      designId: 'design-hue',
      siteId: 'site-dai-noi-hue',
      siteNameVi: 'Đại Nội Huế',
      siteSlug: 'dai-noi-hue',
      serialCode: 'HUE26-043/200',
      editionNumber: 43,
      editionTotal: 200,
      rawToken: 'DEMO-HUE-02',
      qrTokenHash: 'hash-demo-hue-02',
      fullUrl: formatQrUrl('DEMO-HUE-02'),
      status: 'available',
      claimedByUserId: null,
      claimedByUserName: null,
      claimedAt: null,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'qr-sample-04',
      designId: 'design-halong',
      siteId: 'site-vinh-ha-long',
      siteNameVi: 'Vịnh Hạ Long',
      siteSlug: 'vinh-ha-long',
      serialCode: 'HL26-0001',
      rawToken: 'DEMO-HALONG-01',
      qrTokenHash: 'hash-demo-halong-01',
      fullUrl: formatQrUrl('DEMO-HALONG-01'),
      status: 'available',
      claimedByUserId: null,
      claimedByUserName: null,
      claimedAt: null,
      createdAt: new Date().toISOString(),
    },
  ]

  saveLocalQrRegistry(seedItems)
  return seedItems
}

/**
 * Creates a new Collection Batch and simultaneously generates its unique physical tokens.
 */
export async function createCollectionBatch(params: {
  nameVi: string
  nameEn?: string
  siteId: string
  siteSlug: string
  siteNameVi: string
  batchCodePrefix: string
  totalQuantity: number
  description?: string
  baseUrl?: string
  initialStatus?: 'draft' | 'printing' | 'active'
}): Promise<{ batch: CollectionBatchItem; items: AdminQrItem[] }> {
  const {
    nameVi,
    nameEn,
    siteId,
    siteSlug,
    siteNameVi,
    batchCodePrefix,
    totalQuantity,
    description,
    baseUrl,
    initialStatus = 'draft',
  } = params

  const cleanPrefix = batchCodePrefix.trim().toUpperCase()
  const batchId = `batch-${siteSlug}-${cleanPrefix}-${Date.now()}`
  const now = new Date().toISOString()

  const newBatch: CollectionBatchItem = {
    id: batchId,
    batchCode: cleanPrefix,
    nameVi: nameVi.trim(),
    nameEn: nameEn?.trim() || undefined,
    siteId,
    siteSlug,
    siteNameVi,
    totalQuantity,
    claimedCount: 0,
    status: initialStatus,
    description: description?.trim(),
    createdAt: now,
    updatedAt: now,
  }

  // Generate tokens for this batch
  const itemsStatus: QrItemLifecycleStatus =
    initialStatus === 'active' ? 'available' : initialStatus

  const generatedItems: AdminQrItem[] = []
  for (let i = 1; i <= totalQuantity; i++) {
    const editionNumber = i
    const paddedIndex = String(i).padStart(totalQuantity >= 1000 ? 4 : 3, '0')
    const serialCode = `${cleanPrefix}-${paddedIndex}/${totalQuantity}`

    const randomNonce = Math.random().toString(36).substring(2, 6).toUpperCase()
    const rawToken = `${cleanPrefix}-${paddedIndex}-${randomNonce}`
    const tokenHash = await sha256(rawToken)
    const fullUrl = formatQrUrl(rawToken, baseUrl)

    generatedItems.push({
      id: `qr-${cleanPrefix}-${i}-${Date.now()}`,
      batchId,
      batchName: newBatch.nameVi,
      designId: `design-${siteSlug}`,
      siteId,
      siteNameVi,
      siteSlug,
      serialCode,
      editionNumber,
      editionTotal: totalQuantity,
      rawToken,
      qrTokenHash: tokenHash,
      fullUrl,
      status: itemsStatus,
      claimedByUserId: null,
      claimedByUserName: null,
      claimedAt: null,
      createdAt: now,
    })
  }

  // Save batch and items
  const batches = getLocalBatchesRegistry()
  saveLocalBatchesRegistry([newBatch, ...batches])

  const existingItems = getLocalQrRegistry()
  saveLocalQrRegistry([...generatedItems, ...existingItems])

  window.dispatchEvent(new CustomEvent('heritage_admin_qr_updated'))
  return { batch: newBatch, items: generatedItems }
}

/**
 * Updates a batch lifecycle status (e.g. from draft -> printing -> active).
 */
export function updateBatchStatus(
  batchId: string,
  newStatus: 'draft' | 'printing' | 'active' | 'archived'
): void {
  const batches = getLocalBatchesRegistry()
  const batchIndex = batches.findIndex((b) => b.id === batchId)
  if (batchIndex === -1) return

  batches[batchIndex].status = newStatus
  batches[batchIndex].updatedAt = new Date().toISOString()
  saveLocalBatchesRegistry(batches)

  // If transitioning batch to active, update its non-claimed items to available
  if (newStatus === 'active') {
    const items = getLocalQrRegistry()
    const updatedItems = items.map((item) => {
      if (item.batchId === batchId && (item.status === 'draft' || item.status === 'printing')) {
        return { ...item, status: 'available' as const }
      }
      return item
    })
    saveLocalQrRegistry(updatedItems)
  } else if (newStatus === 'printing') {
    const items = getLocalQrRegistry()
    const updatedItems = items.map((item) => {
      if (item.batchId === batchId && item.status === 'draft') {
        return { ...item, status: 'printing' as const }
      }
      return item
    })
    saveLocalQrRegistry(updatedItems)
  }

  window.dispatchEvent(new CustomEvent('heritage_admin_qr_updated'))
}

/**
 * Generates a batch of unique, single-claim physical QR codes for a heritage site.
 */
export async function generateBatchQrCodes(
  params: BatchQrGenerateParams
): Promise<AdminQrItem[]> {
  const { siteId, siteSlug, siteNameVi, prefix, quantity, baseUrl, batchName, status = 'available' } = params
  const cleanPrefix = prefix.trim().toUpperCase()
  const generatedItems: AdminQrItem[] = []

  const existing = getLocalQrRegistry()
  const existingWithPrefix = existing.filter((e) => e.serialCode.startsWith(cleanPrefix))
  const startNumber = existingWithPrefix.length + 1
  const now = new Date().toISOString()

  for (let i = 0; i < quantity; i++) {
    const serialIndex = startNumber + i
    const serialCode = `${cleanPrefix}${String(serialIndex).padStart(4, '0')}`

    const randomNonce = Math.random().toString(36).substring(2, 6).toUpperCase()
    const rawToken = `${serialCode}-${randomNonce}`
    const tokenHash = await sha256(rawToken)
    const fullUrl = formatQrUrl(rawToken, baseUrl)

    const qrItem: AdminQrItem = {
      id: `qr-${serialCode}-${Date.now()}`,
      batchName: batchName?.trim() || undefined,
      designId: `design-${siteSlug}`,
      siteId,
      siteNameVi,
      siteSlug,
      serialCode,
      rawToken,
      qrTokenHash: tokenHash,
      fullUrl,
      status,
      claimedByUserId: null,
      claimedByUserName: null,
      claimedAt: null,
      createdAt: now,
    }

    generatedItems.push(qrItem)
  }

  const updatedRegistry = [...generatedItems, ...existing]
  saveLocalQrRegistry(updatedRegistry)

  window.dispatchEvent(new CustomEvent('heritage_admin_qr_updated'))
  return generatedItems
}

/**
 * Performs admin reset or revocation with full real-time user notification and passport sync.
 */
export async function adminResetOrRevokeQrItem(
  itemId: string,
  mode: 'reset_available' | 'revoke_void',
  reason?: string
): Promise<{ success: boolean; affectedUserId?: string | null }> {
  const items = getLocalQrRegistry()
  const itemIndex = items.findIndex((i) => i.id === itemId)
  if (itemIndex === -1) return { success: false }

  const item = items[itemIndex]
  const prevOwnerId = item.claimedByUserId
  const now = new Date().toISOString()

  // 1. If previously owned, revoke stamp from user's passport
  if (prevOwnerId) {
    removeLocalUnlockedStamp(item.siteId, prevOwnerId)

    // Send push notification to user's Bell
    addNotification({
      type: 'stamp_revoked',
      title:
        mode === 'reset_available'
          ? 'Con dấu di sản đã được hoàn trả kho'
          : 'Mã lưu niệm độc bản đã bị thu hồi',
      message:
        reason?.trim() ||
        (mode === 'reset_available'
          ? `Con dấu di sản "${item.siteNameVi}" (Mã #${item.serialCode}) đã được Ban Quản Trị đặt lại trạng thái kho phát hành.`
          : `Mã lưu niệm "${item.serialCode}" liên kết địa danh "${item.siteNameVi}" đã bị thu hồi bởi Ban Quản Trị.`),
      siteId: item.siteId,
      siteSlug: item.siteSlug,
      siteName: item.siteNameVi,
      rawToken: item.rawToken,
    })

    // Dispatch global event for instant UI removal in Passport and Map
    window.dispatchEvent(
      new CustomEvent('passport_stamp_revoked', {
        detail: {
          siteId: item.siteId,
          siteSlug: item.siteSlug,
          serialCode: item.serialCode,
          userId: prevOwnerId,
        },
      })
    )
  }

  // 2. Update item state
  if (mode === 'reset_available') {
    items[itemIndex] = {
      ...item,
      status: 'available',
      claimedByUserId: null,
      claimedByUserName: null,
      claimedAt: null,
      revokedAt: null,
    }
  } else {
    items[itemIndex] = {
      ...item,
      status: 'revoked',
      revokedAt: now,
    }
  }

  saveLocalQrRegistry(items)

  // 3. Update Batch claimedCount if part of a batch
  if (item.batchId) {
    const batches = getLocalBatchesRegistry()
    const batchIndex = batches.findIndex((b) => b.id === item.batchId)
    if (batchIndex !== -1) {
      const batchItems = items.filter((it) => it.batchId === item.batchId)
      batches[batchIndex].claimedCount = batchItems.filter((it) => it.status === 'claimed').length
      saveLocalBatchesRegistry(batches)
    }
  }

  window.dispatchEvent(new CustomEvent('heritage_admin_qr_updated'))
  return { success: true, affectedUserId: prevOwnerId }
}

/**
 * Revokes a QR code.
 */
export async function revokeQrItem(id: string): Promise<void> {
  await adminResetOrRevokeQrItem(id, 'revoke_void')
}

/**
 * Reactivates or resets a QR code back to available.
 */
export async function reactivateQrItem(id: string): Promise<void> {
  await adminResetOrRevokeQrItem(id, 'reset_available')
}

/**
 * Marks a QR token as claimed by a user (used by local unlock flow).
 */
export function claimLocalQrItem(
  rawToken: string,
  userId: string,
  userName?: string
): AdminQrItem | null {
  const items = getLocalQrRegistry()
  const matchIndex = items.findIndex(
    (item) => item.rawToken.toUpperCase() === rawToken.trim().toUpperCase()
  )

  if (matchIndex === -1) return null

  const target = items[matchIndex]
  if (target.status === 'claimed' && target.claimedByUserId && target.claimedByUserId !== userId) {
    return null
  }

  const updated: AdminQrItem = {
    ...target,
    status: 'claimed',
    claimedByUserId: userId,
    claimedByUserName: userName || 'Người dùng đã xác nhận',
    claimedAt: new Date().toISOString(),
  }

  items[matchIndex] = updated
  saveLocalQrRegistry(items)

  // Update batch claimedCount
  if (target.batchId) {
    const batches = getLocalBatchesRegistry()
    const batchIndex = batches.findIndex((b) => b.id === target.batchId)
    if (batchIndex !== -1) {
      batches[batchIndex].claimedCount += 1
      saveLocalBatchesRegistry(batches)
    }
  }

  window.dispatchEvent(new CustomEvent('heritage_admin_qr_updated'))
  return updated
}

/**
 * Exports QR tokens to a CSV string format suitable for print shops.
 */
export function exportQrItemsToCsv(items: AdminQrItem[], batchTitle?: string): string {
  const headers = [
    'Serial Code',
    'Batch/Collection',
    'Site Name',
    'Slug',
    'Token Nonce',
    'Full Unlock URL',
    'Status',
    'Edition Number',
    'Total Edition',
    'Created At',
  ]
  const rows = items.map((item) => [
    `"${item.serialCode}"`,
    `"${item.batchName || batchTitle || 'Mặc định'}"`,
    `"${item.siteNameVi}"`,
    `"${item.siteSlug}"`,
    `"${item.rawToken}"`,
    `"${item.fullUrl}"`,
    `"${item.status}"`,
    `"${item.editionNumber || ''}"`,
    `"${item.editionTotal || ''}"`,
    `"${item.createdAt}"`,
  ])

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}
