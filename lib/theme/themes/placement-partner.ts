import type { Theme } from "../types"

export const placementPartnerTheme: Theme = {
  id: "placement-partner",
  name: "Placement Partner",
  colors: {
    light: {
      primary: "#19245c", // Dark Blue
      secondary: "#0099ff", // Bright Blue
      accent: "#e6f5ff", // Very Light Blue
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
      primary: "#0099ff", // Bright Blue for dark mode
      secondary: "#33adff",
      accent: "#19245c", // Dark Blue for dark mode accent
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
    companyName: "Placement Partner",
    logo: {
      light: "/themes/placement-partner/logo.png",
      dark: "/themes/placement-partner/logo.png",
      width: 260,
    },
    favicon: "/themes/placement-partner/favicon.ico",
  },
}
