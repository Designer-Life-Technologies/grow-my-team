import type { ColorPalette } from "@/lib/theme/types"

/**
 * Color extraction response from Claude
 */
export interface ExtractedColors {
  light: ColorPalette
  dark: ColorPalette
}

/**
 * Color extraction options
 */
export interface ColorExtractionOptions {
  logoBase64: string
  faviconBase64?: string
  screenshotBase64?: string
}

/**
 * Color extraction error
 */
export class ColorExtractionError extends Error {
  constructor(
    message: string,
    public code:
      | "API_KEY_MISSING"
      | "API_ERROR"
      | "INVALID_IMAGE"
      | "RATE_LIMIT"
      | "UNKNOWN",
  ) {
    super(message)
    this.name = "ColorExtractionError"
  }
}
