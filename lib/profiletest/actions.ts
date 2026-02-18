"use server"

import { safeCallGetMeApi } from "@/lib/api"
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
  if (!applicationId) {
    throw new Error("Missing application ID for profile test request")
  }

  // The API returns the DISC questionnaire for this application
  const result = await safeCallGetMeApi<DISCQuestionnaire>(
    `/applicant/application/${applicationId}/profile-test/disc/questionnaire`,
    { method: "GET" },
  )

  if (!result.success) {
    throw new Error(result.error)
  }

  return result.data
}
