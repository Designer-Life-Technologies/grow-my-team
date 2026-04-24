#!/usr/bin/env tsx
/**
 * Check logo height and width values in the database
 */

import { config } from "dotenv"

config({ path: ".env.development.local" })

import { sql } from "@vercel/postgres"

async function main() {
  console.log("Checking logo height and width values in database...\n")

  const result = await sql`
    SELECT client_slug, name, logo_width, logo_height, logo_url
    FROM client_settings
    ORDER BY client_slug
  `

  console.log("Theme Values:")
  console.log("─────────────────────────────────────────────────────────────")

  for (const row of result.rows) {
    console.log(`\nTheme: ${row.client_slug} (${row.name})`)
    console.log(`  logo_width: ${row.logo_width}`)
    console.log(`  logo_height: ${row.logo_height}`)
    console.log(`  logo_url: ${row.logo_url}`)
  }

  console.log("\n─────────────────────────────────────────────────────────────")
}

main()
