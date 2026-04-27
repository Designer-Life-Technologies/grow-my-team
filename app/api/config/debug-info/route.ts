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
  // Security: Allow in development, staging, UAT, preview (but not production)
  // Check multiple indicators: NODE_ENV, Vercel env, host pattern
  const isDev = process.env.NODE_ENV !== "production"
  const enableDebug = process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true"
  const vercelEnv = process.env.VERCEL_ENV || ""

  if (!isDev && !enableDebug && vercelEnv !== "preview") {
    // Additional check: allow if host contains staging/uat/preview
    const headersList = await headers()
    const host = headersList.get("host") || ""
    const isNonProdHost =
      host.includes("uat") ||
      host.includes("staging") ||
      host.includes("preview") ||
      host.includes("dev") ||
      host.includes("localhost") ||
      host.includes("127.0.0.1")

    if (!isNonProdHost) {
      return NextResponse.json(
        { error: "Debug endpoint not available in production" },
        { status: 403 },
      )
    }
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
