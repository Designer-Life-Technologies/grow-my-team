"use server"

import type { Candidate } from "./types"

/**
 * Candidate Actions
 *
 * Server actions for candidate-facing features like browsing job positions.
 * These actions are public and do not require authentication.
 */

/**
 * Get all available positions
 *
 * Returns a list of all open job positions for candidates to browse.
 * Currently returns placeholder data.
 *
 */
// export async function getAllPositions(): Promise<Vacancy[]> {
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 100))

//   // Filter only open positions and return summary data
// }

/**
 * Get position details by ID
 *
 * Returns full details of a specific job position.
 * Currently returns placeholder data.
 *
 * @param positionId - The ID of the position to fetch
 * @returns Promise<Position | null> - Position details or null if not found
 *
 * TODO: Replace with actual API call:
 * const position = await fetch(`${process.env.GETME_API_URL}/v1/public/positions/${positionId}`)
 */
export async function getPositionById(
  positionId: string,
): Promise<Candidate.Vacancy | null> {
  try {
    const response = await fetch(
      `${process.env.GETME_API_URL}/public/vacancy/${positionId}`,
    )
    const position = (await response.json()) as Candidate.Vacancy

    return position
  } catch (error) {
    console.error("Error fetching position details:", error)
    return null
  }
}

/**
 * Create application with resume and/or LinkedIn profile
 *
 * Creates a candidate's application with either a resume file, LinkedIn URL, or both.
 *
 * @param positionId - The ID of the position being applied to
 * @param options - Object containing optional resume file and/or LinkedIn URL
 * @returns Promise with success status and optional error message
 */
export async function createApplication(
  positionId: string,
  options: {
    resumeFile?: File
    linkedInUrl?: string
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    const { resumeFile, linkedInUrl } = options

    // Validate that at least one option is provided
    if (!resumeFile && !linkedInUrl) {
      return {
        success: false,
        error: "Please provide a resume or LinkedIn profile",
      }
    }

    // Create FormData to send both file and LinkedIn URL
    const formData = new FormData()
    formData.append("vacancyId", positionId)

    if (resumeFile) {
      formData.append("resume", resumeFile)
    }

    if (linkedInUrl) {
      formData.append("linkedInUrl", linkedInUrl)
    }

    const response = await fetch(
      `${process.env.GETME_API_URL}/public/applicant`,
      {
        method: "POST",
        body: formData,
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || "Failed to submit application",
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Application submission error:", error)
    return {
      success: false,
      error: "An error occurred while submitting your application",
    }
  }
}
