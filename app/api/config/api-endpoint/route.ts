import { NextResponse } from "next/server"
import { resolveGetMeApiUrlWithSource } from "@/lib/api/getme-api-url"

/**
 * GET /api/config/api-endpoint
 * Returns the current API endpoint being used for the host, including the source
 */
export async function GET(request: Request) {
  try {
    const host = request.headers.get("host")
    const { searchParams } = new URL(request.url)
    const themeParam = searchParams.get("theme")

    const { endpoint, source } = await resolveGetMeApiUrlWithSource(
      host,
      themeParam,
    )

    return NextResponse.json({
      host,
      apiEndpoint: endpoint,
      source,
      themeParam,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[API/config/api-endpoint] Error:", error)
    return NextResponse.json(
      { error: "Failed to resolve API endpoint" },
      { status: 500 },
    )
  }
}
