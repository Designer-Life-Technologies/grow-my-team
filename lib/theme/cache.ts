import { unstable_cache } from "next/cache"
import type { ClientThemeRow } from "@/lib/db/themes"
import { getThemeBySlug, listThemes } from "@/lib/db/themes"
import type { Theme } from "./types"

// Cache TTL: false = disabled (dev/UAT), 3600 = 1 hour (production)
const CACHE_TTL = process.env.NODE_ENV === "production" ? 3600 : false

/**
 * Convert database row to Theme object
 */
function rowToTheme(row: ClientThemeRow): Theme {
  return {
    id: row.client_slug,
    name: row.name,
    supportsDarkMode: row.supports_dark_mode,
    colors: row.colors,
    branding: {
      companyName: row.company_name || row.name,
      logo: row.logo_url
        ? {
            light: row.logo_url,
            dark: row.logo_url,
            scale: row.logo_scale || 1.0,
          }
        : undefined,
      favicon: row.favicon_url || undefined,
      website: row.website || undefined,
    },
  }
}

/**
 * Get cached theme by slug
 * Cached for 1 hour in production, disabled in dev/UAT
 */
export const getCachedTheme = unstable_cache(
  async (slug: string): Promise<Theme | null> => {
    try {
      const row = await getThemeBySlug(slug)
      if (!row) {
        console.log(`[getCachedTheme] Theme "${slug}" not found in database`)
        return null
      }
      console.log(`[getCachedTheme] ✓ Found theme "${slug}" in database`)
      return rowToTheme(row)
    } catch (error) {
      // Handle missing database connection gracefully
      if (
        error instanceof Error &&
        error.message.includes("missing_connection_string")
      ) {
        console.warn(
          "[getCachedTheme] ⚠ Database connection not available, returning null",
        )
        return null
      }
      console.error(`[getCachedTheme] ✗ Error fetching theme "${slug}":`, error)
      return null
    }
  },
  ["theme"],
  {
    revalidate: CACHE_TTL,
  },
)

/**
 * Get cached list of all themes
 * Cached for 1 hour in production, disabled in dev/UAT
 */
export const getCachedThemeList = unstable_cache(
  async (): Promise<Pick<Theme, "id" | "name">[]> => {
    try {
      const rows = await listThemes(false)
      return rows.map((row) => ({
        id: row.client_slug,
        name: row.name,
      }))
    } catch (error) {
      // Handle missing database connection gracefully
      if (
        error instanceof Error &&
        error.message.includes("missing_connection_string")
      ) {
        console.warn("Database connection not available, returning empty list")
        return []
      }
      throw error
    }
  },
  ["theme-list"],
  {
    revalidate: CACHE_TTL,
  },
)
