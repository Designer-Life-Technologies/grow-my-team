import { NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"

// Export the middleware with Next-Auth's withAuth wrapper
export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(request) {
    const { pathname } = request.nextUrl
    const { token } = request.nextauth

    // If user is logged in and trying to access login page,
    // redirect to employer dashboard
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/employer/dashboard", request.url))
    }

    // Employer routes require employer authentication.
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
      const isReferencesPage = pathname.startsWith(
        `/application/${applicationId}/references`,
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
      } else if (token.pinAction === "REFERENCES") {
        if (!isPinPage && !isReferencesPage && !isBaseRoute) {
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

      return NextResponse.next()
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
          return NextResponse.next()
        }
        const pinUrl = new URL(`/application/${id}/pin`, request.url)
        pinUrl.searchParams.set("next", pathname)
        return NextResponse.redirect(pinUrl)
      }
    } else if (token.userType === "applicant") {
      // Applicants are redirected to PIN entry if they try to access /application/[id]/*
      if (pathname.startsWith("/application/")) {
        const pathParts = pathname.split("/")
        if (pathParts.length >= 3) {
          const id = pathParts[2]
          const isPinPage = pathParts.length >= 4 && pathParts[3] === "pin"
          if (isPinPage) {
            return NextResponse.next()
          }
          const pinUrl = new URL(`/application/${id}/pin`, request.url)
          pinUrl.searchParams.set("next", pathname)
          return NextResponse.redirect(pinUrl)
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Return true if the token exists
      authorized: ({ token, req }) => {
        // Allow the request to reach our middleware so we can redirect
        // to the correct sign-in page based on route type.
        void token
        void req
        return true
      },
    },
  },
)

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/employer/:path*", // All employer routes (dashboard, positions, candidates, settings)
    "/application/:path*", // Applicant application routes
    "/dashboard/:path*", // Applicant authenticated routes
  ],
}
