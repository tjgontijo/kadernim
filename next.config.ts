import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        source: '/api/v1/auth/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lp.profdidatica.com.br',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.yampi.me',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'king-assets.yampi.me',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
