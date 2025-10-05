import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Project already uses Biome for linting
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Increase body size limit for resume uploads (default is 1MB)
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
}

export default nextConfig
