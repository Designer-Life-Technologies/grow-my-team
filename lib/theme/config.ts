import type { Theme } from "./types"
import { defaultTheme } from "./themes/default"
import { clientAcmeTheme } from "./themes/client-acme"

export const themes: Record<string, Theme> = {
  default: defaultTheme,
  "client-acme": clientAcmeTheme,
  // Add more themes here
}

export const getTheme = (themeId?: string): Theme => {
  const id = themeId || process.env.NEXT_PUBLIC_THEME_ID || "default"
  return themes[id] || themes.default
}

export const getThemeFromDomain = (hostname: string): string => {
  if (hostname.includes("acme")) return "client-acme"
  // Add more domain-based theme detection here
  return "default"
}
