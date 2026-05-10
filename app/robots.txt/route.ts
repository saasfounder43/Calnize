import { NextResponse } from 'next/server'

const body = `User-agent: *\nAllow: /\nSitemap: https://calnize.com/sitemap.xml\n`

export async function GET() {
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
