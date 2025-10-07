/**
 * Candidate Module
 *
 * Server actions and utilities for candidate-facing features.
 */

export {
  createApplication,
  getOpenPositions,
  getPositionById,
  submitScreeningQuestions,
  updateApplicant,
} from "./actions"
export type { Applicant, Candidate, ScreeningQuestionsData } from "./types"
