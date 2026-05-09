import { requireBlogAdminPage } from '@/lib/admin-auth'
import { getCategories } from '@/lib/blog'
import BlogPostForm from '@/components/blog/BlogPostForm'

export const metadata = { title: 'New Post | Calnize Admin' }

export default async function NewBlogPostPage() {
  await requireBlogAdminPage()
  const categories = await getCategories()

  return <BlogPostForm mode="create" categories={categories} />
}
