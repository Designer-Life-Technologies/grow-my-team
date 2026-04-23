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
    // Sidebar colors - use surface color from theme
    "--sidebar": colors.surface,
    "--sidebar-foreground": colors.text,
    "--sidebar-primary": colors.primary,
    "--sidebar-primary-foreground": colors.background,
    "--sidebar-accent": colors.surface,
    "--sidebar-accent-foreground": colors.text,
    "--sidebar-border": colors.border,
    "--sidebar-ring": colors.primary,
  }

  return Object.entries(shadcnMapping)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n  ")
}

/**
 * Apply theme colors to document CSS variables
 * Uses !important to ensure theme colors override defaults
 */
export const applyThemeToDocument = (theme: Theme, isDark: boolean) => {
  if (typeof document === "undefined") return

  const palette = isDark ? theme.colors.dark : theme.colors.light
  const root = document.documentElement

  // Generate CSS variables from palette with !important
  const shadcnMapping = {
    "--background": palette.background,
    "--foreground": palette.text,
    "--primary": palette.primary,
    "--primary-foreground": palette.background,
    "--secondary": palette.secondary,
    "--secondary-foreground": palette.background,
    "--accent": palette.accent,
    "--accent-foreground": palette.background,
    "--muted": palette.surface,
    "--muted-foreground": palette.textSecondary,
    "--border": palette.border,
    "--input": palette.border,
    "--ring": palette.primary,
    "--destructive": palette.error,
    "--destructive-foreground": palette.background,
    "--card": palette.surface,
    "--card-foreground": palette.text,
    "--popover": palette.surface,
    "--popover-foreground": palette.text,
    "--sidebar": palette.surface,
    "--sidebar-foreground": palette.text,
    "--sidebar-primary": palette.primary,
    "--sidebar-primary-foreground": palette.background,
    "--sidebar-accent": palette.surface,
    "--sidebar-accent-foreground": palette.text,
    "--sidebar-border": palette.border,
    "--sidebar-ring": palette.primary,
    "--success": palette.success,
    "--warning": palette.warning,
  }

  // Apply all variables to document with !important to override defaults
  Object.entries(shadcnMapping).forEach(([key, value]) => {
    root.style.setProperty(key, value, "important")
  })

  // Set data attributes for CSS selectors
  root.setAttribute("data-theme", theme.id)
  root.setAttribute("data-theme-mode", isDark ? "dark" : "light")

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
