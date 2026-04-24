#!/usr/bin/env tsx
/**
 * Theme Creation Script with AI Color Extraction
 *
 * This script helps create a new theme by:
 * 1. Looking for logo, favicon, and screenshot in temp directory
 * 2. Converting them to base64
 * 3. Asking for theme details interactively
 * 4. Making an API call to POST /api/admin/themes
 * 5. Displaying the result
 */

import { existsSync, readFileSync } from "node:fs"
import * as readline from "node:readline"

const TEMP_DIR = "./tmp-theme-assets"

/**
 * Convert a file to base64 string
 */
function fileToBase64(filePath: string): string {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }

  const buffer = readFileSync(filePath)
  const ext = filePath.split(".").pop()?.toLowerCase() || "png"

  const mimeTypes: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    ico: "image/x-icon",
  }

  const mimeType = mimeTypes[ext] || "image/png"
  const base64 = buffer.toString("base64")

  return `data:${mimeType};base64,${base64}`
}

/**
 * Ask a question and get user input
 */
function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

/**
 * Main function
 */
async function main() {
  console.log("🎨 Theme Creation with AI Color Extraction\n")

  // Check for files in temp directory
  const logoPath = `${TEMP_DIR}/logo.png`
  const faviconPath = `${TEMP_DIR}/favicon.ico`
  const screenshotPath = `${TEMP_DIR}/screenshot.png`

  console.log(`Looking for images in: ${TEMP_DIR}`)
  console.log(`  Logo: ${existsSync(logoPath) ? "✓ Found" : "✗ Not found"}`)
  console.log(
    `  Favicon: ${existsSync(faviconPath) ? "✓ Found" : "✗ Not found (optional)"}`,
  )
  console.log(
    `  Screenshot: ${existsSync(screenshotPath) ? "✓ Found" : "✗ Not found (optional)"}`,
  )
  console.log()

  if (!existsSync(logoPath)) {
    console.error(
      "❌ Logo file is required. Please place logo.png in the temp directory.",
    )
    console.log(`   Expected path: ${logoPath}`)
    process.exit(1)
  }

  // Check for environment variables (for automated runs)
  const slug =
    process.env.THEME_SLUG ||
    (await askQuestion("Theme slug (e.g., my-client): "))
  const name =
    process.env.THEME_NAME ||
    (await askQuestion("Theme name (e.g., My Client): "))
  const companyName =
    process.env.THEME_COMPANY ||
    (await askQuestion("Company name (e.g., My Company Inc): "))
  const customDomain =
    process.env.THEME_DOMAIN ||
    (await askQuestion("Custom domain (optional, press Enter to skip): "))
  const website =
    process.env.THEME_WEBSITE ||
    (await askQuestion("Website URL (optional, press Enter to skip): "))

  console.log("\nCreating theme with AI color extraction...")
  console.log(`  Slug: ${slug}`)
  console.log(`  Name: ${name}`)
  console.log(`  Company: ${companyName}`)
  if (customDomain) console.log(`  Custom Domain: ${customDomain}`)
  if (website) console.log(`  Website: ${website}`)
  console.log(`  Logo: ${logoPath}`)
  if (existsSync(faviconPath)) console.log(`  Favicon: ${faviconPath}`)
  if (existsSync(screenshotPath)) console.log(`  Screenshot: ${screenshotPath}`)

  try {
    // Convert files to base64
    console.log("\nConverting files to base64...")
    const logoBase64 = fileToBase64(logoPath)
    const faviconBase64 = existsSync(faviconPath)
      ? fileToBase64(faviconPath)
      : undefined
    const screenshotBase64 = existsSync(screenshotPath)
      ? fileToBase64(screenshotPath)
      : undefined

    // Prepare API request
    const apiUrl = "http://localhost:3002/api/admin/themes"
    const body: Record<string, unknown> = {
      slug,
      name,
      companyName,
      logoBase64,
      faviconBase64,
      screenshotBase64,
      logoWidth: 110,
      supportsDarkMode: true,
    }

    if (customDomain) body.customDomain = customDomain
    if (website) body.website = website

    console.log("\nMaking API request...")
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const result = await response.json()

    if (response.ok) {
      console.log("\n✅ Theme created successfully!")
      console.log(`Theme ID: ${result.theme.id}`)
      console.log(`Theme Name: ${result.theme.name}`)
      console.log(`\nColors extracted:`)
      console.log(`  Primary (light): ${result.theme.colors.light.primary}`)
      console.log(`  Primary (dark): ${result.theme.colors.dark.primary}`)
      console.log(`  Secondary (light): ${result.theme.colors.light.secondary}`)
      console.log(`  Secondary (dark): ${result.theme.colors.dark.secondary}`)
    } else {
      console.error("\n❌ Failed to create theme:")
      console.error(`  Error: ${result.error}`)
      if (result.details) {
        console.error(`  Details: ${result.details}`)
      }
      process.exit(1)
    }
  } catch (error) {
    console.error("\n❌ Error:", error)
    process.exit(1)
  }
}

main()
