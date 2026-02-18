import type { Theme } from "../types"

export const defaultTheme: Theme = {
  id: "default",
  name: "Grow My Team",
  colors: {
    light: {
      primary: "#7a4fa4",
      secondary: "#693b8f",
      accent: "#9a6cc3",
      background: "#ffffff",
      surface: "#f7f3fb",
      text: "#120d1b",
      textSecondary: "#5f5471",
      border: "#e1d6ed",
      success: "#0f9d7c",
      warning: "#f0a22c",
      error: "#e05666",
    },
    dark: {
      primary: "#c9a6f0",
      secondary: "#a57ad1",
      accent: "#8c61b7",
      background: "#120c1c",
      surface: "#1d1528",
      text: "#f4ecff",
      textSecondary: "#bba9d2",
      border: "#3f2b55",
      success: "#37d4ac",
      warning: "#fab155",
      error: "#f06b7b",
    },
  },
  branding: {
    companyName: "Grow My Team",
    logo: {
      light: "/themes/logo.png",
      dark: "/themes/logo.png",
      width: 250,
    },
    favicon: "/themes/favicon.ico",
  },
}
