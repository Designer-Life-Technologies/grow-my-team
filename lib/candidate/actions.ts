"use server"

import { logger } from "@/lib/utils/logger"
import type { Applicant, Candidate, ScreeningAnswer } from "./types"

/**
 * Candidate Actions
 *
 * Server actions for candidate-facing features.
 */

/**
 * Get all open positions
 *
 * Returns a list of all currently open job positions from the public API.
 *
 * @returns Promise<Candidate.Position[]> - Array of open positions
 */
export async function getOpenPositions(): Promise<Candidate.Position[]> {
  try {
    const response = await fetch(
      `${process.env.GETME_API_URL}/public/vacancy`,
      {
        // Add cache revalidation to ensure fresh data
        next: { revalidate: 60 }, // Revalidate every 60 seconds
      },
    )

    if (!response.ok) {
      logger.error(`Failed to fetch positions: ${response.status}`)
      return []
    }

    const positions = (await response.json()) as Candidate.Position[]
    return positions
  } catch (error) {
    logger.error("Error fetching open positions:", error)
    return []
  }
}

/**
 * Get position details by ID
 *
 * Returns full details of a specific job position from the public API.
 *
 * @param positionId - The ID of the position to fetch
 * @returns Promise<Candidate.Position | null> - Position details or null if not found
 */
export async function getPositionById(
  positionId: string,
): Promise<Candidate.Position | null> {
  try {
    const response = await fetch(
      `${process.env.GETME_API_URL}/public/vacancy/${positionId}`,
    )
    const position = (await response.json()) as Candidate.Position

    return position
  } catch (error) {
    logger.error("Error fetching position details:", error)
    return null
  }
}

/**
 * Update applicant details
 *
 * Updates the applicant's information in the GetMe.video API.
 *
 * @param applicantId - The ID of the applicant to update
 * @param data - Partial applicant data to update
 * @returns Promise<{ success: boolean; applicant?: Applicant; error?: string }>
 */
export async function updateApplicant(
  applicantId: string,
  data: Partial<
    Pick<
      Applicant,
      "id" | "firstname" | "lastname" | "email" | "mobile" | "linkedInUrl"
    >
  >,
): Promise<{ success: boolean; applicant?: Applicant; error?: string }> {
  try {
    // TODO: Replace with callGetMeApi once applicant authentication tokens are available
    // For now, make direct API call without authentication
    data.id = applicantId
    const response = await fetch(
      `${process.env.GETME_API_URL}/applicant/${applicantId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error:
          errorData.error?.error_message ||
          errorData.detail ||
          `Failed to update applicant: ${response.status}`,
      }
    }

    const applicant = (await response.json()) as Applicant

    return {
      success: true,
      applicant,
    }
  } catch (error) {
    logger.error("Error updating applicant:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update applicant"
    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Create a new application
 *
 * Creates a new application in GetMe.video by linking an applicant to a position.
 * This should be called after updating applicant details to start the application process.
 * Note: This is currently an unauthenticated endpoint.
 *
 * @param applicantId - The ID of the applicant
 * @param positionId - The ID of the position (vacancyId) being applied to
 * @returns Promise<{ success: boolean; applicationId?: string; error?: string }>
 */
export async function createApplication(
  applicantId: string,
  positionId: string,
): Promise<{ success: boolean; applicationId?: string; error?: string }> {
  try {
    const response = await fetch(
      `${process.env.GETME_API_URL}/applicant/${applicantId}/application`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicant: applicantId,
          vacancy: positionId,
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error:
          errorData.error?.error_message ||
          errorData.detail ||
          `Failed to create application: ${response.status}`,
      }
    }

    const data = await response.json()

    return {
      success: true,
      applicationId: data.id,
    }
  } catch (error) {
    logger.error("Error creating application:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create application",
    }
  }
}

/**
 * Find an existing application
 *
 * Checks if an application already exists for the given applicant and position.
 * This should be called when a logged-in applicant visits the application page
 * to prevent duplicate applications.
 *
 * @param applicantId - The ID of the applicant
 * @param positionId - The ID of the position (vacancyId)
 * @returns Promise<{ success: boolean; applicationId?: string; error?: string }>
 */
export async function findApplication(
  applicantId: string,
  positionId: string,
): Promise<{ success: boolean; applicationId?: string; error?: string }> {
  try {
    const response = await fetch(
      `${process.env.GETME_API_URL}/applicant/${applicantId}/application/search?vacancyId=${positionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      // 404 means no application found, which is not an error
      if (response.status === 404) {
        return {
          success: true,
          applicationId: undefined,
        }
      }

      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error:
          errorData.error?.error_message ||
          errorData.detail ||
          `Failed to find application: ${response.status}`,
      }
    }

    const data = await response.json()

    return {
      success: true,
      applicationId: data.id,
    }
  } catch (error) {
    logger.error("Error finding application:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to find application",
    }
  }
}

/**
 * Submit screening answers for an application
 *
 * Submits the applicant's screening question responses to the GetMe.video API.
 *
 * @param applicantId - The ID of the applicant
 * @param applicationId - The ID of the application
 * @param answers - Array of screening answers with question/answer pairs
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function submitScreeningAnswers(
  applicantId: string,
  applicationId: string,
  answers: ScreeningAnswer[],
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${process.env.GETME_API_URL}/applicant/${applicantId}/application/${applicationId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ screeningAnswers: answers }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error:
          errorData.error?.error_message ||
          errorData.detail ||
          `Failed to submit screening answers: ${response.status}`,
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    logger.error("Error submitting screening answers:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to submit screening answers",
    }
  }
}
