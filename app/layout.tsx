import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme"
import "./globals.css"
import { Suspense } from "react"
import { AuthProvider } from "@/components/auth"
import { ClientFavicon } from "@/components/ClientFavicon"

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
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
