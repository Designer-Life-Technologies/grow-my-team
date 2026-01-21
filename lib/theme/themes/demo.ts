import type { Theme } from "../types"

export const demoTheme: Theme = {
  id: "demo",
  name: "Demo",
  colors: {
    light: {
      primary: "#19245c",
      secondary: "#0099ff",
      accent: "#e6f5ff",
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
      primary: "#0099ff",
      secondary: "#33adff",
      accent: "#19245c",
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
    companyName: "Demo Client",
    logo: {
      light: "/themes/demo/logo.png",
      dark: "/themes/demo/logo.png",
      width: 110,
    },
    favicon: "/themes/demo/favicon.ico",
  },
}
