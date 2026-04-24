import { NextResponse } from "next/server"
import { extractColorsFromImages } from "@/lib/ai/color-extractor"
import { createThemeSchema } from "@/lib/api/admin/types"
import { uploadThemeAssets } from "@/lib/blob/assets"
import { createTheme, listThemes } from "@/lib/db/themes"
import type { ColorPalette } from "@/lib/theme/types"

/**
 * GET /api/admin/themes
 * List all themes (admin view with full details)
 */
export async function GET() {
  try {
    const themes = await listThemes(true) // Include inactive themes

    return NextResponse.json({ themes })
  } catch (error) {
    console.error("Error fetching themes:", error)
    return NextResponse.json(
      { error: "Failed to fetch themes" },
      { status: 500 },
    )
  }
}

/**
 * POST /api/admin/themes
 * Create a new theme
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = createThemeSchema.parse(body)

    // Determine colors: use provided colors or extract with AI
    let colors: { light: ColorPalette; dark: ColorPalette }
    if (validatedData.colors) {
      // Use manually provided colors
      colors = mergeWithDefaults(validatedData.colors)
    } else if (validatedData.logoBase64) {
      // Extract colors using AI from logo and optional favicon/screenshot
      try {
        console.log("[AI Theme] Extracting colors from images...")
        const extractedColors = await extractColorsFromImages({
          logoBase64: validatedData.logoBase64,
          faviconBase64: validatedData.faviconBase64,
          screenshotBase64: validatedData.screenshotBase64,
        })
        colors = extractedColors
        console.log("[AI Theme] Successfully extracted colors")
      } catch (error) {
        console.error("[AI Theme] Failed to extract colors:", error)
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json(
          {
            error: "Failed to extract colors using AI",
            details: errorMessage,
          },
          { status: 500 },
        )
      }
    } else {
      // Use default colors
      colors = getDefaultColors()
    }

    // Upload assets to Vercel Blob if provided
    let logoUrl: string | undefined
    let faviconUrl: string | undefined

    if (validatedData.logoBase64 || validatedData.faviconBase64) {
      const assets = await uploadThemeAssets(
        validatedData.slug,
        validatedData.logoBase64,
        validatedData.faviconBase64,
      )
      logoUrl = assets.logoUrl
      faviconUrl = assets.faviconUrl
    }

    // Create theme in database
    const theme = await createTheme({
      clientSlug: validatedData.slug,
      name: validatedData.name,
      companyName: validatedData.companyName,
      customDomain: validatedData.customDomain,
      colors,
      logoUrl,
      faviconUrl,
      logoScale: validatedData.logoScale || 1.0,
      website: validatedData.website,
      supportsDarkMode: validatedData.supportsDarkMode ?? true,
    })

    // TODO: Implement cache invalidation
    // revalidateTag("theme")

    return NextResponse.json({ theme }, { status: 201 })
  } catch (error) {
    console.error("Error creating theme:", error)

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request body", details: error.message },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: "Failed to create theme" },
      { status: 500 },
    )
  }
}

/**
 * Merge provided colors with defaults to ensure all required fields exist
 */
function mergeWithDefaults(colors: {
  light: Partial<ColorPalette>
  dark: Partial<ColorPalette>
}): { light: ColorPalette; dark: ColorPalette } {
  const defaults = getDefaultColors()
  return {
    light: { ...defaults.light, ...colors.light },
    dark: { ...defaults.dark, ...colors.dark },
  }
}

/**
 * Get default colors for new themes
 */
function getDefaultColors(): { light: ColorPalette; dark: ColorPalette } {
  const light: ColorPalette = {
    primary: "#3b82f6",
    secondary: "#1e40af",
    accent: "#60a5fa",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#1e293b",
    textSecondary: "#64748b",
    border: "#e2e8f0",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
  }

  const dark: ColorPalette = {
    primary: "#60a5fa",
    secondary: "#3b82f6",
    accent: "#93c5fd",
    background: "#0f172a",
    surface: "#1e293b",
    text: "#f1f5f9",
    textSecondary: "#94a3b8",
    border: "#334155",
    success: "#4ade80",
    warning: "#fbbf24",
    error: "#f87171",
  }

  return { light, dark }
}
