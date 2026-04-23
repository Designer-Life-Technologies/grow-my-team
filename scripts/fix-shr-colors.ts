#!/usr/bin/env tsx
/**
 * Fix SHR theme colors and logo width from file-based theme
 */

import { config } from "dotenv"

config({ path: ".env.development.local" })

import { pool } from "../lib/db/client"

async function fixShrTheme() {
  const colors = {
    light: {
      primary: "#ff5101",
      secondary: "#8dd100",
      accent: "#ffe0cc",
      background: "#ffffff",
      surface: "#fffaf8",
      text: "#1f120c",
      textSecondary: "#4a342d",
      border: "#f0ddd4",
      success: "#38a357",
      warning: "#ffb347",
      error: "#e34b4e",
    },
    dark: {
      primary: "#ff7434",
      secondary: "#a8ff2c",
      accent: "#3a251c",
      background: "#170f0c",
      surface: "#231610",
      text: "#fff5ed",
      textSecondary: "#f1cfc1",
      border: "#3e251d",
      success: "#6cd77c",
      warning: "#ffc766",
      error: "#ff6b5e",
    },
  }

  await pool.query(
    "UPDATE client_themes SET colors = $1, logo_width = $2 WHERE client_slug = $3",
    [JSON.stringify(colors), 200, "shr"],
  )
  console.log("✅ Updated SHR theme with correct colors and logo_width=200")

  await pool.end()
}

fixShrTheme().catch(console.error)
