import { supabase } from '../../services/supabase/client'
import {
  saveLocalUnlockedStamp,
  removeLocalUnlockedStamp,
  clearAllLocalStamps,
  isSiteUnlockedLocally,
  purgeThangLongStrayCache,
} from '../passport/passportStorageService'
import { getLocalQrRegistry, claimLocalQrItem } from '../admin/adminQrService'
import { addNotification } from '../notifications/notificationService'
import type {
  PreviewQrTokenResponse,
  UnlockHeritageSiteResponse,
  DemoTokenFixture,
} from './types'

/**
 * Official test fixtures aligned with supabase/seed.sql for testing and demonstration.
 * Includes Northern, Central, and TP. Hồ Chí Minh heritage sites.
 */
export const DEMO_TOKENS: DemoTokenFixture[] = [
  {
    rawToken: 'DHP-THANGLONG-2026-TEST01',
    siteSlug: 'hoang-thanh-thang-long',
    siteNameVi: 'Hoàng thành Thăng Long',
    siteNameEn: 'Imperial Citadel of Thang Long',
    status: 'active',
    descriptionVi: 'Hà Nội — Di sản Văn hóa Thế giới UNESCO (2010)',
    descriptionEn: 'Hanoi — UNESCO World Heritage Site (2010)',
  },
  {
    rawToken: 'DHP-HOIAN-2026-TEST02',
    siteSlug: 'pho-co-hoi-an',
    siteNameVi: 'Phố cổ Hội An',
    siteNameEn: 'Hoi An Ancient Town',
    status: 'active',
    descriptionVi: 'Quảng Nam — Di sản Văn hóa Thế giới UNESCO (1999)',
    descriptionEn: 'Quang Nam — UNESCO World Heritage Site (1999)',
  },
  {
    rawToken: 'DHP-HUE-2026-TEST03',
    siteSlug: 'dai-noi-hue',
    siteNameVi: 'Quần thể di tích Cố đô Huế',
    siteNameEn: 'Complex of Hue Monuments',
    status: 'active',
    descriptionVi: 'Thừa Thiên Huế — Di sản Văn hóa Thế giới UNESCO (1993)',
    descriptionEn: 'Thua Thien Hue — UNESCO World Heritage Site (1993)',
  },
  {
    rawToken: 'DHP-HALONG-2026-TEST04',
    siteSlug: 'vinh-ha-long',
    siteNameVi: 'Vịnh Hạ Long',
    siteNameEn: 'Ha Long Bay',
    status: 'active',
    descriptionVi: 'Quảng Ninh — Di sản Thiên nhiên Thế giới UNESCO (1994, 2000)',
    descriptionEn: 'Quang Ninh — UNESCO World Natural Heritage Site (1994, 2000)',
  },
  {
    rawToken: 'DHP-DINHDOCLAP-2026-TEST05',
    siteSlug: 'dinh-doc-lap',
    siteNameVi: 'Dinh Độc Lập',
    siteNameEn: 'Independence Palace',
    status: 'active',
    descriptionVi: 'TP. Hồ Chí Minh — Di tích Lịch sử Quốc gia đặc biệt',
    descriptionEn: 'Ho Chi Minh City — Special National Historical Relic',
  },
  {
    rawToken: 'DHP-BUUDIEN-2026-TEST07',
    siteSlug: 'buu-dien-trung-tam-sai-gon',
    siteNameVi: 'Bưu điện Trung tâm Sài Gòn',
    siteNameEn: 'Saigon Central Post Office',
    status: 'active',
    descriptionVi: 'TP. Hồ Chí Minh — Kiến trúc Pháp cổ điển hơn 130 năm',
    descriptionEn: 'Ho Chi Minh City — Classic French Colonial Landmark',
  },
  {
    rawToken: 'DHP-REVOKED-2026-TEST06',
    siteSlug: 'hoang-thanh-thang-long',
    siteNameVi: 'Mã đã thu hồi (Test lỗi)',
    siteNameEn: 'Revoked Token (Test Error)',
    status: 'revoked',
    descriptionVi: 'Kiểm tra lỗi REVOKED_TOKEN theo PRD',
    descriptionEn: 'Test REVOKED_TOKEN error handling according to PRD',
  },
]

/**
 * Fallback site preview resolver for demo fixtures when RPC fails or is unavailable.
 */
