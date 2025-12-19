import type {
  Advert,
  Email,
  Industry,
  Phone,
  Seniority,
  VacancyType,
  WorkplaceType,
} from "../types"

/**
 * Applicant interface matching the API response format
 * Note: API uses lowercase field names (firstname, lastname, mobile)
 */
export interface Applicant {
  id: string
  firstname: string
  lastname: string
  email: Email | string
  mobile: Phone | string
  linkedInUrl?: string
}

/**
 * Screening questions data
 */
export interface ScreeningQuestionsData {
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
}

/**
 * Screening answer with question and answer pair
 */
export interface ScreeningAnswer {
  question: string
  answer: string
}

/**
 * ApplicantPublic namespace
 *
 * Contains all types related to applicant-facing features like job positions,
 * vacancy details, and sourcing.
 */
export namespace ApplicantPublic {
  export interface JobDescription {
    title: string
    location: string
    type: VacancyType
    workplaceType: WorkplaceType
    skills: string[]
    personality: string[]
    qualifications: string[]
    industry: Industry
    seniority: Seniority
    salary: string
    reportingTo: string
  }

  export interface CandidateSourcing {
    advert: Advert
    status?: "DRAFT" | "OPEN" | "CLOSED"
  }

  export interface Position {
    id: string
    jobDescription: JobDescription
    candidateSourcing: CandidateSourcing
    updated: string
    created: string
  }
}

export type DISCProfileTestCategory = "D" | "I" | "S" | "C" | "X"

export type DISCProfileTestStatement = {
  statement: string
  category: DISCProfileTestCategory
}

export type DISCProfileTestStatementGroup = {
  id: number
  statements: DISCProfileTestStatement[]
}
export type DISCProfileTestStatementGroupByCategory = {
  id: number
  statementsByCategory: Partial<
    Record<DISCProfileTestCategory, DISCProfileTestStatement>
  >
}

export type DISCProfileTestAnswerCategory = DISCProfileTestCategory

export type DISCProfileTestAnswer = {
  id: number
  most: DISCProfileTestAnswerCategory
  least: DISCProfileTestAnswerCategory
}

export type DISCProfileTestAnswerSet = {
  startedAt: Date
  completedAt: Date
  answers: DISCProfileTestAnswer[]
}
