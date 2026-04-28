import type { NextConfig } from "next"
import { version } from "./package.json"

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
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
