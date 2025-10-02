/**
 * Screening Questions Types
 *
 * Type definitions for candidate screening questions.
 * Converted from Zod schema to TypeScript interfaces and types.
 */

import type { ScreeningQuestionGroup } from "./advert"

/**
 * Allowed types of screening questions.
 */
export type ScreeningQuestionType = "TEXT" | "NUMBER" | "MULTIPLE_CHOICE"

/**
 * A single screening question used to evaluate candidates.
 */
export interface ScreeningQuestion {
  /** The question to ask the candidate. */
  question: string

  /** The group name of a group of related questions. */
  group: ScreeningQuestionGroup

  /** The position of the question in the list of questions. */
  position: number | null

  /** The type of the question. */
  type: ScreeningQuestionType

  /**
   * The choices available for multiple choice question or the Skills, Industry,
   * Licence/Certification, etc. required by the question.
   */
  choices: string[] | null

  /** The expected choices for multiple choice question. */
  expectedChoices: string[] | null

  /** The expected answer for the question. */
  expectedAnswer: string | null

  /** The minimum expected answer for the question. */
  expectedAnswerMinValue: number | null

  /** The maximum expected answer for the question. */
  expectedAnswerMaxValue: number | null

  /** Whether the answer must match the expected answer. */
  mustMatch: boolean | null
}

/**
 * A collection of screening questions.
 */
export interface ScreeningQuestions {
  questions: ScreeningQuestion[]
}
