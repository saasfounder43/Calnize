"use client"

import { useState } from 'react'
import Link from 'next/link'
import { BlogPost, BlogCategory } from '@/lib/blog-types'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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
        {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
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

type BlogIndexLayoutProps = {
  posts: BlogPost[]
  categories: BlogCategory[]
  /** `null` means “All” is active */
  activeCategorySlug: string | null
  title: string
  description: string
}

export default function BlogIndexLayout({
  posts,
  categories,
  activeCategorySlug,
  title,
  description,
}: BlogIndexLayoutProps) {
  const signupUrl = "https://app.calnize.com/signup";
  const loginUrl = "https://app.calnize.com/login";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        /* ===== Shared header/footer theme (matches app/page.tsx) ===== */
        :root {
          --bg: #0b0b14;
          --surface: #0f0f1c;
          --border: #1a1a2e;
          --border2: #232340;
          --accent: #7c6af7;
          --accent2: #5b4de0;
          --accent-glow: rgba(124,106,247,0.14);
          --teal: #00e5c0;
          --text: #eeeeff;
          --muted: #6868a0;
          --card: #0c0c1a;
          --radius: 12px;
          --max: 1100px;
        }

        nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(11,11,20,0.90);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid var(--border);
        }

        .nav-inner {
          max-width: var(--max);
          margin: 0 auto;
          height: 62px;
          padding: 0 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-logo {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text);
          text-decoration: none;
          letter-spacing: -0.02em;
          font-family: 'Inter', sans-serif;
        }

        .nav-logo span { color: var(--accent); }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .nav-link {
          color: var(--muted);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
          transition: color 0.2s;
        }

        .nav-link:hover { color: var(--text); }

        .nav-hamburger {
          display: none;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: none;
          border: none;
          color: var(--text);
          cursor: pointer;
          padding: 0;
          flex-shrink: 0;
        }

        .nav-mobile-menu {
          display: none;
          flex-direction: column;
          padding: 4px 16px 12px;
          border-bottom: 1px solid var(--border);
          background: rgba(11,11,20,0.98);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .nav-mobile-menu.open { display: flex; }

        .nav-mobile-link {
          color: var(--text);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
          padding: 14px 4px;
          border-bottom: 1px solid var(--border2);
        }

        .nav-mobile-link:last-child { border-bottom: none; }

        .nav-cta {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 9px 22px;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s, box-shadow 0.2s;
        }

        .nav-cta:hover { background: var(--accent2); box-shadow: 0 4px 20px rgba(124,106,247,0.3); }

        footer {
          background: var(--bg);
          border-top: 1px solid var(--border);
          padding: 32px 28px;
        }

        .footer-inner {
          max-width: var(--max);
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          text-align: center;
        }

        .footer-logo {
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          font-family: 'Inter', sans-serif;
          color: var(--text);
        }
        .footer-logo span { color: var(--accent); }

        .footer-links {
          display: flex;
          gap: 22px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .footer-links a {
          color: var(--muted);
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
          transition: color 0.2s;
        }

        .footer-links a:hover { color: var(--text); }
        .footer-copy {
          font-size: 0.75rem;
          color: var(--muted);
          font-family: 'Inter', sans-serif;
        }

        @media (max-width: 767px) {
          .nav-inner { padding: 0 16px !important; height: 56px !important; }
          .nav-logo { font-size: 1.1rem !important; }
          .nav-links { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-cta { padding: 8px 16px !important; font-size: 0.75rem !important; }
          footer { padding: 32px 16px !important; }
        }

        /* ===== Existing blog page styles ===== */
        html,
        body {
          background: #ffffff;
          color: #0f172a;
        }
        .blog-page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 60px 24px 80px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #ffffff;
          color: #0f172a;
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
        .blog-card-image {
          overflow: hidden;
          background: #f3f6fb;
        }
        .blog-card-img {
          width: 100%;
          height: auto;
          object-fit: contain;
          display: block;
        }
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

      <nav>
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            Cal<span>nize</span>
          </Link>
          <div className="nav-right" style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <div className="nav-links">
              <a href="/#pricing" className="nav-link">Pricing</a>
              <Link href="/blog" className="nav-link">Blog</Link>
            </div>
            <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <a href="https://www.producthunt.com/products/calnize?utm_source=badge-follow&utm_medium=badge&utm_source=badge-calnize" target="_blank" rel="noopener noreferrer" className="hidden sm:block hover:opacity-90 transition-opacity">
                <img src="https://api.producthunt.com/widgets/embed-image/v1/follow.svg?product_id=1188123&theme=neutral" alt="Product Hunt" style={{ width: "176px", height: "38px" }} width="176" height="38" />
              </a>
              <a href={signupUrl} className="nav-cta">
                Get started
              </a>
              <button
                type="button"
                className="nav-hamburger"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((v) => !v)}
              >
                {mobileMenuOpen ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className={`nav-mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <a href="/#pricing" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
          <Link href="/blog" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
        </div>
      </nav>

      <div className="blog-page">
        <div className="blog-header">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        {categories.length > 0 && (
          <div className="blog-filters">
            <Link
              href="/blog"
              className={`filter-btn${activeCategorySlug === null ? ' active' : ''}`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog/${cat.slug}`}
                className={`filter-btn${activeCategorySlug === cat.slug ? ' active' : ''}`}
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

      <footer>
        <div className="footer-inner">
          <div className="footer-logo">
            Cal<span>nize</span>
          </div>
          <div className="footer-links">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/blog">Blog</Link>
            <a href="mailto:support@calnize.com?subject=Hello%20Calnize">
              Contact
            </a>
            <a href={loginUrl}>
              Login
            </a>
          </div>
          <p className="footer-copy">© 2026 Calnize. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}