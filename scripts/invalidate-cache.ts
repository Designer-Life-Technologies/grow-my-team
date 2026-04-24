#!/usr/bin/env tsx
/**
 * Invalidate theme cache by updating updated_at timestamp
 */

import { config } from "dotenv"

config({ path: ".env.development.local" })

import { pool } from "../lib/db/client"

async function invalidateCache() {
  // Update the updated_at timestamp to invalidate cache for all themes
  await pool.query("UPDATE client_settings SET updated_at = NOW()")
  console.log("✅ Invalidated cache for all themes")

  await pool.end()
}

invalidateCache().catch(console.error)
