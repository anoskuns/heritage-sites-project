import { supabase } from '../../services/supabase/client'
import type {
  PreviewQrTokenResponse,
  UnlockHeritageSiteResponse,
  DemoTokenFixture,
} from './types'

/**
 * 6 Official test fixtures aligned with supabase/seed.sql for testing and demonstration.
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
 * Calls backend RPC preview_qr_token(raw_token).
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

  try {
    const { data, error } = await supabase.rpc('preview_qr_token', {
      raw_token: trimmed,
    })

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
    const message = err instanceof Error ? err.message : 'Network error previewing token'
    return {
      success: false,
      error_code: 'INVALID_TOKEN',
      message,
    }
  }
}

/**
 * Calls backend RPC unlock_heritage_site(raw_token).
 * Idempotently creates passport entry. Requires authentication.
 */
export async function unlockHeritageSite(rawToken: string): Promise<UnlockHeritageSiteResponse> {
  const trimmed = rawToken.trim()
  if (!trimmed) {
    return {
      success: false,
      error_code: 'INVALID_TOKEN',
      message: 'Token cannot be empty',
    }
  }

  try {
    const { data, error } = await supabase.rpc('unlock_heritage_site', {
      raw_token: trimmed,
    })

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

    return data as UnlockHeritageSiteResponse
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error unlocking heritage site'
    return {
      success: false,
      error_code: 'INVALID_TOKEN',
      message,
    }
  }
}

