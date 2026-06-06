import { NextResponse } from 'next/server'
import { getPublishedPosts, getCategories } from '@/lib/blog'

const SITE_URL = 'https://calnize.com'

function formatDate(dateString: string) {
  return new Date(dateString).toISOString()
}

function buildUrl(path: string, lastmod?: string, priority?: number) {
  return `  <url>\n    <loc>${SITE_URL}${path}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}${priority ? `    <priority>${priority.toFixed(1)}</priority>\n` : ''}  </url>`
}

export async function GET() {
  const [posts, categories] = await Promise.all([getPublishedPosts(), getCategories()])
  const pages = ['/', '/blog', '/privacy', '/terms']
  const urls = pages.map((page) => buildUrl(page, undefined, page === '/' ? 1.0 : 0.8))

  const postUrls = posts.map((post) => {
    const lastmod = post.published_at ? formatDate(post.published_at) : undefined
    return buildUrl(`/blog/${post.slug}`, lastmod, 0.7)
  })

  const categoryUrls = categories.map((cat) =>
    buildUrl(`/blog/${cat.slug}`, undefined, 0.75),
  )

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls, ...categoryUrls, ...postUrls].join('\n')}\n</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  })
}
