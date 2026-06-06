import { redirect } from 'next/navigation'
import { getPublishedPosts, getCategories } from '@/lib/blog'
import BlogIndexLayout from '@/components/blog/BlogIndexLayout'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | Calnize',
  description:
    'Insights on scheduling, productivity, and time management from the Calnize team.',
}

export const revalidate = 60

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const legacy = params.category?.trim()
  if (legacy) {
    redirect(`/blog/${legacy}`)
  }

  const [posts, categories] = await Promise.all([getPublishedPosts(), getCategories()])

  return (
    <BlogIndexLayout
      posts={posts}
      categories={categories}
      activeCategorySlug={null}
      title="Blog"
      description="Read the freshest insights on scheduling, productivity, and running a smart booking business."
    />
  )
}
