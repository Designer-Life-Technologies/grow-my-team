import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"
import { resolveClientConfig } from "@/lib/config/client-config"
import { THEME_COOKIE_NAME } from "@/lib/theme/resolver"

/**
 * Resolve client config and set response headers + cookie.
 * Always runs for every request so the root layout can read
 * X-ApiEndpoint / X-OrganisationId / X-Theme from headers.
 */
async function resolveAndAttach(
  request: NextRequest,
  response: NextResponse,
  requestHeaders: Headers,
): Promise<void> {
  try {
    const url = new URL(request.url)
    const themeParam = url.searchParams.get("theme") || undefined

    const searchParams: Record<string, string | undefined> = {}
    if (themeParam) searchParams.theme = themeParam

    const config = await resolveClientConfig(searchParams)

    // Set on requestHeaders so server components (layout, pages) can read via headers()
    requestHeaders.set("X-ApiEndpoint", config.apiEndpoint)
    requestHeaders.set("X-OrganisationId", config.organisationId || "")
    requestHeaders.set("X-Theme", config.theme.id)

    // Also set on response headers for the browser (e.g. debug tooling)
    response.headers.set("X-ApiEndpoint", config.apiEndpoint)
    response.headers.set("X-OrganisationId", config.organisationId || "")
    response.headers.set("X-Theme", config.theme.id)

    // Persist theme in cookie so subsequent requests (without ?theme=) resolve correctly
    if (themeParam && themeParam !== "default") {
      response.cookies.set(THEME_COOKIE_NAME, themeParam, {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }

    console.log(
      `[Proxy] ✓ Resolved: theme=${config.theme.id}, endpoint=${config.apiEndpoint}, org=${config.organisationId || "none"}`,
    )
  } catch (error) {
    console.error("[Proxy] Failed to resolve client config:", error)
  }
}

// Export the middleware with Next-Auth's withAuth wrapper
export default withAuth(
  async function middleware(request) {
    const { pathname } = request.nextUrl
    const { token } = request.nextauth

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      })
    }

    // Resolve client config for every request and forward via request headers
    // (response.headers only reach the browser; request headers reach server components)
    const requestHeaders = new Headers(request.headers)
    const response = NextResponse.next({ request: { headers: requestHeaders } })
    await resolveAndAttach(request, response, requestHeaders)

    // Auth redirects — employer routes (to be deprecated)
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/employer/dashboard", request.url))
    }
    if (!token && pathname.startsWith("/employer/")) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Application-scope users only have access to /application/[id]/* routes.
    if (token?.userType === "application") {
      if (!pathname.startsWith("/application/")) {
        return NextResponse.redirect(new URL("/", request.url))
      }

      const pathParts = pathname.split("/")
      const applicationId = pathParts[2]
      const isPinPage = pathParts[3] === "pin"
      const isBaseRoute = pathname === `/application/${applicationId}`
      const isProfileTestPage = pathname.startsWith(
        `/application/${applicationId}/profiletest`,
      )
      const isRefereesPage = pathname.startsWith(
        `/application/${applicationId}/referees`,
      )

      if (token.pinAction === "PROFILING") {
        if (!isPinPage && !isProfileTestPage && !isBaseRoute) {
          if (!applicationId) {
            return NextResponse.redirect(new URL("/", request.url))
          }
          const pinUrl = new URL(
            `/application/${applicationId}/pin`,
            request.url,
          )
          pinUrl.searchParams.set("next", pathname)
          return NextResponse.redirect(pinUrl)
        }
      } else if (token.pinAction === "REFEREES") {
        if (!isPinPage && !isRefereesPage && !isBaseRoute) {
          if (!applicationId) {
            return NextResponse.redirect(new URL("/", request.url))
          }
          const pinUrl = new URL(
            `/application/${applicationId}/pin`,
            request.url,
          )
          pinUrl.searchParams.set("next", pathname)
          return NextResponse.redirect(pinUrl)
        }
      }

      return response
    }

    // Applicant protected routes.
    if (!token) {
      if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
        return NextResponse.redirect(new URL("/", request.url))
      }

      if (pathname.startsWith("/application/")) {
        const pathParts = pathname.split("/")
        const id = pathParts.length >= 3 ? pathParts[2] : null
        const isPinPage = pathParts.length >= 4 && pathParts[3] === "pin"
        if (!id) {
          return NextResponse.redirect(new URL("/", request.url))
        }
        if (isPinPage) {
          return response
        }
        const pinUrl = new URL(`/application/${id}/pin`, request.url)
        pinUrl.searchParams.set("next", pathname)
        return NextResponse.redirect(pinUrl)
      }
    } else if (token.userType === "applicant") {
      if (pathname.startsWith("/application/")) {
        const pathParts = pathname.split("/")
        if (pathParts.length >= 3) {
          const id = pathParts[2]
          const isPinPage = pathParts.length >= 4 && pathParts[3] === "pin"
          if (isPinPage) {
            return response
          }
          const pinUrl = new URL(`/application/${id}/pin`, request.url)
          pinUrl.searchParams.set("next", pathname)
          return NextResponse.redirect(pinUrl)
        }
      }
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        void token
        void req
        return true
      },
    },
  },
)

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
