import type { NextRequest } from "next/server"

/**
 * POST /api/candidate/create
 *
 * Creates a new applicant (candidate) in GetMe.video and proxies the SSE stream to the client.
 * This endpoint processes resume uploads and creates applicant records.
 * This is a public endpoint that doesn't require authentication.
 *
 * Why this route is needed:
 *
 * 1. **CORS Handling**: Direct browser requests to external APIs often fail due to CORS restrictions.
 *    This Next.js API route acts as a proxy, making the request server-side where CORS doesn't apply.
 *
 * 2. **Environment Variable Security**: The GetMe.video API URL is stored in GETME_API_URL environment
 *    variable, which is only accessible server-side. This prevents exposing the API endpoint to clients.
 *
 * 3. **SSE Stream Proxying**: The GetMe.video API returns Server-Sent Events (SSE) for real-time
 *    progress updates during resume processing. This route forwards the SSE stream to the client,
 *    enabling real-time feedback during AI processing without buffering the entire response.
 *
 * 4. **Error Handling**: Provides consistent error handling and formatting for client consumption,
 *    translating API errors into user-friendly messages.
 *
 * 5. **Request Transformation**: Handles FormData from the client (resume file + metadata) and
 *    forwards it to the GetMe.video API in the correct format.
 *
 * Flow:
 * Client → Next.js API Route → GetMe.video API → SSE Stream → Client
 *
 * @param request - NextRequest containing FormData with resume file and vacancyId
 * @returns Response - SSE stream or error JSON
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Forward request to GetMe.video API
    const response = await fetch(
      `${process.env.GETME_API_URL}/public/applicant`,
      {
        method: "POST",
        body: formData,
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return new Response(
        JSON.stringify({
          error: errorData.detail || "Failed to submit application",
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    if (!response.body) {
      return new Response(JSON.stringify({ error: "No response body" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Proxy the SSE stream directly from the API
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
