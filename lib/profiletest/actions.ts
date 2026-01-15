"use server"

import { callGetMeApi } from "@/lib/api"
import { logger } from "@/lib/utils/logger"
import type { DISCQuestionnaire } from "."

/**
 * Profile Test Actions
 *
 * Server actions for handling DISC profile test flows.
 */

/**
 * Get application profile test
 *
 * Returns the profile test for a specific application.
 *
 * @param applicationId - The ID of the application to fetch
 * @returns Promise<DISCQuestionnaire> - Array of profile test groups
 */
export async function getApplicationProfileTest(
  applicationId: string,
): Promise<DISCQuestionnaire> {
  try {
    if (!applicationId) {
      throw new Error("Missing application ID for profile test request")
    }

    // The API returns the DISC questionnaire for this application
    const response = await callGetMeApi<DISCQuestionnaire>(
      `/applicant/application/${applicationId}/profile-test/disc/questionnaire`,
      { method: "GET" },
    )

    return response.data
  } catch (error) {
    logger.error("Error fetching application profile test:", error)
    throw error
  }
}
