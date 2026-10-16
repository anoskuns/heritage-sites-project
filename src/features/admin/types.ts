export interface HeritageSectionItem {
  id: string
  titleVi: string
  titleEn: string
  bodyVi: string
  bodyEn: string
}

export interface AdminSiteFormData {
  slug: string
  nameVi: string
  nameEn: string
  storyVi: string
  storyEn: string
  descriptionVi?: string
  descriptionEn?: string
  latitude: number
  longitude: number
  coverImageUrl: string
  audioUrl?: string
  sourceReference?: string
  isPublished: boolean
  areaId?: string
  collectionId?: string
  isLimitedCollection?: boolean
  limitedCollectionName?: string
  limitedTotalQuantity?: number
  sections?: HeritageSectionItem[]
}

export interface AdminUserSummary {
  id: string
  displayName: string
  email: string
  avatarUrl?: string | null
  role: 'admin' | 'user'
  createdAt: string
  stampsCount: number
  memoriesCount: number
}

export interface AdminPostItem {
  id: string
  userId: string
  authorName: string
  authorAvatar?: string | null
  authorRole: 'admin' | 'user'
  siteId?: string | null
  siteName?: string | null
  body: string
  imagePath?: string | null
  visibility: 'public' | 'private'
  status: 'published' | 'hidden' | 'deleted'
  likesCount: number
  createdAt: string
}

export type QrItemLifecycleStatus = 'draft' | 'printing' | 'available' | 'claimed' | 'revoked'

export interface CollectionBatchItem {
  id: string
  batchCode: string
  nameVi: string
  nameEn?: string
  siteId: string
  siteSlug: string
  siteNameVi: string
  totalQuantity: number
  claimedCount: number
  status: 'draft' | 'printing' | 'active' | 'archived'
  description?: string
  createdAt: string
  updatedAt: string
}

export interface AdminQrItem {
  id: string
  designId?: string
  batchId?: string
  batchName?: string
  siteId: string
  siteNameVi: string
  siteSlug: string
  serialCode: string
  editionNumber?: number
  editionTotal?: number
  rawToken: string
  qrTokenHash: string
  fullUrl: string
  status: QrItemLifecycleStatus
  claimedByUserId?: string | null
  claimedByUserName?: string | null
  claimedAt?: string | null
  revokedAt?: string | null
  createdAt: string
}

export interface BatchQrGenerateParams {
  batchName?: string
  siteId: string
  siteSlug: string
  siteNameVi: string
  prefix: string
  quantity: number
  baseUrl?: string
  status?: QrItemLifecycleStatus
}

export interface AdminDashboardStats {
  totalSites: number
  publishedSites: number
  totalUsers: number
  totalAdminUsers: number
  totalQrTokens: number
  claimedQrTokens: number
  totalPosts: number
  publishedPosts: number
}

