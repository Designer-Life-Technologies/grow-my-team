import type { Theme } from "../types"

export const virginTheme: Theme = {
  id: "virgin",
  name: "Virgin Active",
  supportsDarkMode: true,
  colors: {
    light: {
      primary: "#E11931",
      secondary: "#B3121D",
      accent: "#FF6B7A",
      background: "#FFFFFF",
      surface: "#F5F5F5",
      text: "#1A1A1A",
      textSecondary: "#666666",
      border: "#E5E5E5",
      success: "#22C55E",
      warning: "#F59E0B",
      error: "#DC2626",
    },
    dark: {
      primary: "#FF3D57",
      secondary: "#E11931",
      accent: "#FF8A95",
      background: "#1A1A1A",
      surface: "#2D2D2D",
      text: "#FFFFFF",
      textSecondary: "#B3B3B3",
      border: "#444444",
      success: "#4ADE80",
      warning: "#FBBF24",
      error: "#EF4444",
    },
  },
  branding: {
    companyName: "Virgin Active",
    logo: {
      light: "/themes/virgin/logo.png",
      dark: "/themes/virgin/logo.png",
      width: 110,
    },
    favicon: "/themes/virgin/favicon.ico",
    website: "https://www.virginactive.com",
  },
}
