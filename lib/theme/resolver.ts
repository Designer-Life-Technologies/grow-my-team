import { headers } from "next/headers"
import { getCachedTheme, getCachedThemeList } from "./cache"
import { getThemeFromDomain } from "./config"
import type { Theme } from "./types"

/**
 * Resolve theme from various sources (in priority order):
 * 1. ?theme= query parameter (for preview)
 * 2. Subdomain/host mapping (virgin.growmyteam.io)
 * 3. Custom domain mapping
 * 4. Environment variable default
 * 5. "default" theme
 */
export async function resolveTheme(
  searchParams?: Record<string, string | undefined>,
): Promise<{ theme: Theme; source: ThemeSource }> {
  const headersList = await headers()
  const host = headersList.get("host") || "localhost"

  // Priority 1: Query parameter (?theme=virgin)
  const queryTheme = searchParams?.theme
  if (queryTheme) {
    const theme = await getCachedTheme(queryTheme)
    if (theme) {
      return { theme, source: "query" }
    }
  }

  // Priority 2: Subdomain/host mapping
  const domainThemeId = await getThemeFromDomain(host)
  if (domainThemeId) {
    const dbTheme = await getCachedTheme(domainThemeId)
    if (dbTheme) {
      return { theme: dbTheme, source: "custom-domain" }
    }
  }

  // Priority 3: Custom domain (future: check database for custom_domain column)
  // TODO: Implement when custom_domain column is populated

  // Priority 4 & 5: Environment variable or default
  const defaultThemeId = process.env.NEXT_PUBLIC_THEME_ID || "default"

  // Try database first
  const dbDefaultTheme = await getCachedTheme(defaultThemeId)
  if (dbDefaultTheme) {
    return { theme: dbDefaultTheme, source: "database" }
  }

  // Error: theme not found in database
  throw new Error(`Theme "${defaultThemeId}" not found in database`)
}

/**
 * Get all available themes for theme selector
 */
export async function getAvailableThemes(): Promise<
  { id: string; name: string }[]
> {
  // Get themes from database only
  const dbThemes = await getCachedThemeList()
  return dbThemes
}

export type ThemeSource = "query" | "subdomain" | "custom-domain" | "database"

/**
 * Check if theme is from dynamic source (database)
 */
export function isDynamicSource(source: ThemeSource): boolean {
  return ["query", "subdomain", "custom-domain", "database"].includes(source)
}
