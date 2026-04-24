import { NextResponse } from "next/server"
import { resolveGetMeApiUrl } from "@/lib/api/getme-api-url"

/**
 * GET /api/config/api-endpoint
 * Returns the current API endpoint being used for the host
 */
export async function GET(request: Request) {
  try {
    const host = request.headers.get("host")
    const apiEndpoint = await resolveGetMeApiUrl(host)

    return NextResponse.json({
      host,
      apiEndpoint,
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
