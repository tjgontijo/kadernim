import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Otimizações de performance
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
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
