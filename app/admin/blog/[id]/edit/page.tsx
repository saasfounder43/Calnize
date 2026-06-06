import { requireBlogAdminPage } from '@/lib/admin-auth'
import { adminGetPostById, getCategories } from '@/lib/blog'
import BlogPostForm from '@/components/blog/BlogPostForm'
import { notFound } from 'next/navigation'

export const metadata = { title: 'Edit Post | Calnize Admin' }

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireBlogAdminPage()
  const [post, categories] = await Promise.all([
    adminGetPostById(id),
    getCategories(),
  ])

  if (!post) notFound()

  return <BlogPostForm mode="edit" post={post} categories={categories} />
}
