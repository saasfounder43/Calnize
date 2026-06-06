import { createClient } from '@/lib/supabase/server'
import { BlogPost, BlogCategory } from './blog-types'

// ─── PUBLIC (frontend) ────────────────────────────────────────────────────────

export async function getPublishedPosts(categorySlug?: string): Promise<BlogPost[]> {
  const supabase = await createClient()
  let query = supabase
    .from('blog_posts')
    .select('*, blog_categories(id, name, slug)')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })

  if (categorySlug) {
    const { data: cat } = await supabase
      .from('blog_categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, blog_categories(id, name, slug)')
    .eq('slug', slug)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle()

  if (error) {
    console.error(`Error fetching post with slug "${slug}":`, error)
    return null
  }

  if (data) {
    return data
  }

  // Fallback for any post that may be published but still needs explicit slug lookup
  // without the published_at filter during runtime.
  const { data: fallbackData, error: fallbackError } = await supabase
    .from('blog_posts')
    .select('*, blog_categories(id, name, slug)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (fallbackError) {
    console.error(`Fallback query failed for slug "${slug}":`, fallbackError)
    return null
  }

  if (fallbackData) {
    console.warn(`Post "${slug}" fetched via fallback query without published_at filter.`)
  }

  return fallbackData
}

export async function getCategories(): Promise<BlogCategory[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name')
  return data ?? []
}

export async function getCategoryBySlug(slug: string): Promise<BlogCategory | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error) {
    console.error(`Error fetching category "${slug}":`, error)
    return null
  }
  return data
}

// ─── ADMIN (backend) ──────────────────────────────────────────────────────────

export async function adminGetAllPosts(): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, blog_categories(id, name, slug)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function adminGetPostById(id: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*, blog_categories(id, name, slug)')
    .eq('id', id)
    .single()
  return data
}

export async function adminCreatePost(post: Partial<BlogPost>): Promise<BlogPost> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .insert(post)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function adminUpdatePost(id: string, post: Partial<BlogPost>): Promise<BlogPost> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .update(post)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function adminDeletePost(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('blog_posts').delete().eq('id', id)
  if (error) throw error
}

export async function adminCreateCategory(name: string, slug: string): Promise<BlogCategory> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_categories')
    .insert({ name, slug })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function adminDeleteCategory(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('blog_categories').delete().eq('id', id)
  if (error) throw error
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
