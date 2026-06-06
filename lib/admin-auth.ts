import { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Check if the current user is an admin for blog/CMS features
 * Returns user if admin, null otherwise (for API routes)
 */
export async function requireBlogAdmin(supabase?: SupabaseClient) {
  const client = supabase || (await createClient())
  const { data: { user } } = await client.auth.getUser()
  
  if (!user) return null

  // Check if user has admin role
  const { data: profile } = await client
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') {
    return user
  }

  return null
}

/**
 * Require admin access for pages - redirects if not authenticated or not an admin
 */
export async function requireBlogAdminPage(supabase?: SupabaseClient) {
  const client = supabase || (await createClient())
  const { data: { user } } = await client.auth.getUser()
  
  if (!user) {
    redirect('/admin/blog/login?redirectedFrom=/admin/blog')
  }

  // Check if user has admin role
  const { data: profile } = await client
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/admin/blog/login?redirectedFrom=/admin/blog')
  }

  return user
}

