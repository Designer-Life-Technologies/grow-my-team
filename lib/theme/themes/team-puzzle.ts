import type { Theme } from "../types"

export const teamPuzzleTheme: Theme = {
  id: "team-puzzle",
  name: "Team Puzzle",
  colors: {
    light: {
      primary: "#205baa",
      secondary: "#222d69",
      accent: "#b5cded",
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
      primary: "#4A90E2",
      secondary: "#5A6ACF",
      accent: "#D4E6F7",
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
      light: "/themes/team-puzzle/logo.png",
      dark: "/themes/team-puzzle/logo.png",
      width: 100,
    },
    favicon: "/themes/team-puzzle/favicon.ico",
  },
}
