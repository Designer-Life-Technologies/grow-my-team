import { NextResponse } from "next/server"
import { updateThemeSchema } from "@/lib/api/admin/types"
import { uploadThemeAssets } from "@/lib/blob/assets"
import { getThemeBySlug, updateTheme } from "@/lib/db/themes"

/**
 * PUT /api/admin/themes/[slug]
 * Update an existing theme
 */
export async function PUT(
  request: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const { slug } = params
    const body = await request.json()

    // Validate request body
    const validatedData = updateThemeSchema.parse(body)

    // Check if theme exists
    const existingTheme = await getThemeBySlug(slug)
    if (!existingTheme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 })
    }

    // Upload assets to Vercel Blob if provided
    let logoUrl = validatedData.logoBase64
      ? undefined
      : existingTheme.logo_url || undefined
    let faviconUrl = validatedData.faviconBase64
      ? undefined
      : existingTheme.favicon_url || undefined

    if (validatedData.logoBase64 || validatedData.faviconBase64) {
      const assets = await uploadThemeAssets(
        slug,
        validatedData.logoBase64,
        validatedData.faviconBase64,
      )
      if (assets.logoUrl) logoUrl = assets.logoUrl
      if (assets.faviconUrl) faviconUrl = assets.faviconUrl
    }

    // Update theme in database
    const theme = await updateTheme(slug, {
      name: validatedData.name,
      companyName: validatedData.companyName,
      colors: validatedData.colors,
      logoUrl,
      faviconUrl,
      logoWidth: validatedData.logoWidth,
      website: validatedData.website,
      supportsDarkMode: validatedData.supportsDarkMode,
    })

    // TODO: Implement cache invalidation
    // revalidateTag("theme")

    return NextResponse.json({ theme })
  } catch (error) {
    console.error("Error updating theme:", error)

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request body", details: error.message },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: "Failed to update theme" },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/admin/themes/[slug]
 * Delete a theme
 */
export async function DELETE(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const { slug } = params

    // Check if theme exists
    const existingTheme = await getThemeBySlug(slug)
    if (!existingTheme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 })
    }

    // Delete theme from database (soft delete by setting is_active = false)
    await updateTheme(slug, { isActive: false })

    // TODO: Implement cache invalidation
    // revalidateTag("theme")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting theme:", error)
    return NextResponse.json(
      { error: "Failed to delete theme" },
      { status: 500 },
    )
  }
}
