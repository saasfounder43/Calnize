import { getPublishedPosts, getCategories } from '@/lib/blog'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { BlogPost } from '@/lib/blog-types'

export const metadata: Metadata = {
  title: 'Blog | Calnize',
  description: 'Insights on scheduling, productivity, and time management from the Calnize team.',
}

export const revalidate = 60

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="blog-card group">
      {post.cover_image_url && (
        <div className="blog-card-image">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="blog-card-img"
          />
        </div>
      )}
      <div className="blog-card-content">
        {post.blog_categories && (
          <span className="blog-category-tag">{post.blog_categories.name}</span>
        )}
        <h2 className="blog-card-title">{post.title}</h2>
        {post.excerpt && (
          <p className="blog-card-excerpt">{post.excerpt}</p>
        )}
        <div className="blog-card-meta">
          <time>{formatDate(post.published_at!)}</time>
        </div>
      </div>
    </Link>
  )
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const [posts, categories] = await Promise.all([
    getPublishedPosts(searchParams.category),
    getCategories(),
  ])

  return (
    <div className="blog-page">
      <style>{`
        .blog-page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 60px 24px 80px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .blog-header { margin-bottom: 48px; }
        .blog-header h1 {
          font-size: 2.25rem;
          font-weight: 700;
          color: #111;
          margin: 0 0 8px;
        }
        .blog-header p { color: #666; font-size: 1.05rem; margin: 0; }

        .blog-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 40px;
        }
        .filter-btn {
          padding: 6px 16px;
          border-radius: 99px;
          border: 1px solid #ddd;
          background: #fff;
          color: #444;
          font-size: 0.875rem;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.15s;
        }
        .filter-btn:hover, .filter-btn.active {
          background: #0066ff;
          border-color: #0066ff;
          color: #fff;
        }

        .blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 28px;
        }
        .blog-card {
          display: flex;
          flex-direction: column;
          border: 1px solid #eee;
          border-radius: 12px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .blog-card:hover {
          box-shadow: 0 4px 24px rgba(0,0,0,0.09);
          transform: translateY(-2px);
        }
        .blog-card-image { aspect-ratio: 16/9; overflow: hidden; background: #f5f5f5; }
        .blog-card-img { width: 100%; height: 100%; object-fit: cover; }
        .blog-card-content { padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .blog-category-tag {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #0066ff;
        }
        .blog-card-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #111;
          margin: 0;
          line-height: 1.4;
        }
        .blog-card-excerpt {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
          line-height: 1.5;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .blog-card-meta { font-size: 0.8rem; color: #999; margin-top: auto; }

        .blog-empty {
          text-align: center;
          padding: 80px 0;
          color: #888;
        }
        .blog-empty h3 { font-size: 1.2rem; font-weight: 500; margin: 0; }
      `}</style>

      <div className="blog-header">
        <h1>Blog</h1>
        <p>Insights on scheduling, productivity, and more.</p>
      </div>

      {categories.length > 0 && (
        <div className="blog-filters">
          <Link
            href="/blog"
            className={`filter-btn${!searchParams.category ? ' active' : ''}`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/blog?category=${cat.slug}`}
              className={`filter-btn${searchParams.category === cat.slug ? ' active' : ''}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="blog-empty">
          <h3>No posts yet. Check back soon!</h3>
        </div>
      ) : (
        <div className="blog-grid">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
