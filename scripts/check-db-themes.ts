#!/usr/bin/env tsx
import { config } from "dotenv"

config({ path: ".env.development.local" })

import { sql } from "@vercel/postgres"

async function checkThemes() {
  const pool = sql
  const client = await pool.connect()

  try {
    const result = await client.query(
      "SELECT client_slug, name, logo_url, favicon_url FROM client_themes WHERE is_active = true",
    )
    console.log(JSON.stringify(result.rows, null, 2))
  } finally {
    client.release()
  }
}

checkThemes().catch(console.error)
