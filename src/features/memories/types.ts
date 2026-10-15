import type { Memory } from '../../types/database.types'

export interface MemoryWithUrl extends Memory {
  signedUrl: string
}

export interface UploadMemoryParams {
  file: File
  caption?: string
  siteId: string
  userId: string
}

