// ==============================================================================
// Database Types for Supabase
// Generated to match PostgreSQL Schema in supabase/migrations/
// ==============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          preferred_language: 'vi' | 'en'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_url?: string | null
          preferred_language?: 'vi' | 'en'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
          preferred_language?: 'vi' | 'en'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      heritage_sites: {
        Row: {
          id: string
          area_id: string | null
          slug: string
          name_vi: string
          name_en: string
          story_vi: string
          story_en: string
          description_vi: string | null
          description_en: string | null
          latitude: number
          longitude: number
          cover_image_url: string
          audio_url: string | null
          source_reference: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          area_id?: string | null
          slug: string
          name_vi: string
          name_en: string
          story_vi: string
          story_en: string
          description_vi?: string | null
          description_en?: string | null
          latitude: number
          longitude: number
          cover_image_url: string
          audio_url?: string | null
          source_reference?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          area_id?: string | null
          slug?: string
          name_vi?: string
          name_en?: string
          story_vi?: string
          story_en?: string
          description_vi?: string | null
          description_en?: string | null
          latitude?: number
          longitude?: number
          cover_image_url?: string
          audio_url?: string | null
          source_reference?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      collections: {
        Row: {
          id: string
          name_vi: string
          name_en: string
          description_vi: string | null
          description_en: string | null
          cover_image_url: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_vi: string
          name_en: string
          description_vi?: string | null
          description_en?: string | null
          cover_image_url?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name_vi?: string
          name_en?: string
          description_vi?: string | null
          description_en?: string | null
          cover_image_url?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      pin_designs: {
        Row: {
          id: string
          site_id: string
          collection_id: string | null
          name: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_id: string
          collection_id?: string | null
          name: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          collection_id?: string | null
          name?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pin_designs_site_id_fkey'
            columns: ['site_id']
            referencedRelation: 'heritage_sites'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pin_designs_collection_id_fkey'
            columns: ['collection_id']
            referencedRelation: 'collections'
            referencedColumns: ['id']
          }
        ]
      }
      pin_items: {
        Row: {
          id: string
          design_id: string
          qr_token_hash: string
          status: 'active' | 'revoked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          design_id: string
          qr_token_hash: string
          status?: 'active' | 'revoked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          design_id?: string
          qr_token_hash?: string
          status?: 'active' | 'revoked'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pin_items_design_id_fkey'
            columns: ['design_id']
            referencedRelation: 'pin_designs'
            referencedColumns: ['id']
          }
        ]
      }
      passport_entries: {
        Row: {
          id: string
          user_id: string
          site_id: string
          first_pin_item_id: string | null
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          site_id: string
          first_pin_item_id?: string | null
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          site_id?: string
          first_pin_item_id?: string | null
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'passport_entries_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'passport_entries_site_id_fkey'
            columns: ['site_id']
            referencedRelation: 'heritage_sites'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'passport_entries_first_pin_item_id_fkey'
            columns: ['first_pin_item_id']
            referencedRelation: 'pin_items'
            referencedColumns: ['id']
          }
        ]
      }
      memories: {
        Row: {
          id: string
          user_id: string
          site_id: string
          image_path: string
          caption: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          site_id: string
          image_path: string
          caption?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          site_id?: string
          image_path?: string
          caption?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'memories_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'memories_site_id_fkey'
            columns: ['site_id']
            referencedRelation: 'heritage_sites'
            referencedColumns: ['id']
          }
        ]
      }
      posts: {
        Row: {
          id: string
          user_id: string
          site_id: string | null
          body: string
          image_path: string | null
          visibility: 'public' | 'private'
          status: 'published' | 'hidden' | 'deleted'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          site_id?: string | null
          body: string
          image_path?: string | null
          visibility?: 'public' | 'private'
          status?: 'published' | 'hidden' | 'deleted'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          site_id?: string | null
          body?: string
          image_path?: string | null
          visibility?: 'public' | 'private'
          status?: 'published' | 'hidden' | 'deleted'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'posts_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'posts_site_id_fkey'
            columns: ['site_id']
            referencedRelation: 'heritage_sites'
            referencedColumns: ['id']
          }
        ]
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'post_likes_post_id_fkey'
            columns: ['post_id']
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'post_likes_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      regions: {
        Row: {
          id: string
          slug: string
          name_vi: string
          name_en: string
          description_vi: string | null
          description_en: string | null
          order_index: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name_vi: string
          name_en: string
          description_vi?: string | null
          description_en?: string | null
          order_index?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name_vi?: string
          name_en?: string
          description_vi?: string | null
          description_en?: string | null
          order_index?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      areas: {
        Row: {
          id: string
          region_id: string
          slug: string
          name_vi: string
          name_en: string
          center_lat: number
          center_lng: number
          default_zoom: number
          is_active: boolean
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          region_id: string
          slug: string
          name_vi: string
          name_en: string
          center_lat: number
          center_lng: number
          default_zoom?: number
          is_active?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          region_id?: string
          slug?: string
          name_vi?: string
          name_en?: string
          center_lat?: number
          center_lng?: number
          default_zoom?: number
          is_active?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'areas_region_id_fkey'
            columns: ['region_id']
            referencedRelation: 'regions'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      preview_qr_token: {
        Args: {
          raw_token: string
        }
        Returns: PreviewQrTokenResponse
      }
      unlock_heritage_site: {
        Args: {
          raw_token: string
        }
        Returns: UnlockHeritageSiteResponse
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// ==============================================================================
// RPC Function Return Types
// ==============================================================================

export type PreviewQrTokenSuccess = {
  success: true
  site: {
    id: string
    slug: string
    name_vi: string
    name_en: string
    story_vi: string
    story_en: string
    description_vi: string | null
    description_en: string | null
    latitude: number
    longitude: number
    cover_image_url: string
    audio_url: string | null
  }
  is_unlocked: boolean
  pin_item_id: string
}

export type PreviewQrTokenFailure = {
  success: false
  error_code: 'INVALID_TOKEN' | 'REVOKED_TOKEN' | 'SITE_UNPUBLISHED'
  message: string
}

export type PreviewQrTokenResponse = PreviewQrTokenSuccess | PreviewQrTokenFailure

export type UnlockHeritageSiteSuccess = {
  success: true
  newly_unlocked: boolean
  site_id: string
  pin_item_id: string
}

export type UnlockHeritageSiteFailure = {
  success: false
  error_code: 'UNAUTHORIZED' | 'INVALID_TOKEN' | 'REVOKED_TOKEN' | 'SITE_UNPUBLISHED'
  message: string
}

export type UnlockHeritageSiteResponse = UnlockHeritageSiteSuccess | UnlockHeritageSiteFailure

// ==============================================================================
// Convenient Entity Row Types
// ==============================================================================

export type Profile = Database['public']['Tables']['profiles']['Row']
export type HeritageSite = Database['public']['Tables']['heritage_sites']['Row']
export type Collection = Database['public']['Tables']['collections']['Row']
export type PinDesign = Database['public']['Tables']['pin_designs']['Row']
export type PinItem = Database['public']['Tables']['pin_items']['Row']
export type PassportEntry = Database['public']['Tables']['passport_entries']['Row']
export type Memory = Database['public']['Tables']['memories']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type PostLike = Database['public']['Tables']['post_likes']['Row']
export type Region = Database['public']['Tables']['regions']['Row']
export type Area = Database['public']['Tables']['areas']['Row']

