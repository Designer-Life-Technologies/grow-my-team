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
    // Cache headers: disabled in dev/UAT, 1 hour in production
    const cacheHeaders =
      process.env.NODE_ENV === "production"
        ? {
            "Cache-Control":
              "public, max-age=3600, stale-while-revalidate=86400",
          }
        : { "Cache-Control": "no-store, no-cache, must-revalidate" }
    return NextResponse.json(theme, {
      headers: cacheHeaders,
    })
  } catch (error) {
    console.error(`[API/themes] Error fetching theme:`, error)
    return NextResponse.json(
      { error: "Failed to fetch theme" },
      { status: 500 },
    )
  }
}
