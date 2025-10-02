/**
 * Advert Types
 *
 * Type definitions for job advertisements and screening question groups.
 * Converted from Zod schema to TypeScript interfaces and types.
 */

/**
 * Group name of a related set of screening questions.
 */
export type ScreeningQuestionGroup =
  | "BACKGROUND"
  | "EXPERIENCE"
  | "SKILLS"
  | "INDUSTRY"
  | "LICENCE_CERTIFICATION"
  | "WORKRIGHTS"
  | "ENVIRONMENT"

/**
 * Represents a job advert.
 */
export interface Advert {
  /** The title of the advert. */
  title: string

  /** The contents of the advert. */
  copy: string
}
