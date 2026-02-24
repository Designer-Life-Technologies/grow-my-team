import type { Theme } from "../types"

export const shrTheme: Theme = {
  id: "shr",
  name: "Strategic HR",
  colors: {
    light: {
      primary: "#f15d08",
      secondary: "#8ac732",
      accent: "#ffe6cf",
      background: "#ffffff",
      surface: "#f7fbf2",
      text: "#121d0d",
      textSecondary: "#4b5e35",
      border: "#dbeac5",
      success: "#3ca85c",
      warning: "#f7a021",
      error: "#dc4446",
    },
    dark: {
      primary: "#ff8a3d",
      secondary: "#a7ef55",
      accent: "#2c3618",
      background: "#0d1408",
      surface: "#1a2412",
      text: "#f5ffe8",
      textSecondary: "#c6d7a7",
      border: "#394724",
      success: "#7ddc88",
      warning: "#ffca63",
      error: "#ff6b6b",
    },
  },
  branding: {
    companyName: "Strategic HR",
    logo: {
      light: "/themes/shr/logo.png",
      dark: "/themes/shr/logo.png",
      width: 40,
    },
    favicon: "/themes/shr/favicon.ico",
  },
}
