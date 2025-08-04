import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Project already uses Biome for linting
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
