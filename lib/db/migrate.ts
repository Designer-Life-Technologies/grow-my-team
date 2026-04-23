import { config } from "dotenv"

config({ path: ".env.development.local" })

import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import { createPool, type VercelPoolClient } from "@vercel/postgres"

function getDatabaseUrl(): string {
  // Local development - VERCEL_ENV not set
  if (!process.env.VERCEL_ENV) {
    return process.env.POSTGRES_URL || ""
  }
  // Vercel environments
  if (process.env.VERCEL_ENV === "production") {
    return process.env.POSTGRES_URL_PROD || process.env.POSTGRES_URL || ""
  }
  if (process.env.VERCEL_ENV === "preview") {
    return process.env.POSTGRES_URL || ""
  }
  return process.env.POSTGRES_URL_DEV || process.env.POSTGRES_URL || ""
}

const pool = createPool({ connectionString: getDatabaseUrl() })

interface Migration {
  id: string
  filename: string
  appliedAt: Date
}

function parseMigrationId(filename: string): string | null {
  const match = filename.match(/^(\d+)_.*\.sql$/)
  return match?.[1] || null
}

/**
 * Ensure migrations tracking table exists
 */
async function ensureMigrationsTable(client: VercelPoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id VARCHAR(255) PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP DEFAULT NOW()
    )
  `)
}

/**
 * Get list of applied migrations
 */
async function getAppliedMigrations(
  client: VercelPoolClient,
): Promise<Set<string>> {
  try {
    const result = await client.query(
      "SELECT id FROM schema_migrations ORDER BY applied_at",
    )
    return new Set(result.rows.map((r: Migration) => r.id))
  } catch {
    // Table might not exist yet
    return new Set()
  }
}

/**
 * Record a migration as applied
 */
async function recordMigration(
  client: VercelPoolClient,
  id: string,
  filename: string,
): Promise<void> {
  await client.query(
    "INSERT INTO schema_migrations (id, filename) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
    [id, filename],
  )
}

/**
 * Run all pending migrations
 */
export async function runMigrations(
  migrationsDir: string = "./migrations",
): Promise<{
  applied: string[]
  skipped: string[]
  errors: Array<{ filename: string; error: string }>
}> {
  const result = {
    applied: [] as string[],
    skipped: [] as string[],
    errors: [] as Array<{ filename: string; error: string }>,
  }

  const client = await pool.connect()

  try {
    await ensureMigrationsTable(client)
    const appliedMigrations = await getAppliedMigrations(client)

    // Read migration files
    const migrationsPath = join(process.cwd(), "lib/db", migrationsDir)
    let files: string[]

    try {
      files = await readdir(migrationsPath)
    } catch {
      // No migrations directory
      return result
    }

    // Sort by migration ID
    const migrationFiles = files
      .map((f) => ({ filename: f, id: parseMigrationId(f) }))
      .filter((m): m is { filename: string; id: string } => m.id !== null)
      .sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10))

    for (const { filename, id } of migrationFiles) {
      if (appliedMigrations.has(id)) {
        result.skipped.push(filename)
        continue
      }

      try {
        const sqlContent = await readFile(
          join(migrationsPath, filename),
          "utf-8",
        )

        await client.query("BEGIN")
        try {
          await client.query(sqlContent)
          await recordMigration(client, id, filename)
          await client.query("COMMIT")
          result.applied.push(filename)
        } catch (error) {
          await client.query("ROLLBACK")
          throw error
        }
      } catch (error) {
        result.errors.push({
          filename,
          error: error instanceof Error ? error.message : String(error),
        })
        // Stop on first error
        break
      }
    }
  } finally {
    client.release()
  }

  return result
}

/**
 * Get migration status
 */
export async function getMigrationStatus(): Promise<{
  applied: string[]
  pending: string[]
}> {
  const client = await pool.connect()

  try {
    await ensureMigrationsTable(client)
    const appliedMigrations = await getAppliedMigrations(client)

    const migrationsPath = join(process.cwd(), "lib/db/migrations")
    let files: string[] = []

    try {
      files = await readdir(migrationsPath)
    } catch {
      // No migrations directory
    }

    const migrationFiles = files
      .map((f) => ({ filename: f, id: parseMigrationId(f) }))
      .filter((m): m is { filename: string; id: string } => m.id !== null)
      .sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10))

    return {
      applied: migrationFiles
        .filter((m) => appliedMigrations.has(m.id))
        .map((m) => m.filename),
      pending: migrationFiles
        .filter((m) => !appliedMigrations.has(m.id))
        .map((m) => m.filename),
    }
  } finally {
    client.release()
  }
}
