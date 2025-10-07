/**
 * Global Root Layout
 *
 * This is the top-level layout for the entire application. It wraps ALL routes
 * and provides global providers, fonts, and styles.
 *
 * Purpose:
 * - Defines the HTML structure (<html>, <body>) for the entire app
 * - Provides global context providers (Theme, Auth) to all nested layouts and pages
 * - Loads and applies global fonts (Geist Sans, Geist Mono)
 * - Imports global CSS styles
 * - Manages global UI elements (favicon, toast notifications)
 *
 * Layout Hierarchy:
 * app/layout.tsx (THIS FILE - Global providers)
 * ├── app/employer/layout.tsx (Authenticated employer routes - /employer/*)
 * │   ├── app/employer/dashboard/page.tsx
 * │   └── ... other employer pages
 * ├── app/(candidate)/(public)/layout.tsx (Public candidate routes - root level)
 * │   ├── app/(candidate)/(public)/page.tsx (/)
 * │   ├── app/(candidate)/(public)/position/[id]/page.tsx (/position/[id])
 * │   └── ... other candidate pages
 * └── app/(auth)/... (Authentication pages - /login, /set-password)
 *
 * Important Notes:
 * - This layout should ONLY contain global providers and configuration
 * - Route-specific UI (sidebars, headers, etc.) should be in nested layouts
 * - All child routes automatically inherit the providers defined here
 * - Changes to this file affect the entire application
 */
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme"
import "./globals.css"
import { Suspense } from "react"
import { AuthProvider } from "@/components/auth"
import { ClientFavicon } from "@/components/layout"
import { StreamingModalProvider } from "@/components/ui/StreamingModalProvider"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

/**
 * Generate dynamic metadata based on the current theme/client
 * This replaces the static metadata export to support white labeling
 */
export async function generateMetadata({
  params,
}: {
  params: Record<string, string>
}): Promise<Metadata> {
  // Import dynamically to avoid issues with server components
  const { generateDynamicMetadata } = await import("@/lib/metadata")
  return generateDynamicMetadata(params)
}

/**
 * Root Layout Component
 *
 * This component defines the overall structure of the application.
 * It wraps the entire app with necessary providers and sets up global styles.
 *
 * Provider Structure (from outside to inside):
 * 1. ThemeProvider - Manages theme state and provides theme context to all components
 * 2. AuthProvider - Wraps Next-Auth's SessionProvider to enable authentication throughout the app
 * 3. Suspense - Used selectively for components that may trigger suspense
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ThemeProvider: Manages theme state and provides theme context */}
        <ThemeProvider>
          {/* AuthProvider: Provides authentication session to all components */}
          <AuthProvider>
            {/* StreamingModalProvider: Provides global access to streaming modal for long-running operations */}
            <StreamingModalProvider>
              {/* 
                Suspense boundary only for ClientFavicon:
                - Isolates loading state to just the favicon component
                - Allows main content to render immediately without waiting
                - Improves perceived performance by not blocking main content
                - Uses null fallback since favicon loading shouldn't show a visual indicator
              */}
              <Suspense fallback={null}>
                <ClientFavicon />
              </Suspense>

              {/* 
                Main content not wrapped in Suspense at root level:
                - Allows pages to handle their own loading states
                - Enables more granular control of loading indicators
                - Improves initial page load performance
                - Individual page components can implement their own Suspense boundaries as needed
              */}
              {children}
              <Toaster />
            </StreamingModalProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
