import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { resolveGetMeApiUrlWithSource } from "@/lib/api/getme-api-url"
import { getOrganisationIdBySlug } from "@/lib/db/themes"
import { resolveTheme } from "@/lib/theme/resolver"

/**
 * GET /api/config/debug-info
 * Returns comprehensive debug information about current configuration:
 * - Theme ID and source
 * - Organisation ID
 * - API endpoint and source
 * - Resolution path
 *
 * Only available in development mode
 */
export async function GET(request: Request) {
  // Security: Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Debug endpoint only available in development" },
      { status: 403 },
    )
  }

  try {
    const headersList = await headers()
    const host = headersList.get("host") || "localhost"
    const { searchParams } = new URL(request.url)
    const themeParam = searchParams.get("theme")

    // Resolve theme
    const { theme, source: themeSource } = await resolveTheme(
      Object.fromEntries(searchParams),
    )

    // Resolve organisation ID
    const organisationId = await getOrganisationIdBySlug(theme.id)

    // Resolve API endpoint
    const { endpoint: apiEndpoint, source: apiSource } =
      await resolveGetMeApiUrlWithSource(host, themeParam)

    return NextResponse.json({
      host,
      theme: {
        id: theme.id,
        name: theme.name,
        source: themeSource,
      },
      organisationId,
      apiEndpoint: {
        url: apiEndpoint,
        source: apiSource,
      },
      resolutionPath: {
        themeSource,
        hasOrganisationId: !!organisationId,
        apiSource,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[API/config/debug-info] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch debug info" },
      { status: 500 },
    )
  }
}
