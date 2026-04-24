import Anthropic from "@anthropic-ai/sdk"
import type { ColorExtractionOptions, ExtractedColors } from "./types"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * Extract colors from logo and optional favicon/screenshot using Claude 3.5 Sonnet
 */
export async function extractColorsFromImages(
  options: ColorExtractionOptions,
): Promise<ExtractedColors> {
  const { logoBase64, faviconBase64, screenshotBase64 } = options

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not configured")
  }

  // Prepare images for Claude
  const images: Anthropic.ImageBlockParam[] = []

  // Add logo (required)
  images.push({
    type: "image",
    source: {
      type: "base64",
      media_type: "image/png",
      data: logoBase64.split(",")[1] || logoBase64,
    },
  })

  // Add favicon if provided
  if (faviconBase64) {
    images.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/png",
        data: faviconBase64.split(",")[1] || faviconBase64,
      },
    })
  }

  // Add screenshot if provided
  if (screenshotBase64) {
    images.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/png",
        data: screenshotBase64.split(",")[1] || screenshotBase64,
      },
    })
  }

  const prompt = `You are a color extraction specialist. Analyze the provided images (logo, favicon, and/or website screenshot) and extract colors to create a complete color palette for a theme.

Your task:
1. Extract the dominant brand colors from the logo
2. If a screenshot is provided, analyze the UI color patterns and design language
3. Generate a full color palette with complementary colors
4. Ensure colors are accessible (good contrast ratios)
5. Create both light and dark mode versions

Return a JSON object with this exact structure:
{
  "light": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "surface": "#hex",
    "text": "#hex",
    "textSecondary": "#hex",
    "border": "#hex",
    "success": "#hex",
    "warning": "#hex",
    "error": "#hex"
  },
  "dark": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "surface": "#hex",
    "text": "#hex",
    "textSecondary": "#hex",
    "border": "#hex",
    "success": "#hex",
    "warning": "#hex",
    "error": "#hex"
  }
}

Color guidelines:
- Primary: Main brand color (from logo)
- Secondary: Complementary or darker shade of primary
- Accent: Bright, attention-grabbing color
- Background: Light/neutral background
- Surface: Slightly darker than background for cards/panels
- Text: High contrast against background
- TextSecondary: Muted text color
- Border: Subtle border color
- Success: Green shade for positive states
- Warning: Yellow/orange for warnings
- Error: Red shade for errors

Return ONLY the JSON object, no other text.`

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: prompt }, ...images],
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude")
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from Claude response")
    }

    const colors = JSON.parse(jsonMatch[0]) as ExtractedColors

    // Validate the response structure
    if (!colors.light || !colors.dark) {
      throw new Error("Invalid color palette structure from Claude")
    }

    return colors
  } catch (error) {
    console.error("Error extracting colors with Claude:", error)
    if (error instanceof Error) {
      if (error.message.includes("401") || error.message.includes("403")) {
        throw new Error(
          "Anthropic API authentication failed. Please check ANTHROPIC_API_KEY.",
        )
      }
      if (error.message.includes("429")) {
        throw new Error(
          "Anthropic API rate limit exceeded. Please try again later.",
        )
      }
      if (error.message.includes("400")) {
        throw new Error(
          "Invalid request to Anthropic API. Please check the image format and size.",
        )
      }
    }
    throw new Error(
      `Failed to extract colors: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}
