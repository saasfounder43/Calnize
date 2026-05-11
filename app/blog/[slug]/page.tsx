import { getPostBySlug } from '@/lib/blog'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'

export const revalidate = 60
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  try {
    const { slug } = await params
    const post = await getPostBySlug(slug)
    if (!post) return {}
    return {
      title: `${post.title} | Calnize Blog`,
      description: post.excerpt ?? undefined,
      keywords: post.seo_keywords ?? undefined,
      openGraph: {
        title: post.title,
        description: post.excerpt ?? undefined,
        images: post.cover_image_url ? [post.cover_image_url] : [],
      },
    }
  } catch (err) {
    console.error('Error generating metadata:', err)
    return {}
  }
}

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

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let post = null

  try {
    post = await getPostBySlug(slug)
  } catch (err) {
    console.error(`Error rendering blog post ${slug}:`, err)
  }

  if (!post) {
    notFound()
  }

  return (
    <article className="blog-post-page">
      <style>{`
        html,
        body {
          background: #ffffff;
          color: #0f172a;
        }
        .blog-post-page {
          max-width: 760px;
          margin: 0 auto;
          padding: 60px 24px 100px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #ffffff;
          color: #0f172a;
        }
        .blog-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #0066ff;
          text-decoration: none;
          font-size: 0.9rem;
          margin-bottom: 32px;
          transition: opacity 0.15s;
        }
        .blog-back:hover { opacity: 0.7; }

        .blog-post-meta {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }
        .blog-post-category {
          font-size: 0.86rem;
          font-weight: 600;
          text-transform: none;
          letter-spacing: 0;
          color: #0f3b8d;
          background: #eef4ff;
          padding: 6px 14px;
          border-radius: 999px;
        }

        .blog-post-title {
          font-size: clamp(2.4rem, 4vw, 3.4rem);
          line-height: 1.05;
          margin: 0 0 22px;
          color: #0f172a;
          letter-spacing: -0.03em;
          font-weight: 600;
        }
        .blog-post-author {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 42px;
        }
        .blog-post-author-photo {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          background: #eef3fb;
          flex-shrink: 0;
        }
        .blog-post-author-meta {
          font-size: 0.96rem;
          color: #4b5563;
          line-height: 1.6;
          letter-spacing: 0.01em;
          font-weight: 400;
        }
        .blog-post-excerpt {
          font-size: 1.15rem;
          color: #555;
          line-height: 1.6;
          margin-bottom: 32px;
          border-left: 3px solid #0066ff;
          padding-left: 16px;
        }
        .blog-post-cover {
          width: 100%;
          max-width: 100%;
          height: auto;
          object-fit: contain;
          display: block;
          border-radius: 12px;
          margin-bottom: 40px;
        }
        .blog-post-video {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 12px;
          margin-bottom: 40px;
          border: none;
        }
        .blog-post-body {
          font-size: 1.05rem;
          line-height: 1.8;
          color: #333;
        }
        .blog-post-body h1, .blog-post-body h2, .blog-post-body h3 {
          color: #111;
          margin-top: 2em;
          margin-bottom: 0.5em;
        }
        .blog-post-body h2 { font-size: 1.5rem; }
        .blog-post-body h3 { font-size: 1.2rem; }
        .blog-post-body p { margin: 0 0 1.2em; }
        .blog-post-body ul,
        .blog-post-body ol {
          padding-left: 1.75em;
          margin: 0 0 1.2em;
          list-style-position: outside;
        }
        .blog-post-body ul { list-style-type: disc; }
        .blog-post-body ol { list-style-type: decimal; }
        .blog-post-body li {
          margin-bottom: 0.4em;
        }
        .blog-post-body a { color: #0066ff; text-decoration: underline; }
        .blog-post-body blockquote {
          border-left: 3px solid #e0e0e0;
          margin: 1.5em 0;
          padding: 0.5em 1em;
          color: #666;
          font-style: italic;
        }
        .blog-post-body img {
          max-width: 100%;
          width: auto;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
        }
        .blog-post-body pre {
          background: #f4f4f4;
          padding: 1em;
          border-radius: 6px;
          overflow-x: auto;
          font-size: 0.9rem;
        }
        .blog-post-body code { font-family: monospace; font-size: 0.9em; }
        .blog-post-body strong { font-weight: 600; }

        .blog-post-divider {
          border: none;
          border-top: 1px solid #eee;
          margin: 48px 0;
        }
        .blog-post-footer { color: #888; font-size: 0.875rem; }

        .blog-post-cta {
          background: #f0f4ff;
          border-radius: 12px;
          padding: 48px 32px;
          margin: 48px 0;
          text-align: center;
        }
        .blog-post-cta h2 {
          font-size: 1.8rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 16px;
          letter-spacing: -0.01em;
        }
        .blog-post-cta p {
          font-size: 1.05rem;
          color: #4b5563;
          margin: 0 0 28px;
          line-height: 1.6;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }
        .blog-post-cta-btn {
          display: inline-block;
          background: #0066ff;
          color: #fff;
          text-decoration: none;
          font-weight: 600;
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 1rem;
          transition: background 0.2s, transform 0.1s;
        }
        .blog-post-cta-btn:hover {
          background: #0052cc;
          transform: translateY(-2px);
        }
      `}</style>

      <Link href="/blog" className="blog-back">
        ← Back to Blog
      </Link>

      <div className="blog-post-meta">
        {post.blog_categories && (
          <span className="blog-post-category">{post.blog_categories.name}</span>
        )}
      </div>

      <h1 className="blog-post-title">{post.title}</h1>

      <div className="blog-post-author">
        {post.author_photo_url && (
          <img
            src={post.author_photo_url}
            alt={post.author_name || 'Author'}
            className="blog-post-author-photo"
          />
        )}
        <span className="blog-post-author-meta">
          {post.author_name || 'Calnize Team'}
          {post.published_at && ` | ${formatDate(post.published_at)}`}
          {` | ${estimateReadingTime(post.body || '')} min read`}
        </span>
      </div>

      {post.excerpt && (
        <p className="blog-post-excerpt">{post.excerpt}</p>
      )}

      {post.cover_image_url && (
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="blog-post-cover"
        />
      )}

      {post.video_url && (
        <iframe
          src={post.video_url}
          className="blog-post-video"
          allowFullScreen
          title={post.title}
        />
      )}

      <div
        className="blog-post-body"
        dangerouslySetInnerHTML={{ __html: post.body }}
      />

      <div className="blog-post-cta">
        <h2>Start scheduling with Calnize</h2>
        <p>Create your first booking page with zero setup. Get paid on your terms—no Stripe required, no booking fees. Simple scheduling for professionals.</p>
        <a href="/signup" className="blog-post-cta-btn">Create Your First Booking Page</a>
      </div>

      <hr className="blog-post-divider" />
      <div className="blog-post-footer">
        <Link href="/blog" className="blog-back">← Back to Blog</Link>
      </div>
    </article>
  )
}
