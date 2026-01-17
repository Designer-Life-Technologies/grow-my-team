"use server"

import { safeCallGetMeApi } from "@/lib/api"
import type { DISCAnswerSet } from ".."

/**
 * Returns the current DISC profile test for an application.
 *
 * @param applicationId
 * @returns
 */
export async function getDISC(
  applicationId: string,
): Promise<DISCAnswerSet | null> {
  // First attempt to get the full status/answers from the answers endpoint
  const result = await safeCallGetMeApi<DISCAnswerSet | null>(
    `/applicant/application/${applicationId}/profile-test/disc`,
    { method: "GET" },
  )

  if (result.success) {
    if (result.data) {
      return {
        ...result.data,
        serverNow: result.serverNow,
      }
    }
    // Success but null data (unlikely given the type, but safe)
    return null
  }

  // At this point result is { success: false, ... }
  // If 404, we return null immediately as requested (no need to retry unless there's a specific reason for the double-call structure in the original code, but safeCall simplifies this).
  // Note: The original code retried the SAME endpoint on 404. This seems redundant unless it was trying to handle race conditions or specific API quarks.
  // Given the instruction to "simplify", we will return null on 404.

  if (result.status === 404) {
    return null
  }

  // For other errors, we previously re-threw.
  throw new Error(result.error)
}

/**
 * Updates the DISC profile test answers for the application.
 *
 * @param applicationId
 * @param answerSet
 * @returns
 */
export async function submitDISCAnswers(
  applicationId: string,
  answerSet: DISCAnswerSet,
): Promise<DISCAnswerSet> {
  // Remove the startedAt field from the answer set
  const { startedAt: _startedAt, ...answers } = answerSet

  const result = await safeCallGetMeApi<DISCAnswerSet>(
    `/applicant/application/${applicationId}/profile-test/disc/answers`,
    {
      method: "PUT",
      body: answers as unknown as Record<string, unknown>,
    },
  )

  if (!result.success) {
    throw new Error(result.error)
  }

  return {
    ...result.data,
    serverNow: result.serverNow,
  }
}
