export interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  success: string
  warning: string
  error: string
}

export interface Theme {
  id: string
  name: string
  colors: {
    light: ColorPalette
    dark: ColorPalette
  }
  branding: {
    companyName: string
    logo: {
      light: string
      dark: string
    }
    favicon?: string
  }
}

export type ThemeMode = "light" | "dark" | "system"

export interface ThemeContextType {
  currentTheme: Theme
  mode: ThemeMode
  setTheme: (themeId: string) => void
  setMode: (mode: ThemeMode) => void
  isDark: boolean
}
