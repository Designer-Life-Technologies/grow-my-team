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

    return NextResponse.next()
  },
  {
    callbacks: {
      // Return true if the token exists
      authorized: ({ token }) => !!token,
    },
  },
)

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/", // Home page
    "/employer/:path*", // All employer routes (dashboard, positions, candidates, settings)
  ],
}
