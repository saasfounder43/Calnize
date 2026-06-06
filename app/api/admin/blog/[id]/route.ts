import { NextRequest, NextResponse } from 'next/server'
import { requireBlogAdmin } from '@/lib/admin-auth'
import { adminUpdatePost, adminDeletePost } from '@/lib/blog'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireBlogAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const { id } = await params
    if (body.published_at?.trim()) {
      body.published_at = new Date(body.published_at).toISOString()
    }
    // If publishing and no published_at set, set it now
    if (body.status === 'published' && !body.published_at) {
      body.published_at = new Date().toISOString()
    }
    const post = await adminUpdatePost(id, body)
    return NextResponse.json(post)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireBlogAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    await adminDeletePost(id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
