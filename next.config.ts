import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'omzszsbqcrdejfdmkmmo.supabase.co', // Storage domain
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google profile pics
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      // The blog is marketing/SEO content and should live on the public
      // marketing domain, not the app subdomain. Anyone hitting /blog on
      // app.calnize.com gets permanently redirected to the www version —
      // this also resolves the duplicate-content risk of the same blog
      // content being reachable at two different hostnames.
      {
        source: '/blog',
        has: [{ type: 'host', value: 'app.calnize.com' }],
        destination: 'https://www.calnize.com/blog',
        permanent: true,
      },
      {
        source: '/blog/:path*',
        has: [{ type: 'host', value: 'app.calnize.com' }],
        destination: 'https://www.calnize.com/blog/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;