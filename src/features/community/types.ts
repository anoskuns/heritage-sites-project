export interface CommunityAuthor {
  id: string
  displayName: string
  avatarUrl: string | null
}

export interface AttachedHeritageSite {
  id: string
  slug: string
  nameVi: string
  nameEn: string
}

export interface CommunityPostItem {
  id: string
  userId: string
  siteId: string | null
  body: string
  imagePath: string | null
  imageUrl: string | null
  visibility: 'public' | 'private'
  status: 'published' | 'hidden' | 'deleted'
  createdAt: string
  updatedAt: string
  author: CommunityAuthor
  heritageSite: AttachedHeritageSite | null
  likesCount: number
  isLikedByMe: boolean
}

export interface CreatePostParams {
  userId: string
  body: string
  siteId?: string | null
  imageFile?: File | null
}

