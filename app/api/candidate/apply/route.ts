import type { NextRequest } from "next/server"

/**
 * POST /api/candidate/apply
 *
 * Proxies SSE stream from GetMe.video API to the client.
 * This is a public endpoint that doesn't require authentication.
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
