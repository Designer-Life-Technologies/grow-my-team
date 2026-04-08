import type { Theme } from "../types"

export const demoTheme: Theme = {
  id: "demo",
  name: "Demo",
  colors: {
    light: {
      primary: "#16406a",
      secondary: "#2d6f96",
      accent: "#5ec6d8",
      background: "#f8fbfe",
      surface: "#edf3f9",
      text: "#0b1b2c",
      textSecondary: "#5f7087",
      border: "#d1dce6",
      success: "#39bdb0",
      warning: "#f5c267",
      error: "#ea7a74",
    },
    dark: {
      primary: "#6fd0dd",
      secondary: "#3b8eaf",
      accent: "#163451",
      background: "#0a1b2b",
      surface: "#13273b",
      text: "#f6fbff",
      textSecondary: "#a8bed2",
      border: "#294262",
      success: "#4cd9c7",
      warning: "#f9d088",
      error: "#ff9c98",
    },
  },
  branding: {
    companyName: "Demo Client",
    logo: {
      light: "/themes/demo/logo_v2.png",
      dark: "/themes/demo/logo_v2.png",
      width: 110,
    },
    favicon: "/themes/demo/favicon_v2.ico",
  },
}
