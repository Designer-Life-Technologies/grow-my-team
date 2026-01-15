import type { Theme } from "../types"

export const defaultTheme: Theme = {
  id: "default",
  name: "Grow My Team",
  colors: {
    light: {
      primary: "#a325e9",
      secondary: "#5c0c8c",
      accent: "#9346c2",
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
      primary: "#c084fc",
      secondary: "#a855f7",
      accent: "#b45bcf",
      background: "#0f0f23",
      surface: "#1a1a2e",
      text: "#f8fafc",
      textSecondary: "#a1a1aa",
      border: "#3f3f46",
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
    },
  },
  branding: {
    companyName: "Grow My Team",
    logo: {
      light: "/themes/growmyteam_logo.png",
      dark: "/themes/growmyteam_logo.png",
      width: 60,
    },
    favicon: "/themes/favicon.ico",
  },
}