async function resolveDemoTokenPreview(
  fixture: DemoTokenFixture
): Promise<PreviewQrTokenResponse> {
  if (fixture.status === 'revoked') {
    return {
      success: false,
      error_code: 'REVOKED_TOKEN',
      message: 'This QR code has been revoked',
    }
  }

  try {
    const { data: site, error } = await supabase
      .from('heritage_sites')
      .select('*')
      .eq('slug', fixture.siteSlug)
      .single()

    if (error || !site) {
      return {
        success: false,
        error_code: 'INVALID_TOKEN',
        message: 'Site not found for demo token',
      }
    }

    // Check unlock status
    let isUnlocked = false
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: entry } = await supabase
        .from('passport_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('site_id', site.id)
        .maybeSingle()
      isUnlocked = !!entry || isSiteUnlockedLocally(site.id, user.id)
    } else {
      isUnlocked = false
    }

    return {
      success: true,
      site: {
        id: site.id,
        slug: site.slug,
        name_vi: site.name_vi,
        name_en: site.name_en,
        story_vi: site.story_vi || '',
        story_en: site.story_en || '',
        description_vi: site.description_vi,
        description_en: site.description_en,
        latitude: site.latitude,
        longitude: site.longitude,
        cover_image_url: site.cover_image_url,
        audio_url: site.audio_url,
      },
      is_unlocked: isUnlocked,
      pin_item_id: `demo-pin-${site.slug}`,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error resolving demo token preview'
    return {
      success: false,
      error_code: 'INVALID_TOKEN',
      message,
    }
  }
}

/**
 * Calls backend RPC preview_qr_token(raw_token) with graceful demo fallback.
 * Returns site details & unlock status. Does not require authentication.
 */
export async function previewQrToken(rawToken: string): Promise<PreviewQrTokenResponse> {
  const trimmed = rawToken.trim()
  if (!trimmed) {
    return {
      success: false,
      error_code: 'INVALID_TOKEN',
      message: 'Token cannot be empty',
    }
  }

  // Check demo fixture first if it matches known demo tokens
  const matchedFixture = DEMO_TOKENS.find(
    (d) => d.rawToken.toUpperCase() === trimmed.toUpperCase()
  )

  try {
    const { data, error } = await supabase.rpc('preview_qr_token', {
      raw_token: trimmed,
    })

    if (!error && data && data.success) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        data.is_unlocked = false
      } else if (data.site?.id) {
        data.is_unlocked = data.is_unlocked || isSiteUnlockedLocally(data.site.id, user.id)
      }
      return data as PreviewQrTokenResponse
    }

    // Check if matches an item in Admin QR registry (supports physical unique serialized items)
    const qrRegistry = getLocalQrRegistry()
    const qrMatch = qrRegistry.find(
      (item) => item.rawToken.toUpperCase() === trimmed.toUpperCase()
    )

    if (qrMatch) {
      if (qrMatch.status === 'draft') {
        return {
          success: false,
          error_code: 'INVALID_TOKEN',
          message: 'Mã QR này đang ở trạng thái Bản nháp và chưa được duyệt phát hành.',
        }
      }
      if (qrMatch.status === 'printing') {
        return {
          success: false,
          error_code: 'INVALID_TOKEN',
          message: 'Mã QR này đang trong quá trình in ấn/chế tác tại xưởng và chưa xuất xưởng.',
        }
      }
      if (qrMatch.status === 'revoked') {
        return {
          success: false,
          error_code: 'REVOKED_TOKEN',
          message: 'Mã QR này đã bị thu hồi hoặc đã hết hiệu lực.',
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      const isClaimedByOther = Boolean(
        qrMatch.status === 'claimed' &&
          qrMatch.claimedByUserId &&
          (!user || qrMatch.claimedByUserId !== user.id)
      )

      const isUnlocked = user ? isSiteUnlockedLocally(qrMatch.siteId, user.id) : false

      return {
        success: true,
        site: {
          id: qrMatch.siteId,
          slug: qrMatch.siteSlug,
          name_vi: qrMatch.siteNameVi,
          name_en: qrMatch.siteNameVi,
          story_vi: `Địa danh di sản văn hóa liên kết với mã vật lý độc bản #${qrMatch.serialCode}.`,
          story_en: `Cultural heritage site linked to serialized physical item #${qrMatch.serialCode}.`,
          description_vi: `Bản in độc bản: ${qrMatch.serialCode}`,
          description_en: `Serialized item: ${qrMatch.serialCode}`,
          latitude: 10.7769,
          longitude: 106.7009,
          cover_image_url: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1200&q=80',
          audio_url: null,
        },
        is_unlocked: isUnlocked,
        pin_item_id: qrMatch.id,
        serial_code: qrMatch.serialCode,
        status: qrMatch.status,
        claimed_by_other: isClaimedByOther,
        claimer_name: qrMatch.claimedByUserName,
        claimed_at: qrMatch.claimedAt,
      }
    }

    // If RPC errored but matches a demo token fixture, use fallback
    if (matchedFixture) {
      return await resolveDemoTokenPreview(matchedFixture)
    }

    if (error) {
      return {
        success: false,
        error_code: 'INVALID_TOKEN',
        message: error.message,
      }
    }

    if (!data) {
      return {
        success: false,
        error_code: 'INVALID_TOKEN',
        message: 'No response data from server',
      }
    }

    return data as PreviewQrTokenResponse
  } catch (err: unknown) {
    if (matchedFixture) {
      return await resolveDemoTokenPreview(matchedFixture)
    }
    const message = err instanceof Error ? err.message : 'Network error previewing token'
    return {
      success: false,
      error_code: 'INVALID_TOKEN',
      message,
    }
  }
}

