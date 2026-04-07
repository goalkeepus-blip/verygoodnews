export type UserRole = 'citizen' | 'journalist' | 'editor' | 'admin'
export type ArticleSection = 'domestic' | 'world' | 'video' | 'column'
export type ArticleStatus = 'draft' | 'review' | 'published' | 'rejected'
export type AdType = 'direct' | 'adsense' | 'none'
export type VideoPlatform = 'youtube' | 'tiktok'
export type ReportStatus = 'pending' | 'accepted' | 'rejected'

export interface User {
  id: string; auth_id: string | null; email: string; nickname: string
  role: UserRole; real_name: string | null; phone: string | null
  bio: string | null; profile_image: string | null
  is_active: boolean; is_verified: boolean
  created_at: string; updated_at: string
}

export interface Article {
  id: string; section: ArticleSection; title: string
  subtitle: string | null; summary: string | null
  content: string | null; thumbnail_url: string | null
  video_url: string | null; video_platform: VideoPlatform | null
  video_script: string | null; tags: string[] | null; category: string | null
  author_id: string | null; author_name: string | null; is_columnist: boolean
  status: ArticleStatus; published_at: string | null
  is_deleted: boolean; deleted_at: string | null
  view_count: number; created_at: string; updated_at: string
}

export type ArticleInsert = Omit<Article, 'id' | 'created_at' | 'updated_at' | 'view_count'>
export type ArticleUpdate = Partial<ArticleInsert>

export interface Ad {
  id: string; slot_key: string; slot_name: string; slot_position: string
  ad_type: AdType; image_url: string | null; link_url: string | null
  alt_text: string | null; adsense_slot_id: string | null
  is_active: boolean; starts_at: string | null; ends_at: string | null
  created_at: string; updated_at: string
}

export interface NewsletterSubscriber {
  id: string; email: string; name: string | null
  is_active: boolean; confirmed_at: string | null
  unsubscribed_at: string | null; source: string
  created_at: string; updated_at: string
}