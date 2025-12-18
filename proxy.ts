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

    // Employer routes require staff authentication.
    if (!token && pathname.startsWith("/employer/")) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Applicant protected routes should use the applicant login page.
    if (
      !token &&
      (pathname.startsWith("/profile/") || pathname.startsWith("/dashboard/"))
    ) {
      // Allow the nonce bootstrap flow for the test page so it can redirect to /auth/callback.
      if (pathname === "/profile/test") {
        const { searchParams } = request.nextUrl
        const nonce = searchParams.get("n")
        const applicantId = searchParams.get("applicantId")
        const email = searchParams.get("email")

        if (nonce && (applicantId || email)) {
          return NextResponse.next()
        }
      }

      return NextResponse.redirect(new URL("/applicant/login", request.url))
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
    "/profile/:path*", // Applicant authenticated routes
    "/dashboard/:path*", // Applicant authenticated routes
  ],
}
