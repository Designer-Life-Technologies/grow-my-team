#!/usr/bin/env tsx
/**
 * Update asset URLs in database
 */

import { config } from "dotenv"

config({ path: ".env.development.local" })

import { pool } from "../lib/db/client"

const BASE =
  "https://enrk9hmmeha4gbxy.public.blob.vercel-storage.com/dev/themes"

const UPDATES = [
  ["default", `${BASE}/default/logo.png`, `${BASE}/default/favicon.ico`],
  ["demo", `${BASE}/demo/logo.png`, `${BASE}/demo/favicon.ico`],
  ["virgin", `${BASE}/virgin/logo.png`, `${BASE}/virgin/favicon.ico`],
  ["shr", `${BASE}/shr/logo.png`, `${BASE}/shr/favicon.ico`],
  ["team-puzzle", `${BASE}/team-puzzle/logo.png`, null],
  [
    "placement-partner",
    `${BASE}/placement-partner/logo.png`,
    `${BASE}/placement-partner/favicon.ico`,
  ],
]

async function update() {
  for (const [slug, logo, favicon] of UPDATES) {
    await pool.query(
      "UPDATE client_settings SET logo_url = $1, favicon_url = $2 WHERE client_slug = $3",
      [logo, favicon, slug],
    )
    console.log(`✅ ${slug} updated`)
  }
  await pool.end()
  console.log("\n✨ All URLs updated!")
}

update().catch(console.error)
