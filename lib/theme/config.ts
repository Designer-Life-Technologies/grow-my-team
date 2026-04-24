import { getThemeByCustomDomain, getThemeBySlug } from "@/lib/db/themes"

// Stub for backward compatibility - throws since we're database-driven
export const getTheme = (): never => {
  throw new Error(
    "getTheme() is deprecated - use database themes via getCachedTheme() instead",
  )
}

/**
 * Get theme from domain (database-driven with default fallback)
 * Checks database for client_slug (subdomain) and custom_domain matches, then falls back to default theme
 */
export async function getThemeFromDomain(hostname: string): Promise<string> {
  const normalizedHost = hostname.split(":")[0]?.toLowerCase() || ""

  // Extract subdomain (first part of hostname)
  const subdomain = normalizedHost.split(".")[0] || normalizedHost

  // Priority 1: Check database for subdomain match using client_slug (e.g., "shr" for shr.applicant.growmy.team)
  const themeFromSubdomain = await getThemeBySlug(subdomain)
  if (themeFromSubdomain) {
    return themeFromSubdomain.client_slug
  }

  // Priority 2: Check database for custom domain match (e.g., "shr.applicant.growmy.team")
  const themeFromDb = await getThemeByCustomDomain(normalizedHost)
  if (themeFromDb) {
    return themeFromDb.client_slug
  }

  // Default theme
  return "default"
}