/**
 * Calls backend RPC unlock_heritage_site(raw_token) with persistent client fallback.
 * Requires user authentication.
 */
export async function unlockHeritageSite(
  rawToken: string,
  previewSite?: { id: string; slug: string; name_vi?: string }
): Promise<UnlockHeritageSiteResponse> {
  const trimmed = rawToken.trim()
  if (!trimmed) {
    return {
      success: false,
      error_code: 'INVALID_TOKEN',
      message: 'Token cannot be empty',
    }
  }

  const matchedFixture = DEMO_TOKENS.find(
    (d) => d.rawToken.toUpperCase() === trimmed.toUpperCase()
  )
  if (matchedFixture && matchedFixture.status === 'revoked') {
    addNotification({
      type: 'scan_error',
      title: 'Mã QR đã bị thu hồi',
      message: `Mã xác thực "${trimmed}" đã bị ban quản lý thu hồi.`,
      rawToken: trimmed,
    })
    return {
      success: false,
      error_code: 'REVOKED_TOKEN',
      message: 'This QR code has been revoked',
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // GUEST FLOW: Guests CANNOT unlock stamps. Must log in first.
  if (!user) {
    return {
      success: false,
      error_code: 'UNAUTHORIZED',
      message: 'Bạn cần đăng nhập tài khoản để mở khóa và lưu con dấu vào Hộ chiếu số.',
    }
  }

  let finalSiteId = previewSite?.id
  let finalSiteSlug = previewSite?.slug
  let finalSiteName = previewSite?.name_vi || matchedFixture?.siteNameVi || 'Di sản văn hóa'

  // Check unique serialized merchandise item in Admin QR registry
  const qrRegistry = getLocalQrRegistry()
  const qrMatch = qrRegistry.find(
    (item) => item.rawToken.toUpperCase() === trimmed.toUpperCase()
  )

  if (qrMatch) {
    if (qrMatch.status === 'draft') {
      return {
        success: false,
        error_code: 'INVALID_TOKEN',
        message: 'Mã QR này đang ở trạng thái Bản nháp và chưa được duyệt phát hành.',
      }
    }
    if (qrMatch.status === 'printing') {
      return {
        success: false,
        error_code: 'INVALID_TOKEN',
        message: 'Mã QR này đang trong quá trình in ấn/chế tác tại xưởng và chưa xuất xưởng.',
      }
    }
    if (qrMatch.status === 'revoked') {
      return {
        success: false,
        error_code: 'REVOKED_TOKEN',
        message: 'Mã QR này đã bị ban quản lý thu hồi.',
      }
    }
    if (qrMatch.status === 'claimed' && qrMatch.claimedByUserId && qrMatch.claimedByUserId !== user.id) {
      return {
        success: false,
        error_code: 'ALREADY_CLAIMED_BY_ANOTHER',
        message: `Mã sản phẩm độc bản này (${qrMatch.serialCode}) đã được kích hoạt bởi tài khoản khác. Mỗi sản phẩm vật lý chỉ cấp quyền mở khóa con dấu cho duy nhất một người mua.`,
        serial_code: qrMatch.serialCode,
        claimed_at: qrMatch.claimedAt,
      }
    }

    if (!finalSiteId) {
      finalSiteId = qrMatch.siteId
      finalSiteSlug = qrMatch.siteSlug
      finalSiteName = qrMatch.siteNameVi
    }
  }

  if (!finalSiteId && matchedFixture) {
    const { data: site } = await supabase
      .from('heritage_sites')
      .select('id, slug, name_vi')
      .eq('slug', matchedFixture.siteSlug)
      .maybeSingle()
    if (site) {
      finalSiteId = site.id
      finalSiteSlug = site.slug
      finalSiteName = site.name_vi
    }
  }

  // AUTHENTICATED USER FLOW: Call Supabase RPC
  try {
    const { data, error } = await supabase.rpc('unlock_heritage_site', {
      raw_token: trimmed,
    })

    const finalSerialCode = qrMatch?.serialCode

    if (!error && data && data.success) {
      if (finalSiteId && finalSiteSlug) {
        saveLocalUnlockedStamp(finalSiteId, finalSiteSlug, user.id, trimmed, data.serial_code || finalSerialCode)
        claimLocalQrItem(trimmed, user.id, user.user_metadata?.display_name || user.email)
      }

      addNotification({
        type: 'unlock_success',
        title: 'Mở khóa thành công',
        message: `Đã đóng dấu di sản "${finalSiteName}" vào Hộ chiếu số của bạn.`,
        siteId: finalSiteId,
        siteSlug: finalSiteSlug,
        siteName: finalSiteName,
        rawToken: trimmed,
      })

      window.dispatchEvent(
        new CustomEvent('heritage_site_unlocked', {
          detail: { siteId: finalSiteId, newlyUnlocked: data.newly_unlocked },
        })
      )

      return data as UnlockHeritageSiteResponse
    }

    // Graceful fallback for demo tokens or RPC failures
    if (finalSiteId && finalSiteSlug) {
      saveLocalUnlockedStamp(finalSiteId, finalSiteSlug, user.id, trimmed, finalSerialCode)
      claimLocalQrItem(trimmed, user.id, user.user_metadata?.display_name || user.email)

      addNotification({
        type: 'unlock_success',
        title: 'Mở khóa thành công',
        message: `Đã đóng dấu di sản "${finalSiteName}" vào Hộ chiếu số của bạn.`,
        siteId: finalSiteId,
        siteSlug: finalSiteSlug,
        siteName: finalSiteName,
        rawToken: trimmed,
      })

      window.dispatchEvent(
        new CustomEvent('heritage_site_unlocked', {
          detail: { siteId: finalSiteId, newlyUnlocked: true },
        })
      )

      return {
        success: true,
        newly_unlocked: true,
        site_id: finalSiteId,
        pin_item_id: `pin-${finalSiteSlug}-demo`,
        serial_code: finalSerialCode,
      }
    }

    if (error) {
      return {
        success: false,
        error_code: 'INVALID_TOKEN',
        message: error.message,
      }
    }

    return {
      success: false,
      error_code: 'INVALID_TOKEN',
      message: 'Unknown unlock response',
    }
  } catch (err: unknown) {
    if (finalSiteId && finalSiteSlug) {
      const finalSerialCode = qrMatch?.serialCode
      saveLocalUnlockedStamp(finalSiteId, finalSiteSlug, user.id, trimmed, finalSerialCode)

      addNotification({
        type: 'unlock_success',
        title: 'Mở khóa thành công',
        message: `Đã đóng dấu di sản "${finalSiteName}" vào Hộ chiếu số của bạn.`,
        siteId: finalSiteId,
        siteSlug: finalSiteSlug,
        siteName: finalSiteName,
        rawToken: trimmed,
      })

      window.dispatchEvent(
        new CustomEvent('heritage_site_unlocked', {
          detail: { siteId: finalSiteId, newlyUnlocked: true },
        })
      )

      return {
        success: true,
        newly_unlocked: true,
        site_id: finalSiteId,
        pin_item_id: `pin-${finalSiteSlug}-demo`,
      }
    }

    const message = err instanceof Error ? err.message : 'Network error unlocking heritage site'
    return {
      success: false,
      error_code: 'INVALID_TOKEN',
      message,
    }
  }
}

/**
 * Revokes an unlocked stamp for a heritage site.
 * Used for testing and demonstration workflows.
 */
export async function revokeHeritageSiteUnlock(
  siteId: string,
  siteName: string,
  userId?: string,
  siteSlug?: string
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const uid = userId || user?.id

  const isTargetThangLong =
    siteId === 'hoang-thanh-thang-long' ||
    siteId === 'site-hoang-thanh' ||
    siteId === 'b1b2c3d4-0001-4000-b000-000000000001' ||
    siteSlug === 'hoang-thanh-thang-long' ||
    (siteSlug ? siteSlug.includes('thang-long') : false)

  // 1. Remove from local client registry
  removeLocalUnlockedStamp(siteId, uid)
  if (siteSlug) {
    removeLocalUnlockedStamp(siteSlug, uid)
  }
  if (isTargetThangLong) {
    await purgeThangLongStrayCache(uid)
  }

  // 2. Attempt removal from Supabase database if authenticated
  if (uid) {
    try {
      const targetSiteIds = isTargetThangLong
        ? ['b1b2c3d4-0001-4000-b000-000000000001', 'site-hoang-thanh']
        : [siteId]

      await supabase
        .from('passport_entries')
        .delete()
        .eq('user_id', uid)
        .in('site_id', targetSiteIds)
    } catch (err) {
      console.warn('[QrService] Failed to delete passport entry from DB:', err)
    }
  }

  // 3. Log notification event
  addNotification({
    type: 'stamp_revoked',
    title: 'Đã thu hồi con dấu',
    message: `Đã thu hồi con dấu "${siteName}" để bạn kiểm thử lại luồng mở khóa.`,
    siteId,
    siteName,
  })

  // 4. Dispatch event to update Map & Passport tabs in real-time
  window.dispatchEvent(
    new CustomEvent('heritage_site_unlocked', {
      detail: { siteId, revoked: true },
    })
  )

  return true
}

/**
 * Revokes all unlocked stamps for testing and resetting the passport state.
 */
export async function revokeAllHeritageSiteUnlocks(userId?: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const uid = userId || user?.id

  // 1. Clear local registry
  clearAllLocalStamps(uid)

  // 2. Clear remote database if authenticated
  if (uid) {
    try {
      await supabase.from('passport_entries').delete().eq('user_id', uid)
    } catch (err) {
      console.warn('[QrService] Failed to delete all entries from DB:', err)
    }
  }

  // 3. Add activity notification
  addNotification({
    type: 'stamp_revoked',
    title: 'Đã đặt lại toàn bộ con dấu',
    message: 'Toàn bộ con dấu trong hộ chiếu đã được xóa để bắt đầu kiểm thử lại từ đầu.',
  })

  // 4. Dispatch event
  window.dispatchEvent(
    new CustomEvent('heritage_site_unlocked', {
      detail: { revokedAll: true },
    })
  )

  return true
}

/**
 * Universal extractor: Parses a raw QR scan string and extracts the secret token.
 * Supports:
 * 1. Web URL with /qr/:token (e.g. https://domain.com/qr/HUE-2026-VIP01)
 * 2. Web URL with query param ?token= (e.g. https://domain.com/unlock?token=HUE-2026-VIP01)
 * 3. Deep link heritage://qr/:token or heritage://unlock/:token
 * 4. JSON payload {"token": "...", "site": "..."}
 * 5. Plain alphanumeric raw token (e.g. DHP-THANGLONG-2026-TEST01)
 */
export function extractTokenFromQrString(rawValue: string): string {
  if (!rawValue) return ''
  const trimmed = rawValue.trim()

  // 1. JSON payload e.g. {"token": "XYZ"} or {"rawToken": "XYZ"}
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (parsed.token) return String(parsed.token).trim()
      if (parsed.rawToken) return String(parsed.rawToken).trim()
      if (parsed.qr_token) return String(parsed.qr_token).trim()
    } catch {
      // ignore JSON parse error
    }
  }

  // 2. Query parameter ?token=XYZ or &token=XYZ
  if (trimmed.includes('token=')) {
    try {
      const url = new URL(trimmed.startsWith('http') ? trimmed : `https://dummy.com/${trimmed}`)
      const token = url.searchParams.get('token')
      if (token) return token.trim()
    } catch {
      const match = trimmed.match(/[?&]token=([^&#\s]+)/)
      if (match && match[1]) return decodeURIComponent(match[1]).trim()
    }
  }

  // 3. Path segment /qr/XYZ or /unlock/XYZ
  if (trimmed.includes('/qr/')) {
    const parts = trimmed.split('/qr/')
    if (parts.length > 1) {
      const sub = parts[1].split(/[?#&]/)[0]
      if (sub) return decodeURIComponent(sub).trim()
    }
  }
  if (trimmed.includes('/unlock/')) {
    const parts = trimmed.split('/unlock/')
    if (parts.length > 1) {
      const sub = parts[1].split(/[?#&]/)[0]
      if (sub) return decodeURIComponent(sub).trim()
    }
  }

  // 4. Custom deep-link heritage://qr/XYZ or heritage://unlock/XYZ
  const deepMatch = trimmed.match(/heritage:\/\/(?:qr|unlock)\/([^?&#\s]+)/i)
  if (deepMatch && deepMatch[1]) {
    return decodeURIComponent(deepMatch[1]).trim()
  }

  // 5. Raw token string (e.g. DHP-THANGLONG-2026-TEST01 or HUE-2026-VIP01)
  return trimmed
}

