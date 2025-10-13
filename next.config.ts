import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["placehold.co", "cewnwprpymsgiphympeg.supabase.co"],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cewnwprpymsgiphympeg.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  }
};

export default nextConfig;
