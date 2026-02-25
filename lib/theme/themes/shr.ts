import type { Theme } from "../types"

export const shrTheme: Theme = {
  id: "shr",
  name: "Strategic HR",
  supportsDarkMode: false,
  colors: {
    light: {
      primary: "#ff5101",
      secondary: "#8dd100",
      accent: "#ffe0cc",
      background: "#ffffff",
      surface: "#fffaf8",
      text: "#1f120c",
      textSecondary: "#4a342d",
      border: "#f0ddd4",
      success: "#38a357",
      warning: "#ffb347",
      error: "#e34b4e",
    },
    dark: {
      primary: "#ff7434",
      secondary: "#a8ff2c",
      accent: "#3a251c",
      background: "#170f0c",
      surface: "#231610",
      text: "#fff5ed",
      textSecondary: "#f1cfc1",
      border: "#3e251d",
      success: "#6cd77c",
      warning: "#ffc766",
      error: "#ff6b5e",
    },
  },
  branding: {
    companyName: "Strategic HR",
    logo: {
      light: "/themes/shr/logo.png",
      dark: "/themes/shr/logo.png",
      width: 200,
    },
    favicon: "/themes/shr/favicon.ico",
  },
}
