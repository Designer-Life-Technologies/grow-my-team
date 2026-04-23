#!/usr/bin/env tsx
/**
 * Database Migration CLI Script
 *
 * Usage:
 *   pnpm db:migrate        # Run pending migrations
 *   pnpm db:migrate:status # Show migration status
 *
 * This script is designed to run locally or in CI/CD.
 * For production, run via: vercel --prod
 */

import { config } from "dotenv"

config({ path: ".env.development.local" })

import { getMigrationStatus, runMigrations } from "../lib/db/migrate"

async function main() {
  const command = process.argv[2] || "migrate"

  if (command === "migrate") {
    console.log("Running migrations...")
    const result = await runMigrations()

    if (result.applied.length > 0) {
      console.log(`✅ Applied ${result.applied.length} migration(s):`)
      for (const m of result.applied) {
        console.log(`   - ${m}`)
      }
    }

    if (result.skipped.length > 0) {
      console.log(
        `⏭️  Skipped ${result.skipped.length} already applied migration(s)`,
      )
    }

    if (result.errors.length > 0) {
      console.error(`❌ Failed to apply ${result.errors.length} migration(s):`)
      for (const e of result.errors) {
        console.error(`   - ${e.filename}: ${e.error}`)
      }
      process.exit(1)
    }

    if (result.applied.length === 0 && result.skipped.length === 0) {
      console.log("No migrations found.")
    }
  } else if (command === "status") {
    const status = await getMigrationStatus()

    console.log("Migration Status:")
    console.log("")

    if (status.applied.length > 0) {
      console.log(`Applied (${status.applied.length}):`)
      for (const m of status.applied) {
        console.log(`   ✓ ${m}`)
      }
      console.log("")
    }

    if (status.pending.length > 0) {
      console.log(`Pending (${status.pending.length}):`)
      for (const m of status.pending) {
        console.log(`   ⏳ ${m}`)
      }
    } else {
      console.log("No pending migrations.")
    }
  } else {
    console.error(`Unknown command: ${command}`)
    console.error("Usage: pnpm db:migrate [migrate|status]")
    process.exit(1)
  }
}

main().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
