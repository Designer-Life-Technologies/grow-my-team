import { cookies, headers } from "next/headers"
import { getCachedTheme, getCachedThemeList } from "./cache"
import { getThemeFromDomain } from "./config"
import { DEFAULT_THEME } from "./constants"
import type { Theme } from "./types"

export const THEME_COOKIE_NAME = "theme-slug"

/**
 * Resolve theme from various sources (in priority order):
 * 1. ?theme= query parameter (highest — for preview/testing)
 * 2. Subdomain/host mapping (carrick.growmyteam.io or custom domain)
 * 3. Cookie (theme-slug) — persisted from previous ?theme= visit on a generic host
 * 4. "default" theme
 */
export async function resolveTheme(
  searchParams?: Record<string, string | undefined>,
): Promise<{ theme: Theme; source: ThemeSource }> {
  let host: string | undefined
  try {
    const headersList = await headers()
    host = headersList.get("host") || "localhost"
  } catch (_error) {
    // headers() throws when a request context is not available (e.g., during build).
    host = undefined
  }

  // Priority 1: Query parameter (?theme=carrick)
  // If an explicit ?theme= is present, it always wins — even if not in DB.
  // We do NOT fall through to cookie/subdomain when a query param is given.
  const queryTheme = searchParams?.theme
  if (queryTheme) {
    const theme = await getCachedTheme(queryTheme)
    if (theme) {
      console.log(
        `[ThemeResolver] ✓ Using theme "${theme.id}" from query parameter`,
      )
      return { theme, source: "query" }
    }
    // Theme slug not found in DB — treat as explicit request for default
    console.log(
      `[ThemeResolver] ✓ Query param "${queryTheme}" not in DB, using hardcoded default`,
    )
    return { theme: DEFAULT_THEME, source: "query" }
  }

  // Priority 2: Subdomain/host mapping (always trumps cookie)
  if (host) {
    const domainThemeId = await getThemeFromDomain(host)
    if (domainThemeId && domainThemeId !== "default") {
      const dbTheme = await getCachedTheme(domainThemeId)
      if (dbTheme) {
        console.log(
          `[ThemeResolver] ✓ Using theme "${dbTheme.id}" from domain mapping`,
        )
        return { theme: dbTheme, source: "custom-domain" }
      }
    }
  }

  // Priority 3: Cookie (persisted from previous ?theme= visit on a generic host)
  try {
    const cookieStore = await cookies()
    const cookieTheme = cookieStore.get(THEME_COOKIE_NAME)?.value
    if (cookieTheme && cookieTheme !== "default") {
      const theme = await getCachedTheme(cookieTheme)
      if (theme) {
        console.log(`[ThemeResolver] ✓ Using theme "${theme.id}" from cookie`)
        return { theme, source: "cookie" }
      }
    }
  } catch (_error) {
    // cookies() may throw during build
  }

  // Priority 4: Default theme from database
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

export type ThemeSource =
  | "query"
  | "cookie"
  | "subdomain"
  | "custom-domain"
  | "database"

/**
 * Check if theme is from dynamic source (database)
 */
export function isDynamicSource(source: ThemeSource): boolean {
  return ["query", "subdomain", "custom-domain", "database"].includes(source)
}
