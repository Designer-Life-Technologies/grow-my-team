import { sql } from "@vercel/postgres"
import type { ColorPalette, Theme } from "@/lib/theme/types"

export interface ClientThemeRow {
  id: string
  client_slug: string
  name: string
  company_name: string | null
  organisation_id: string | null
  subdomain: string | null
  custom_domain: string | null
  colors: {
    light: ColorPalette
    dark: ColorPalette
  }
  logo_url: string | null
  favicon_url: string | null
  website: string | null
  logo_width: number | null
  supports_dark_mode: boolean
  is_active: boolean
}

export interface CreateThemeInput {
  clientSlug: string
  name: string
  companyName?: string
  organisationId?: string
  subdomain?: string
  customDomain?: string
  colors: {
    light: ColorPalette
    dark: ColorPalette
  }
  logoUrl?: string
  faviconUrl?: string
  logoWidth?: number
  website?: string
  supportsDarkMode?: boolean
}

export interface UpdateThemeInput extends Partial<CreateThemeInput> {
  isActive?: boolean
}

/**
 * Get theme by client slug (subdomain identifier)
 */
export async function getThemeBySlug(
  slug: string,
): Promise<ClientThemeRow | null> {
  const result = await sql<ClientThemeRow>`
    SELECT * FROM client_themes 
    WHERE client_slug = ${slug} AND is_active = true
  `
  return result.rows[0] || null
}

/**
 * Get theme by organisation ID
 */
export async function getThemeByOrganisationId(
  organisationId: string,
): Promise<ClientThemeRow | null> {
  const result = await sql<ClientThemeRow>`
    SELECT * FROM client_themes 
    WHERE organisation_id = ${organisationId} AND is_active = true
  `
  return result.rows[0] || null
}

/**
 * Get theme by subdomain prefix (e.g., "shr" for shr.applicant.growmy.team)
 */
export async function getThemeBySubdomain(
  subdomain: string,
): Promise<ClientThemeRow | null> {
  const result = await sql<ClientThemeRow>`
    SELECT * FROM client_themes 
    WHERE subdomain = ${subdomain} AND is_active = true
  `
  return result.rows[0] || null
}

/**
 * Get theme by custom domain (future feature)
 */
export async function getThemeByCustomDomain(
  domain: string,
): Promise<ClientThemeRow | null> {
  const result = await sql<ClientThemeRow>`
    SELECT * FROM client_themes 
    WHERE custom_domain = ${domain} AND is_active = true
  `
  return result.rows[0] || null
}

/**
 * Create a new client theme
 */
export async function createTheme(
  input: CreateThemeInput,
): Promise<ClientThemeRow> {
  const result = await sql<ClientThemeRow>`
    INSERT INTO client_themes (
      client_slug,
      name,
      company_name,
      organisation_id,
      subdomain,
      custom_domain,
      colors,
      logo_url,
      favicon_url,
      website,
      supports_dark_mode
    ) VALUES (
      ${input.clientSlug},
      ${input.name},
      ${input.companyName || null},
      ${input.organisationId || null},
      ${input.subdomain || null},
      ${input.customDomain || null},
      ${JSON.stringify(input.colors)},
      ${input.logoUrl || null},
      ${input.faviconUrl || null},
      ${input.website || null},
      ${input.supportsDarkMode ?? true}
    )
    RETURNING *
  `
  return result.rows[0]
}

/**
 * Update an existing theme
 */
export async function updateTheme(
  slug: string,
  input: UpdateThemeInput,
): Promise<ClientThemeRow | null> {
  // Build dynamic update query
  const updates: string[] = []
  const values: unknown[] = []
  let paramIndex = 1

  if (input.name !== undefined) {
    updates.push(`name = $${paramIndex++}`)
    values.push(input.name)
  }
  if (input.companyName !== undefined) {
    updates.push(`company_name = $${paramIndex++}`)
    values.push(input.companyName)
  }
  if (input.organisationId !== undefined) {
    updates.push(`organisation_id = $${paramIndex++}`)
    values.push(input.organisationId)
  }
  if (input.subdomain !== undefined) {
    updates.push(`subdomain = $${paramIndex++}`)
    values.push(input.subdomain)
  }
  if (input.customDomain !== undefined) {
    updates.push(`custom_domain = $${paramIndex++}`)
    values.push(input.customDomain)
  }
  if (input.colors !== undefined) {
    updates.push(`colors = $${paramIndex++}`)
    values.push(JSON.stringify(input.colors))
  }
  if (input.logoUrl !== undefined) {
    updates.push(`logo_url = $${paramIndex++}`)
    values.push(input.logoUrl)
  }
  if (input.faviconUrl !== undefined) {
    updates.push(`favicon_url = $${paramIndex++}`)
    values.push(input.faviconUrl)
  }
  if (input.website !== undefined) {
    updates.push(`website = $${paramIndex++}`)
    values.push(input.website)
  }
  if (input.supportsDarkMode !== undefined) {
    updates.push(`supports_dark_mode = $${paramIndex++}`)
    values.push(input.supportsDarkMode)
  }
  if (input.isActive !== undefined) {
    updates.push(`is_active = $${paramIndex++}`)
    values.push(input.isActive)
  }

  if (updates.length === 0) {
    return getThemeBySlug(slug)
  }

  values.push(slug)
  const query = `
    UPDATE client_themes 
    SET ${updates.join(", ")} 
    WHERE client_slug = $${paramIndex}
    RETURNING *
  `

  const result = await sql.query<ClientThemeRow>(query, values)
  return result.rows[0] || null
}

/**
 * Soft delete a theme (set is_active = false)
 */
export async function deactivateTheme(slug: string): Promise<boolean> {
  const result = await sql`
    UPDATE client_themes 
    SET is_active = false 
    WHERE client_slug = ${slug}
  `
  return (result.rowCount ?? 0) > 0
}

/**
 * List all themes (for admin)
 */
export async function listThemes(
  includeInactive = false,
): Promise<ClientThemeRow[]> {
  const result = includeInactive
    ? await sql<ClientThemeRow>`SELECT * FROM client_themes ORDER BY name`
    : await sql<ClientThemeRow>`SELECT * FROM client_themes WHERE is_active = true ORDER BY name`
  return result.rows
}

/**
 * Convert database row to Theme object (for use in ThemeProvider)
 */
export function rowToTheme(row: ClientThemeRow): Theme {
  return {
    id: row.client_slug,
    name: row.name,
    supportsDarkMode: row.supports_dark_mode,
    colors: row.colors,
    branding: {
      companyName: row.company_name || row.name,
      logo: row.logo_url
        ? {
            light: row.logo_url,
            dark: row.logo_url,
          }
        : undefined,
      favicon: row.favicon_url || undefined,
      website: row.website || undefined,
    },
  }
}
