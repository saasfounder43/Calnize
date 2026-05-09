import { NextRequest, NextResponse } from 'next/server'
import { requireBlogAdmin } from '@/lib/admin-auth'
import { adminGetAllPosts, adminCreatePost, slugify } from '@/lib/blog'

export async function GET() {
  const user = await requireBlogAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const posts = await adminGetAllPosts()
    return NextResponse.json(posts)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await requireBlogAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const post = await adminCreatePost({
      ...body,
      slug: body.slug || slugify(body.title),
      published_at: body.published_at || (body.status === 'published' ? new Date().toISOString() : null),
    })
    return NextResponse.json(post, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
