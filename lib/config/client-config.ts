import { headers } from "next/headers"
import { resolveGetMeApiUrlWithSource } from "@/lib/api/getme-api-url"
import { getOrganisationIdBySlug } from "@/lib/db/themes"
import type { Theme } from "@/lib/theme"
import { resolveTheme, type ThemeSource } from "@/lib/theme/resolver"

export interface ClientConfig {
  theme: Theme
  themeSource: ThemeSource
  organisationId: string | null
  apiEndpoint: string
  apiSource: "database" | "env-var" | "env-var-fallback"
  host: string | null
}

/**
 * Unified client configuration resolver
 *
 * This is the single source of truth for all client-specific configuration:
 * - Theme (colors, branding, etc.)
 * - Organisation ID (for filtering vacancies)
 * - API endpoint (for GetMe.video API calls)
 *
 * Resolution priority:
 * 1. Query parameter (?theme=xxx) - highest priority
 * 2. Theme from database (by slug)
 * 3. Default theme
 *
 * Once theme is resolved:
 * - Organisation ID comes from theme.organisation_id
 * - API endpoint comes from theme.gmt_api_endpoint
 * - If theme doesn't have API endpoint, falls back to GETME_API_URL
 */
export async function resolveClientConfig(
  searchParams?: Record<string, string | undefined>,
): Promise<ClientConfig> {
  let host: string | null = null
  try {
    const headersList = await headers()
    host = headersList.get("host") || "localhost"
  } catch (_error) {
    // headers() throws when a request context is not available (e.g., during build).
    host = null
  }

  // Resolve theme
  const { theme, source: themeSource } = await resolveTheme(searchParams)

  // Resolve organisation ID from theme
  const organisationId =
    theme.id === "default" ? null : await getOrganisationIdBySlug(theme.id)

  // Resolve API endpoint
  const themeParam = searchParams?.theme || theme.id
  const { endpoint: apiEndpoint, source: apiSource } =
    await resolveGetMeApiUrlWithSource(host, themeParam)

  console.log(`[ClientConfig] ✓ Resolved configuration:`)
  console.log(`  - Theme: ${theme.id} (source: ${themeSource})`)
  console.log(`  - Organisation ID: ${organisationId || "none"}`)
  console.log(`  - API Endpoint: ${apiEndpoint} (source: ${apiSource})`)

  return {
    theme,
    themeSource,
    organisationId,
    apiEndpoint,
    apiSource,
    host,
  }
}
