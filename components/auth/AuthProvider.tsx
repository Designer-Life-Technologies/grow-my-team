"use client"

import { SessionProvider, signOut, useSession } from "next-auth/react"
import { useEffect, useState } from "react"

/**
 * Session validator that checks for invalid/expired sessions
 * and clears them automatically
 */
function SessionValidator({ children }: { children: React.ReactNode }) {
  const { status, data: session } = useSession()
  const [isValidating, setIsValidating] = useState(true)

  useEffect(() => {
    // Check if we have a session that failed to load
    if (status === "unauthenticated") {
      // Check if there's stale session data in localStorage
      const hasStaleSession = localStorage.getItem("next-auth.session-token")

      if (hasStaleSession) {
        console.warn("Stale session detected, clearing...")

        // Clear all auth-related storage
        localStorage.removeItem("next-auth.session-token")
        localStorage.removeItem("next-auth.callback-url")
        localStorage.removeItem("next-auth.csrf-token")
        localStorage.removeItem("next-auth.session-state")
        localStorage.removeItem("token")
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")

        // Clear cookies
        document.cookie =
          "next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        document.cookie =
          "next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        document.cookie =
          "next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

        // Reload to get clean state
        window.location.reload()
        return
      }
    }

    setIsValidating(false)
  }, [status])

  if (isValidating && status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Error boundary component that catches session-related errors
 * and clears stale authentication data
 */
function SessionErrorHandler({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Handle session initialization errors
    const handleError = (event: ErrorEvent) => {
      // Check if error is auth-related
      if (
        event.error?.message?.includes("session") ||
        event.error?.message?.includes("token") ||
        event.error?.message?.includes("unauthorized") ||
        event.error?.message?.includes("JWT") ||
        event.error?.message?.includes("something went wrong")
      ) {
        console.warn("Session error detected, clearing stale auth data...")

        // Clear Next-Auth session storage
        localStorage.removeItem("next-auth.session-token")
        localStorage.removeItem("next-auth.callback-url")
        localStorage.removeItem("next-auth.csrf-token")
        localStorage.removeItem("next-auth.session-state")

        // Clear any other auth tokens
        localStorage.removeItem("token")
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")

        // Sign out to reset state
        signOut({ redirect: false })
        setHasError(true)

        // Reload to reset React state
        window.location.reload()
      }
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  // If we had an error, show a reset message briefly
  if (hasError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Resetting session...</p>
      </div>
    )
  }

  return <>{children}</>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <SessionValidator>
        <SessionErrorHandler>{children}</SessionErrorHandler>
      </SessionValidator>
    </SessionProvider>
  )
}
