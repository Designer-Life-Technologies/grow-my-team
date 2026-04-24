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
    console.log(`[API/themes/${slug}] Fetching theme`)
    const theme = await getCachedTheme(slug)

    if (!theme) {
      console.log(`[API/themes/${slug}] ✗ Theme not found, returning 404`)
      return NextResponse.json({ error: "Theme not found" }, { status: 404 })
    }

    console.log(`[API/themes/${slug}] ✓ Returning theme`)
    // Temporarily disable caching for development
    return NextResponse.json(theme, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    })
  } catch (error) {
    console.error(`[API/themes] Error fetching theme:`, error)
    return NextResponse.json(
      { error: "Failed to fetch theme" },
      { status: 500 },
    )
  }
}
