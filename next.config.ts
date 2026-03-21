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
};

export default nextConfig;
