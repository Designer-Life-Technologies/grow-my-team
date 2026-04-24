#!/usr/bin/env tsx
/**
 * Invalidate theme cache by updating updated_at timestamp
 */

import { config } from "dotenv"

config({ path: ".env.development.local" })

import { pool } from "../lib/db/client"

async function invalidateCache() {
  // Update the updated_at timestamp to invalidate cache
  await pool.query(
    "UPDATE client_settings SET updated_at = NOW() WHERE client_slug = $1",
    ["shr"],
  )
  console.log("✅ Invalidated cache for shr theme")

  await pool.end()
}

invalidateCache().catch(console.error)
