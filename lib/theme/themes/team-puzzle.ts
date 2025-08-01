import type { Theme } from "../types"

export const teamPuzzleTheme: Theme = {
  id: "team-puzzle",
  name: "Team Puzzle",
  colors: {
    light: {
      primary: "#FF6B35",
      secondary: "#004E89",
      accent: "#009FFD",
      background: "#FFFFFF",
      surface: "#F8F9FA",
      text: "#1A1A1A",
      textSecondary: "#6B7280",
      border: "#E5E7EB",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
    },
    dark: {
      primary: "#FF8A65",
      secondary: "#42A5F5",
      accent: "#26C6DA",
      background: "#0F172A",
      surface: "#1E293B",
      text: "#F8FAFC",
      textSecondary: "#94A3B8",
      border: "#334155",
      success: "#34D399",
      warning: "#FBBF24",
      error: "#F87171",
    },
  },
  branding: {
    companyName: "Team Puzzle",
    logo: {
      light: "/themes/team-puzzle/logo-light.svg",
      dark: "/themes/team-puzzle/logo-dark.svg",
    },
    favicon: "/themes/team-puzzle/favicon.ico",
  },
}
