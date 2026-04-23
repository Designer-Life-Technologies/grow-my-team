import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    // Increase body size limit for resume uploads (default is 1MB)
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
}

export default nextConfig
