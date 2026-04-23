import { NextResponse } from "next/server"
import { getCachedTheme } from "@/lib/theme/cache"

interface RouteParams {
  params: Promise<{ slug: string }>
}

/**
 * GET /api/themes/[slug]
 * Returns theme data for a given client slug
 * Cached for 1 hour via unstable_cache
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params
    const theme = await getCachedTheme(slug)

    if (!theme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 })
    }

    // Add cache headers for CDN
    return NextResponse.json(theme, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Error fetching theme:", error)
    return NextResponse.json(
      { error: "Failed to fetch theme" },
      { status: 500 },
    )
  }
}
