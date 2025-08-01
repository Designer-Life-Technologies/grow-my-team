import type { Theme } from "./types"
import { defaultTheme } from "./themes/default"
import { teamPuzzleTheme } from "./themes/team-puzzle"

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
  if (hostname.includes("puzzle")) return "team-puzzle"
  // Add more domain-based theme detection here
  return "default"
}
