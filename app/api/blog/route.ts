import { NextRequest, NextResponse } from 'next/server'
import { getPublishedPosts } from '@/lib/blog'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') ?? undefined
    const posts = await getPublishedPosts(category)
    return NextResponse.json(posts)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
