#!/usr/bin/env tsx
/**
 * Activate a theme in the database
 */

import { config } from "dotenv"

config({ path: ".env.development.local" })

import { sql } from "@vercel/postgres"

async function main() {
  const slug = process.argv[2]

  if (!slug) {
    console.error("Usage: tsx scripts/activate-theme.ts <theme-slug>")
    console.error("Example: tsx scripts/activate-theme.ts carrick")
    process.exit(1)
  }

  console.log(`Activating theme: ${slug}`)

  const result = await sql`
    UPDATE client_settings 
    SET is_active = true 
    WHERE client_slug = ${slug}
    RETURNING *
  `

  if (result.rowCount === 0) {
    console.error(`Theme "${slug}" not found`)
    process.exit(1)
  }

  console.log(`✅ Theme "${slug}" activated successfully`)
}

main()
