import { getThemeByCustomDomain, getThemeBySlug } from "@/lib/db/themes"

const themeAliasEntries: Record<string, string[]> = {
  default: ["default", "growmyteam", "gmt", "core"],
  "team-puzzle": ["team-puzzle", "teampuzzle", "puzzle", "tp"],
  "placement-partner": [
    "placement-partner",
    "placementpartner",
    "placement",
    "placement_partner",
    "pp",
  ],
  demo: ["demo", "democlient", "demo-client"],
  shr: ["shr", "strategic", "strategic-hr", "strategic_hr"],
  virgin: ["virgin", "virginactive", "virgin-active", "va"],
}

const normalizeAlias = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "")

const themeAliasMap = Object.entries(themeAliasEntries).reduce(
  (acc, [themeId, aliases]) => {
    for (const alias of aliases) {
      acc[normalizeAlias(alias)] = themeId
    }
    return acc
  },
  {} as Record<string, string>,
)

const resolveThemeAlias = (value?: string | null) => {
  if (!value) return undefined
  return themeAliasMap[normalizeAlias(value)]
}

// Stub for backward compatibility - throws since we're database-driven
export const getTheme = (): never => {
  throw new Error(
    "getTheme() is deprecated - use database themes via getCachedTheme() instead",
  )
}

/**
 * Get theme from domain (database-driven with fallback)
 * Checks database for client_slug (subdomain) and custom_domain matches, then falls back to hardcoded mappings
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

  // Priority 3: Exact domain matches (hardcoded fallback)
  const domainMap: Record<string, string> = {
    "puzzle-applicant.growmy.team": "team-puzzle",
    "client1.growmyteam.com": "default",
    // Add exact domain mappings here
  }

  if (domainMap[normalizedHost]) {
    return domainMap[normalizedHost]
  }

  // Priority 4: Subdomain aliases (hardcoded fallback)
  const subdomainSegments = subdomain.split(/[-_]/).filter(Boolean)
  const candidates = [normalizedHost, subdomain, ...subdomainSegments]

  for (const candidate of candidates) {
    const aliasMatch = resolveThemeAlias(candidate)
    if (aliasMatch) {
      return aliasMatch
    }
  }

  // Priority 5: Fallback partial checks for legacy support
  if (normalizedHost.includes("puzzle")) return "team-puzzle"
  if (normalizedHost.includes("placement")) return "placement-partner"

  // Default theme
  return "default"
}
