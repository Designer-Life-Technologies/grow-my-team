import { defaultTheme } from "./themes/default"
import { demoTheme } from "./themes/demo"
import { placementPartnerTheme } from "./themes/placement-partner"
import { teamPuzzleTheme } from "./themes/team-puzzle"
import type { Theme } from "./types"

const themes: Record<string, Theme> = {
  default: defaultTheme,
  "team-puzzle": teamPuzzleTheme,
  "placement-partner": placementPartnerTheme,
  demo: demoTheme,
  // Add more themes here
}

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

export const getTheme = (themeId?: string): Theme => {
  // Priority:
  // 1. Explicit themeId/alias (if not "default")
  // 2. Environment variable (alias-aware)
  // 3. Fallback to "default" or provided themeId
  const envThemeAlias = resolveThemeAlias(process.env.NEXT_PUBLIC_THEME_ID)
  const explicitThemeAlias =
    themeId && themeId !== "default" ? resolveThemeAlias(themeId) : undefined

  const resolvedThemeId =
    explicitThemeAlias ||
    envThemeAlias ||
    resolveThemeAlias(themeId || "default") ||
    "default"

  return themes[resolvedThemeId] || themes.default
}

export const getThemeFromDomain = (hostname: string): string => {
  const normalizedHost = hostname.split(":")[0]?.toLowerCase() || ""
  const subdomain = normalizedHost.split(".")[0] || normalizedHost

  // Exact domain matches (highest priority)
  const domainMap: Record<string, string> = {
    "puzzle-applicant.growmy.team": "team-puzzle",
    "client1.growmyteam.com": "default",
    // Add exact domain mappings here
  }

  if (domainMap[normalizedHost]) {
    return domainMap[normalizedHost]
  }

  const subdomainSegments = subdomain.split(/[-_]/).filter(Boolean)
  const candidates = [normalizedHost, subdomain, ...subdomainSegments]

  for (const candidate of candidates) {
    const aliasMatch = resolveThemeAlias(candidate)
    if (aliasMatch) {
      return aliasMatch
    }
  }

  // Fallback partial checks for legacy support
  if (normalizedHost.includes("puzzle")) return "team-puzzle"
  if (normalizedHost.includes("placement")) return "placement-partner"

  // Default theme
  return "default"
}
