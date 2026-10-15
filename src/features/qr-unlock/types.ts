import type {
  PreviewQrTokenResponse,
  PreviewQrTokenSuccess,
  PreviewQrTokenFailure,
  UnlockHeritageSiteResponse,
  UnlockHeritageSiteSuccess,
  UnlockHeritageSiteFailure,
} from '../../types/database.types'

export type {
  PreviewQrTokenResponse,
  PreviewQrTokenSuccess,
  PreviewQrTokenFailure,
  UnlockHeritageSiteResponse,
  UnlockHeritageSiteSuccess,
  UnlockHeritageSiteFailure,
}

export type QrUnlockStatus =
  | 'idle'
  | 'previewing'
  | 'preview_ready'
  | 'unlocking'
  | 'unlocked_success'
  | 'already_unlocked'
  | 'error'

export interface DemoTokenFixture {
  rawToken: string
  siteSlug: string
  siteNameVi: string
  siteNameEn: string
  status: 'active' | 'revoked'
  descriptionVi: string
  descriptionEn: string
}

