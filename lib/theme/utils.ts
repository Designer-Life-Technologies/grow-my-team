import type { ColorPalette, Theme } from "./types"

// Generate Shadcn-compatible CSS variables from our theme colors
export const generateShadcnVariables = (colors: ColorPalette): string => {
  // Map our theme colors to Shadcn's expected variable names
  const shadcnMapping = {
    // Core colors
    "--background": colors.background,
    "--foreground": colors.text,
    "--primary": colors.primary,
    "--primary-foreground": colors.background, // Contrast color for primary
    "--secondary": colors.secondary,
    "--secondary-foreground": colors.background,
    "--accent": colors.accent,
    "--accent-foreground": colors.background,
    "--muted": colors.surface,
    "--muted-foreground": colors.textSecondary,
    "--border": colors.border,
    "--input": colors.border,
    "--ring": colors.primary,
    "--destructive": colors.error,
    "--destructive-foreground": colors.background,
    // Card colors
    "--card": colors.surface,
    "--card-foreground": colors.text,
    "--popover": colors.surface,
    "--popover-foreground": colors.text,
  }

  return Object.entries(shadcnMapping)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n  ")
}

export const applyThemeToDocument = (theme: Theme, isDark: boolean) => {
  const colors = isDark ? theme.colors.dark : theme.colors.light
  const root = document.documentElement

  // Apply Shadcn-compatible variables (simplified approach)
  const shadcnMapping = {
    // Core colors
    "--background": colors.background,
    "--foreground": colors.text,
    "--primary": colors.primary,
    "--primary-foreground": colors.background,
    "--secondary": colors.secondary,
    "--secondary-foreground": colors.background,
    "--accent": colors.accent,
    "--accent-foreground": colors.background,
    "--muted": colors.surface,
    "--muted-foreground": colors.textSecondary,
    "--border": colors.border,
    "--input": colors.border,
    "--ring": colors.primary,
    "--destructive": colors.error,
    "--destructive-foreground": colors.background,
    // Card colors
    "--card": colors.surface,
    "--card-foreground": colors.text,
    "--popover": colors.surface,
    "--popover-foreground": colors.text,
    // Extended colors (not in standard Shadcn)
    "--success": colors.success,
    "--warning": colors.warning,
  }

  // Apply all variables to document
  Object.entries(shadcnMapping).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })

  // Update favicon
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
  if (favicon && theme.branding.favicon) {
    favicon.href = theme.branding.favicon
  }

  // Update document title with company name
  if (document.title.includes("Grow My Team")) {
    document.title = document.title.replace(
      "Grow My Team",
      theme.branding.companyName,
    )
  }
}

export const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

export const createThemeCSS = (theme: Theme): string => {
  const lightShadcnCSS = generateShadcnVariables(theme.colors.light)
  const darkShadcnCSS = generateShadcnVariables(theme.colors.dark)

  return `
:root {
  ${lightShadcnCSS}
}

@media (prefers-color-scheme: dark) {
  :root {
    ${darkShadcnCSS}
  }
}

[data-theme="light"] {
  ${lightShadcnCSS}
}

[data-theme="dark"] {
  ${darkShadcnCSS}
}
`
}
