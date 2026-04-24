import { NextResponse } from "next/server"
import { API_SERVERS, getApiServerOptions } from "@/lib/config/api-servers"

/**
 * GET /api/admin/api-servers
 * Get available API server options for client configuration
 */
export async function GET() {
  const options = getApiServerOptions()
  return NextResponse.json({
    servers: API_SERVERS,
    options,
  })
}
