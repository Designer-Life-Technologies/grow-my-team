import { defaultTheme } from "./themes/default"
import { placementPartnerTheme } from "./themes/placement-partner"
import { teamPuzzleTheme } from "./themes/team-puzzle"
import type { Theme } from "./types"

export const themes: Record<string, Theme> = {
  default: defaultTheme,
  "team-puzzle": teamPuzzleTheme,
  "placement-partner": placementPartnerTheme,
  // Add more themes here
}

export const getTheme = (themeId?: string): Theme => {
  // Priority:
  // 1. Explicit themeId (if not "default")
  // 2. Environment variable
  // 3. Fallback to "default" or provided themeId
  const envThemeId = process.env.NEXT_PUBLIC_THEME_ID

  let id = "default"
  if (themeId && themeId !== "default") {
    id = themeId
  } else if (envThemeId) {
    id = envThemeId
  } else if (themeId) {
    id = themeId
  }

  return themes[id] || themes.default
}

export const getThemeFromDomain = (hostname: string): string => {
  // Exact domain matches (highest priority)
  const domainMap: Record<string, string> = {
    "puzzle-applicant.growmy.team": "team-puzzle",
    "client1.growmyteam.com": "default",
    // Add exact domain mappings here
  }

  if (domainMap[hostname]) {
    return domainMap[hostname]
  }

  // Partial hostname matches (fallback)
  if (hostname.includes("puzzle")) return "team-puzzle"
  if (hostname.includes("placement")) return "placement-partner"
  // Add more partial matches here

  // Default theme
  return "default"
}
