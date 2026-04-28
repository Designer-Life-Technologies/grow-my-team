import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"
import { getThemeByCustomDomain, getThemeBySlug } from "@/lib/db/themes"
import { THEME_COOKIE_NAME } from "@/lib/theme/resolver"

/**
 * Resolve client config directly from the DB (no unstable_cache).
 * unstable_cache requires Next.js incrementalCache which is unavailable in middleware.
 * Sets X-ApiEndpoint / X-OrganisationId / X-Theme on both request and response headers.
 */
async function resolveAndAttach(
  request: NextRequest,
  response: NextResponse,
  requestHeaders: Headers,
): Promise<void> {
  try {
    const url = new URL(request.url)
    const themeParam = url.searchParams.get("theme") || undefined
    const host = request.headers.get("host") || "localhost"
    const defaultApiEndpoint = process.env.GETME_API_URL || ""

    let themeSlug = "default"
    let organisationId: string | null = null
    let apiEndpoint = defaultApiEndpoint

    // Priority 1: Query parameter (?theme=carrick)
    if (themeParam) {
      if (themeParam !== "default") {
        const row = await getThemeBySlug(themeParam)
        if (row) {
          themeSlug = row.client_slug
          organisationId = row.organisation_id
          apiEndpoint = row.gmt_api_endpoint || defaultApiEndpoint
        }
      }
      // If not found or explicitly "default", themeSlug stays "default"
    } else {
      // Priority 2: Subdomain/host
      const normalizedHost = host.split(":")[0]?.toLowerCase() || ""
      const subdomain = normalizedHost.split(".")[0] || normalizedHost
      const hostRow =
        (await getThemeBySlug(subdomain)) ||
        (await getThemeByCustomDomain(normalizedHost))

      if (hostRow) {
        themeSlug = hostRow.client_slug
        organisationId = hostRow.organisation_id
        apiEndpoint = hostRow.gmt_api_endpoint || defaultApiEndpoint
      } else {
        // Priority 3: Cookie
        const cookieTheme = request.cookies.get(THEME_COOKIE_NAME)?.value
        if (cookieTheme && cookieTheme !== "default") {
          const cookieRow = await getThemeBySlug(cookieTheme)
          if (cookieRow) {
            themeSlug = cookieRow.client_slug
            organisationId = cookieRow.organisation_id
            apiEndpoint = cookieRow.gmt_api_endpoint || defaultApiEndpoint
          }
        }
      }
    }

    // Forward to server components via request headers
    requestHeaders.set("X-ApiEndpoint", apiEndpoint)
    requestHeaders.set("X-OrganisationId", organisationId || "")
    requestHeaders.set("X-Theme", themeSlug)

    // Also set on response headers (for browser/debug tooling)
    response.headers.set("X-ApiEndpoint", apiEndpoint)
    response.headers.set("X-OrganisationId", organisationId || "")
    response.headers.set("X-Theme", themeSlug)

    // Persist theme cookie so subsequent requests resolve correctly without ?theme=
    if (themeParam && themeParam !== "default") {
      response.cookies.set(THEME_COOKIE_NAME, themeParam, {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }

    console.log(
      `[Proxy] ✓ Resolved: theme=${themeSlug}, endpoint=${apiEndpoint}, org=${organisationId || "none"}`,
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
