import type { Theme } from "../types"

export const defaultTheme: Theme = {
  id: "default",
  name: "Grow My Team",
  colors: {
    light: {
      primary: "#3B82F6",
      secondary: "#6366F1",
      accent: "#8B5CF6",
      background: "#FFFFFF",
      surface: "#F8FAFC",
      text: "#0F172A",
      textSecondary: "#64748B",
      border: "#E2E8F0",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
    },
    dark: {
      primary: "#60A5FA",
      secondary: "#818CF8",
      accent: "#A78BFA",
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
    companyName: "Grow My Team",
    logo: {
      light: "/growmyteam_logo.png",
      dark: "/growmyteam_logo.png",
    },
    favicon: "/favicon.ico",
  },
}
