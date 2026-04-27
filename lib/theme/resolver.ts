import { headers } from "next/headers"
import { getCachedTheme, getCachedThemeList } from "./cache"
import { getThemeFromDomain } from "./config"
import { DEFAULT_THEME } from "./constants"
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
      console.log(
        `[ThemeResolver] ✓ Using theme "${theme.id}" from query parameter`,
      )
      return { theme, source: "query" }
    }
  }

  // Priority 2: Subdomain/host mapping
  const domainThemeId = await getThemeFromDomain(host)
  if (domainThemeId) {
    const dbTheme = await getCachedTheme(domainThemeId)
    if (dbTheme) {
      console.log(
        `[ThemeResolver] ✓ Using theme "${dbTheme.id}" from domain mapping`,
      )
      return { theme: dbTheme, source: "custom-domain" }
    }
  }

  // Priority 3: Default theme
  const dbDefaultTheme = await getCachedTheme("default")
  if (dbDefaultTheme) {
    console.log(
      `[ThemeResolver] ✓ Using theme "${dbDefaultTheme.id}" from database`,
    )
    return { theme: dbDefaultTheme, source: "database" }
  }

  // Ultimate fallback: hardcoded default theme
  console.warn(`[ThemeResolver] ⚠ Using hardcoded default theme (fallback)`)
  return { theme: DEFAULT_THEME, source: "database" }
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
