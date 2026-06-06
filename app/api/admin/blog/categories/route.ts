import { NextRequest, NextResponse } from 'next/server'
import { requireBlogAdmin } from '@/lib/admin-auth'
import { adminCreateCategory, adminDeleteCategory, getCategories, slugify } from '@/lib/blog'

export async function GET() {
  const user = await requireBlogAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const cats = await getCategories()
  return NextResponse.json(cats)
}

export async function POST(req: NextRequest) {
  const user = await requireBlogAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const cat = await adminCreateCategory(name, slugify(name))
  return NextResponse.json(cat, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const user = await requireBlogAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await adminDeleteCategory(id)
  return NextResponse.json({ success: true })
}
