import type { Metadata } from "next"
import { getTheme, getThemeFromDomain } from "@/lib/theme"

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
export async function generateDynamicMetadata(
  params?: RouteParams,
): Promise<Metadata> {
  // Get theme ID from environment variable or domain
  let themeId: string | undefined

  // Check for environment variable first (highest priority)
  if (process.env.NEXT_PUBLIC_THEME_ID) {
    themeId = process.env.NEXT_PUBLIC_THEME_ID
  }
  // If running on server, try to detect from hostname
  else if (typeof window === "undefined" && params?.host) {
    themeId = getThemeFromDomain(params.host)
  }

  // Get the theme configuration
  const theme = getTheme(themeId)

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
    // Theme color based on primary color
    themeColor: theme.colors.primary,
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
