import { NextResponse } from "next/server"
import { getCachedThemeList } from "@/lib/theme/cache"

/**
 * GET /api/themes
 * Returns list of all active themes (id and name only)
 * Cached for 1 hour via unstable_cache
 */
export async function GET() {
  try {
    const themes = await getCachedThemeList()

    // Add cache headers for CDN
    return NextResponse.json(
      { themes },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      },
    )
  } catch (error) {
    console.error("Error fetching themes:", error)
    return NextResponse.json(
      { error: "Failed to fetch themes" },
      { status: 500 },
    )
  }
}
