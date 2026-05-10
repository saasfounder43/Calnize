export type BlogStatus = 'draft' | 'published'

export interface BlogCategory {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  body: string
  cover_image_url: string | null
  video_url: string | null
  category_id: string | null
  status: BlogStatus
  seo_keywords: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  author_name: string | null
  author_photo_url: string | null
  blog_categories?: BlogCategory
}

export interface BlogPostFormData {
  title: string
  slug: string
  excerpt: string
  body: string
  cover_image_url: string
  video_url: string
  category_id: string
  status: BlogStatus
  seo_keywords: string
  published_at: string
  author_name: string
  author_photo_url: string
}
