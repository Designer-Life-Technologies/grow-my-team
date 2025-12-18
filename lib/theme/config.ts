import { defaultTheme } from "./themes/default"
import { teamPuzzleTheme } from "./themes/team-puzzle"
import type { Theme } from "./types"

export const themes: Record<string, Theme> = {
  default: defaultTheme,
  "team-puzzle": teamPuzzleTheme,
  // Add more themes here
}

export const getTheme = (themeId?: string): Theme => {
  const id = themeId || process.env.NEXT_PUBLIC_THEME_ID || "default"
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
  // Add more partial matches here

  // Default theme
  return "default"
}
