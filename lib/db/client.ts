import { createPool, sql } from "@vercel/postgres"
import { config } from "dotenv"

config({ path: ".env.development.local" })

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
  // Development (explicit VERCEL_ENV=development)
  return process.env.POSTGRES_URL_DEV || process.env.POSTGRES_URL || ""
}

// Connection pool for serverless environment
const pool = createPool({
  connectionString: getDatabaseUrl(),
})

export { pool, sql }
