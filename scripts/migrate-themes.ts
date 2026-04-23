#!/usr/bin/env tsx
/**
 * Theme Migration Script
 *
 * Migrates existing file-based themes to database + Blob storage.
 *
 * Usage:
 *   pnpm migrate:themes         # Preview (dry run)
 *   pnpm migrate:themes --apply # Actually migrate
 *
 * Steps:
 *   1. Upload logos/favicons to Vercel Blob
 *   2. Insert theme records into database
 */

import { config } from "dotenv"

config({ path: ".env.development.local" })

import { readFile } from "fs/promises"
import { join } from "path"
import { uploadFavicon, uploadLogo } from "../lib/blob/assets"
import { createTheme } from "../lib/db/themes"

interface ThemeFile {
  id: string
  name: string
  companyName: string
  supportsDarkMode: boolean
  colors: {
    light: Record<string, string>
    dark?: Record<string, string>
  }
  logoPath?: string
  faviconPath?: string
  website?: string
}

const THEMES_TO_MIGRATE: ThemeFile[] = [
  {
    id: "default",
    name: "Grow My Team",
    companyName: "Grow My Team",
    supportsDarkMode: true,
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
    logoPath: "/public/themes/logo.png",
    faviconPath: "/public/themes/favicon.ico",
    website: "https://www.growmyteam.io",
  },
  {
    id: "demo",
    name: "Demo",
    companyName: "Demo Client",
    supportsDarkMode: true,
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
    logoPath: "/public/themes/demo/logo_v2.png",
    faviconPath: "/public/themes/demo/favicon_v2.ico",
  },
  {
    id: "virgin",
    name: "Virgin Active",
    companyName: "Virgin Active",
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
    logoPath: "/public/themes/virgin/logo.png",
    faviconPath: "/public/themes/virgin/favicon.ico",
    website: "https://www.virginactive.com",
  },
  {
    id: "shr",
    name: "Strategic HR",
    companyName: "Strategic HR",
    supportsDarkMode: true,
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
    logoPath: "/public/themes/shr/logo.png",
    faviconPath: "/public/themes/shr/favicon.ico",
  },
  {
    id: "team-puzzle",
    name: "Team Puzzle",
    companyName: "Team Puzzle",
    supportsDarkMode: true,
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
    logoPath: "/public/themes/team-puzzle/logo.png",
  },
  {
    id: "placement-partner",
    name: "Placement Partner",
    companyName: "Placement Partner",
    supportsDarkMode: true,
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
    logoPath: "/public/themes/placement-partner/logo.png",
    faviconPath: "/public/themes/placement-partner/favicon.ico",
  },
]

async function migrateTheme(
  theme: ThemeFile,
  dryRun: boolean,
): Promise<{ success: boolean; error?: string }> {
  console.log(`\n  📦 ${theme.name} (${theme.id})`)

  try {
    let logoUrl: string | undefined
    let faviconUrl: string | undefined

    // Upload logo to Blob
    if (theme.logoPath) {
      const logoPath = join(process.cwd(), theme.logoPath)
      try {
        const logoBuffer = await readFile(logoPath)
        if (!dryRun) {
          logoUrl = await uploadLogo(theme.id, logoBuffer, "image/png")
        }
        console.log(
          `    ✓ Logo: ${theme.logoPath} ${dryRun ? "(dry run)" : "→ " + logoUrl}`,
        )
      } catch {
        console.log(`    ⚠ Logo not found: ${theme.logoPath}`)
      }
    }

    // Upload favicon to Blob
    if (theme.faviconPath) {
      const faviconPath = join(process.cwd(), theme.faviconPath)
      try {
        const faviconBuffer = await readFile(faviconPath)
        if (!dryRun) {
          faviconUrl = await uploadFavicon(
            theme.id,
            faviconBuffer,
            "image/x-icon",
          )
        }
        console.log(
          `    ✓ Favicon: ${theme.faviconPath} ${dryRun ? "(dry run)" : "→ " + faviconUrl}`,
        )
      } catch {
        console.log(`    ⚠ Favicon not found: ${theme.faviconPath}`)
      }
    }

    // Create theme in database
    if (!dryRun) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const colors = theme.colors as any
      await createTheme({
        clientSlug: theme.id,
        name: theme.name,
        companyName: theme.companyName,
        colors,
        logoUrl,
        faviconUrl,
        website: theme.website,
        supportsDarkMode: theme.supportsDarkMode,
      })
    }

    console.log(`    ✅ ${dryRun ? "Would create" : "Created"} database record`)
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.log(`    ❌ Error: ${message}`)
    return { success: false, error: message }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = !args.includes("--apply")

  console.log("========================================")
  console.log("Theme Migration to Database")
  console.log("========================================")
  console.log(`Mode: ${dryRun ? "DRY RUN (preview)" : "APPLY (live)"}`)
  console.log(`Themes to migrate: ${THEMES_TO_MIGRATE.length}`)

  if (dryRun) {
    console.log("\nAdd --apply flag to actually migrate.")
  }

  const results = []
  let successCount = 0
  let failCount = 0

  for (const theme of THEMES_TO_MIGRATE) {
    const result = await migrateTheme(theme, dryRun)
    results.push({ theme, result })
    if (result.success) {
      successCount++
    } else {
      failCount++
    }
  }

  console.log("\n========================================")
  console.log("Migration Summary")
  console.log("========================================")
  console.log(`Total: ${THEMES_TO_MIGRATE.length}`)
  console.log(`Success: ${successCount}`)
  console.log(`Failed: ${failCount}`)

  if (dryRun) {
    console.log("\nRun with --apply to execute migration.")
  }

  process.exit(failCount > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
