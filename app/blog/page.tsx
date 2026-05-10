import { getPublishedPosts, getCategories } from '@/lib/blog'
import Link from 'next/link'
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

function estimateReadingTime(html: string) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const words = text ? text.split(' ').length : 0
  return Math.max(1, Math.round(words / 200))
}

function BlogCard({ post }: { post: BlogPost }) {
  const readingTime = estimateReadingTime(post.body || post.excerpt || '')

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
          <div style={{ fontSize: '0.8rem', color: '#666' }}>
            <time>{formatDate(post.published_at!)}</time>
            <span> · {readingTime} min read</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const [posts, categories] = await Promise.all([
    getPublishedPosts(params.category),
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
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 42px;
        }
        .filter-btn {
          padding: 10px 18px;
          border-radius: 999px;
          border: 1px solid #d9e2ee;
          background: #f9fbff;
          color: #0f1d34;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .filter-btn:hover {
          background: #eef4ff;
          border-color: #c6d7fa;
        }
        .filter-btn.active {
          background: #e7f0ff;
          border-color: #9bb9ff;
          color: #0a3d8f;
        }

        .blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
        .blog-card {
          display: flex;
          flex-direction: column;
          border: 1px solid #edf0f4;
          border-radius: 20px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          background: #fff;
          transition: transform 0.24s ease, box-shadow 0.24s ease;
        }
        .blog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
        }
        .blog-card-image { aspect-ratio: 16/9; overflow: hidden; background: #f3f6fb; }
        .blog-card-img { width: 100%; height: 100%; object-fit: cover; }
        .blog-card-content { padding: 24px; flex: 1; display: flex; flex-direction: column; gap: 16px; }
        .blog-category-tag {
          font-size: 0.82rem;
          font-weight: 600;
          color: #0a3d8f;
          text-transform: none;
          letter-spacing: 0;
        }
        .blog-card-title {
          font-size: 1.35rem;
          font-weight: 600;
          color: #10203a;
          margin: 0;
          line-height: 1.35;
        }
        .blog-card-excerpt {
          font-size: 0.98rem;
          color: #4b5563;
          margin: 0;
          line-height: 1.75;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .blog-card-meta { font-size: 0.9rem; color: #667085; margin-top: auto; }

        .blog-empty {
          text-align: center;
          padding: 80px 0;
          color: #888;
        }
        .blog-empty h3 { font-size: 1.2rem; font-weight: 500; margin: 0; }
      `}</style>

      <div className="blog-header">
        <h1>Blog</h1>
        <p>Read the freshest insights on scheduling, productivity, and running a smart booking business.</p>
      </div>

      {categories.length > 0 && (
        <div className="blog-filters">
          <Link
            href="/blog"
            className={`filter-btn${!params.category ? ' active' : ''}`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/blog?category=${cat.slug}`}
              className={`filter-btn${params.category === cat.slug ? ' active' : ''}`}
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
