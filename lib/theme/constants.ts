import type { Theme } from "./types"

/**
 * Hardcoded default theme (GrowMyTeam)
 * Used as ultimate fallback if database is unavailable or default theme is missing
 */
export const DEFAULT_THEME: Theme = {
  id: "default",
  name: "Grow My Team",
  colors: {
    light: {
      primary: "#3b82f6",
      secondary: "#1e40af",
      accent: "#60a5fa",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#1e293b",
      textSecondary: "#64748b",
      border: "#e2e8f0",
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
    },
    dark: {
      primary: "#60a5fa",
      secondary: "#3b82f6",
      accent: "#93c5fd",
      background: "#0f172a",
      surface: "#1e293b",
      text: "#f1f5f9",
      textSecondary: "#94a3b8",
      border: "#334155",
      success: "#4ade80",
      warning: "#fbbf24",
      error: "#f87171",
    },
  },
  supportsDarkMode: true,
  branding: {
    companyName: "Grow My Team",
    logo: {
      light: "/themes/logo.png",
      dark: "/themes/logo.png",
      width: 110,
    },
    favicon: "/themes/favicon.ico",
  },
}
