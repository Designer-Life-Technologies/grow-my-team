"use server"

import { callGetMeApi } from "@/lib/api"
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
  return callGetMeApi<DISCAnswerSet | null>(
    `/applicant/application/${applicationId}/profile-test/disc`,
    { method: "GET" },
  )
    .then((res) => {
      if (res.data) {
        return {
          ...res.data,
          serverNow: res.serverNow,
        }
      }
      return null
    })
    .catch(async (error: unknown) => {
      // If 404 on answers, try the base disc endpoint which might have metadata
      if (
        error instanceof Error &&
        (error as { status?: number }).status === 404
      ) {
        try {
          const res = await callGetMeApi<DISCAnswerSet | null>(
            `/applicant/application/${applicationId}/profile-test/disc`,
            { method: "GET" },
          )
          if (res.data) {
            return {
              ...res.data,
              serverNow: res.serverNow,
            }
          }
          return null
        } catch (innerError) {
          if (
            innerError instanceof Error &&
            (innerError as { status?: number }).status === 404
          ) {
            return null
          }
          throw innerError
        }
      }
      throw error
    })
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

  const res = await callGetMeApi<DISCAnswerSet>(
    `/applicant/application/${applicationId}/profile-test/disc/answers`,
    {
      method: "PUT",
      body: answers as unknown as Record<string, unknown>,
    },
  )
  return {
    ...res.data,
    serverNow: res.serverNow,
  }
}
