"use server"

import { callGetMeApi } from "@/lib/api"
import { logger } from "@/lib/utils/logger"
import type { Applicant, ApplicantPublic, ScreeningAnswer } from "./types"

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
 * @returns Promise<ApplicantPublic.Position[]> - Array of open positions
 */
export async function getOpenPositions(): Promise<ApplicantPublic.Position[]> {
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

    const positions = (await response.json()) as ApplicantPublic.Position[]
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
): Promise<ApplicantPublic.Position | null> {
  try {
    const response = await fetch(
      `${process.env.GETME_API_URL}/public/vacancy/${positionId}`,
    )
    const position = (await response.json()) as ApplicantPublic.Position

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
    data.id = applicantId
    const response = await callGetMeApi<Applicant>(
      `/applicant/${applicantId}`,
      {
        method: "PUT",
        body: data,
      },
    )

    return {
      success: true,
      applicant: response.data,
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
    const response = await callGetMeApi<{ id: string }>(
      `/applicant/${applicantId}/application`,
      {
        method: "POST",
        body: {
          applicant: applicantId,
          vacancy: positionId,
        },
      },
    )

    return {
      success: true,
      applicationId: response.data.id,
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
    // callGetMeApi throws on non-2xx; treat "not found" as empty result.
    const response = await callGetMeApi<{ id: string }>(
      `/applicant/${applicantId}/application/search?vacancyId=${positionId}`,
      {
        method: "GET",
      },
    ).catch((error: unknown) => {
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("404")
      ) {
        return null
      }
      throw error
    })

    if (!response || !response.data) {
      return {
        success: true,
        applicationId: undefined,
      }
    }

    return {
      success: true,
      applicationId: response.data.id,
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
    await callGetMeApi<unknown>(
      `/applicant/${applicantId}/application/${applicationId}`,
      {
        method: "PUT",
        body: { screeningAnswers: answers },
      },
    )

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
