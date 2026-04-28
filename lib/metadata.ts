import type { Metadata, Viewport } from "next"
import { headers } from "next/headers"
import { getCachedTheme } from "@/lib/theme/cache"
import { getThemeFromDomain } from "@/lib/theme/config"
import type { Theme } from "@/lib/theme/types"

type RouteParams = {
  host?: string
  [key: string]: string | undefined
}

/**
 * Generates dynamic metadata based on the current theme/client
 * This function is used in the generateMetadata function in layout.tsx
 *
 * @param params Optional route parameters with host information
 * @returns Metadata object for Next.js
 */
export async function generateDynamicViewport(): Promise<Viewport> {
  let themeId: string | undefined
  try {
    const headersList = await headers()
    const headerTheme = headersList.get("X-Theme")
    if (headerTheme && headerTheme !== "default") themeId = headerTheme
  } catch {
    // headers() throws during build — ignore
  }

  if (themeId && themeId !== "default") {
    try {
      const theme = await getCachedTheme(themeId)
      if (theme) {
        return { themeColor: theme.colors.light.primary }
      }
    } catch {
      // ignore
    }
  }

  return {}
}

export async function generateDynamicMetadata(
  params?: RouteParams,
): Promise<Metadata> {
  // Get theme ID — priority: middleware header > env var > domain > fallback
  let themeId: string | undefined

  // Priority 1: Middleware-forwarded X-Theme header (set by proxy.ts for every request)
  try {
    const headersList = await headers()
    const headerTheme = headersList.get("X-Theme")
    if (headerTheme && headerTheme !== "default") themeId = headerTheme
  } catch {
    // headers() throws during build — ignore
  }

  // Priority 2: Environment variable override
  if (!themeId && process.env.NEXT_PUBLIC_THEME_ID) {
    themeId = process.env.NEXT_PUBLIC_THEME_ID
  }

  // Priority 3: Domain-based resolution
  if (!themeId && typeof window === "undefined" && params?.host) {
    try {
      themeId = await getThemeFromDomain(params.host)
    } catch (error) {
      console.warn("Failed to get theme from domain:", error)
    }
  }

  // Get the theme configuration from database
  let theme: Theme | null = null
  if (themeId && themeId !== "default") {
    try {
      theme = await getCachedTheme(themeId)
    } catch (error) {
      console.warn("Failed to get cached theme:", error)
    }
  }

  if (!theme) {
    // Fallback to default metadata if theme not found
    return {
      title: "Grow My Team",
      description: "AI Recruitment Agent",
    }
  }

  // Generate metadata based on theme
  return {
    title: {
      default: theme.branding.companyName,
      template: `%s | ${theme.branding.companyName}`,
    },
    description: theme.branding.description || "AI Recruitment Agent",
    keywords: theme.branding.keywords || ["recruitment", "AI", "hiring"],
    authors: [
      {
        name: theme.branding.companyName,
        url: theme.branding.website || "",
      },
    ],
    creator: theme.branding.companyName,
    publisher: theme.branding.companyName,
    // Favicon and icons
    icons: {
      icon: theme.branding.favicon || "/favicon.ico",
      apple: theme.branding.appleTouchIcon || "/apple-touch-icon.png",
    },
    // Open Graph metadata
    openGraph: {
      type: "website",
      siteName: theme.branding.companyName,
      title: theme.branding.companyName,
      description: theme.branding.description || "AI Recruitment Agent",
      images: theme.branding.ogImage ? [theme.branding.ogImage] : undefined,
    },
    // Twitter metadata
    twitter: {
      card: "summary_large_image",
      title: theme.branding.companyName,
      description: theme.branding.description || "AI Recruitment Agent",
      images: theme.branding.twitterImage
        ? [theme.branding.twitterImage]
        : undefined,
      creator: theme.branding.twitterHandle || "",
    },
  }
}
