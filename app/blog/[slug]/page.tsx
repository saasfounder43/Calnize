import { getPostBySlug, getPublishedPosts } from '@/lib/blog'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
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
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  return (
    <article className="blog-post-page">
      <style>{`
        .blog-post-page {
          max-width: 760px;
          margin: 0 auto;
          padding: 60px 24px 100px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .blog-post-category {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #0066ff;
          background: #e8f0fe;
          padding: 3px 10px;
          border-radius: 99px;
        }
        .blog-post-date { font-size: 0.875rem; color: #888; }

        .blog-post-title {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: 700;
          line-height: 1.2;
          color: #111;
          margin: 0 0 20px;
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
          aspect-ratio: 16/9;
          object-fit: cover;
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
        .blog-post-body ul, .blog-post-body ol { padding-left: 1.5em; margin: 0 0 1.2em; }
        .blog-post-body li { margin-bottom: 0.4em; }
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
      `}</style>

      <Link href="/blog" className="blog-back">
        ← Back to Blog
      </Link>

      <div className="blog-post-meta">
        {post.blog_categories && (
          <span className="blog-post-category">{post.blog_categories.name}</span>
        )}
        {post.published_at && (
          <time className="blog-post-date">{formatDate(post.published_at)}</time>
        )}
      </div>

      <h1 className="blog-post-title">{post.title}</h1>

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

      <hr className="blog-post-divider" />
      <div className="blog-post-footer">
        <Link href="/blog" className="blog-back">← Back to Blog</Link>
      </div>
    </article>
  )
}
