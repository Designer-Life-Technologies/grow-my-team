#!/usr/bin/env tsx
/**
 * Fix Asset URLs - Upload logos/favicons to Blob and update DB
 */

import { config } from "dotenv"

config({ path: ".env.development.local" })

import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { uploadFavicon, uploadLogo } from "../lib/blob/assets"
import { pool } from "../lib/db/client"

const ASSET_MAP: Record<string, { logo?: string; favicon?: string }> = {
  default: {
    logo: "/public/themes/logo.png",
    favicon: "/public/themes/favicon.ico",
  },
  demo: {
    logo: "/public/themes/demo/logo_v2.png",
    favicon: "/public/themes/demo/favicon_v2.ico",
  },
  virgin: {
    logo: "/public/themes/virgin/logo.png",
    favicon: "/public/themes/virgin/favicon.ico",
  },
  shr: {
    logo: "/public/themes/shr/logo.png",
    favicon: "/public/themes/shr/favicon.ico",
  },
  "team-puzzle": { logo: "/public/themes/team-puzzle/logo.png" },
  "placement-partner": {
    logo: "/public/themes/placement-partner/logo.png",
    favicon: "/public/themes/placement-partner/favicon.ico",
  },
}

async function fixAssets() {
  for (const [slug, paths] of Object.entries(ASSET_MAP)) {
    console.log(`\n📦 ${slug}`)

    let logoUrl: string | undefined
    let faviconUrl: string | undefined

    if (paths.logo) {
      try {
        const buffer = await readFile(join(process.cwd(), paths.logo))
        logoUrl = await uploadLogo(slug, buffer, "image/png")
        console.log(`  ✓ Logo: ${logoUrl}`)
      } catch (e) {
        console.log(`  ⚠ Logo failed: ${e}`)
      }
    }

    if (paths.favicon) {
      try {
        const buffer = await readFile(join(process.cwd(), paths.favicon))
        faviconUrl = await uploadFavicon(slug, buffer, "image/x-icon")
        console.log(`  ✓ Favicon: ${faviconUrl}`)
      } catch (e) {
        console.log(`  ⚠ Favicon failed: ${e}`)
      }
    }

    // Update DB
    if (logoUrl || faviconUrl) {
      const updates: string[] = []
      const values: (string | null)[] = []
      let idx = 1

      if (logoUrl) {
        updates.push(`logo_url = $${idx++}`)
        values.push(logoUrl)
      }
      if (faviconUrl) {
        updates.push(`favicon_url = $${idx++}`)
        values.push(faviconUrl)
      }
      values.push(slug)

      const query = `UPDATE client_settings SET ${updates.join(", ")} WHERE client_slug = $${idx}`
      await pool.query(query, values)
      console.log(`  ✅ DB updated`)
    }
  }

  await pool.end()
  console.log("\n✨ All assets uploaded!")
}

fixAssets().catch(console.error)
