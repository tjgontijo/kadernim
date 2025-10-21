import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  // Otimizações de performance
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // Headers para CORS
  async headers() {
    return [
      {
        source: '/api/v1/auth/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ]
      }
    ];
  },
  
  // Otimizar navegação
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cewnwprpymsgiphympeg.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.yampi.me',
        port: '',
        pathname: '/assets/stores/**',
      },
      {
        protocol: 'https',
        hostname: 'king-assets.yampi.me',
        port: '',
        pathname: '/**',
      }
    ],
  }
};



export default nextConfig;
