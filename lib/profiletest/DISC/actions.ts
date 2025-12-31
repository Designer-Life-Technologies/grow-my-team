import type { DISCAnswerSet } from ".."

/**
 * Returns the current DISC profile test for an application.
 *
 * If the profile test has not been started, it will be created.
 *
 * @param applicationId
 * @returns
 */
export async function getDISC(_applicationId: string): Promise<DISCAnswerSet> {
  return {
    id: "1234",
    startedAt: new Date(),
    answers: [],
  }
}

/**
 * Updates the DISC profile test answers for the application.
 *
 * Returns the current state of the profile test.
 *
 * If completed, the completedAt field will be set to the current time.
 *
 * @param applicationId
 * @param answerSet
 * @returns
 */
export async function submitDISCAnswers(
  _applicationId: string,
  answerSet: DISCAnswerSet,
): Promise<DISCAnswerSet> {
  return {
    ...answerSet,
  }
}
