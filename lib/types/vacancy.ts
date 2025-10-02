import type { Advert } from "./advert"
import type { ScreeningQuestion } from "./screening-questions"

/**
 * Vacancy Types
 *
 * Type definitions for job vacancies and related data structures.
 * These types are used throughout the application for type-safe vacancy management.
 */

export type VacancyStatus =
  | "DRAFT"
  | "JOB_SPEC"
  | "IDEAL_CANDIDATE"
  | "QUESTION_SET"
  | "CANDIDATE_SOURCING"
  | "INTERVIEW"
  | "OFFER"
  | "CLOSED"
  | "DELETED"

export type VacancyType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "TEMPORARY"
  | "INTERNSHIP"
  | "VOLUNTEER"
  | "CASUAL"
  | "OTHER"

export type WorkplaceType = "ON_SITE" | "REMOTE" | "HYBRID"

export type Industry =
  | "Academic and Scientific research"
  | "Administrative and Support Service"
  | "Agriculture and Forestry"
  | "Arts, Entertainment and Recreation"
  | "Construction"
  | "Education and Training"
  | "Energy and Utilities"
  | "Finance and Insurance"
  | "Government"
  | "Healthcare"
  | "Hospitality, Accommodation and Food Services"
  | "Information and Communication Technology"
  | "Law Enforcement"
  | "Legal"
  | "Manufacturing"
  | "Military and Defence"
  | "Mining"
  | "Oil and Gas"
  | "Personal Services"
  | "Pharmaceutical"
  | "Public Administration"
  | "Real Estate"
  | "Religious"
  | "Retail"
  | "Social Services and Support"
  | "Transportation and Logistics"
  | "Travel and Tourism"
  | "Wholesale and Retail Trade"

export type Seniority =
  | "Graduate (no experience)"
  | "Junior (0 to 2 years experience)"
  | "Mid Level (2 - 7 years experience)"
  | "Senior (7+ years experience)"
  | "Expert (10+ years experience)"
  | "Middle Management"
  | "Senior Management"
  | "Executive"
  | "Board Level"

export interface UserInput {
  description?: string
}

export interface JobDescription {
  title?: string
  type?: VacancyType
  workplaceType?: WorkplaceType
  location?: string
  qualifications?: string[]
  skills?: string[]
  personality?: string[]
  industry?: Industry
  seniority?: Seniority
  salary?: string
  userNotes?: string
}

export interface DISCStatement {
  statement: string
  category: "D" | "I" | "S" | "C"
  detail: string
}

export interface DISCOrderedStatementGroup {
  1: DISCStatement
  2: DISCStatement
  3: DISCStatement
  4: DISCStatement
}

export interface DISCResult {
  score: number
  keywords: string[]
  description: string
  title: string
}

export interface IdealCandidateProfile {
  reversePersonalityProfile?: {
    reverseDISC?: {
      orderedGroups: DISCOrderedStatementGroup[]
      results: {
        D: DISCResult
        I: DISCResult
        S: DISCResult
        C: DISCResult
      }
    }
  }
  description?: string
}

export interface CandidateSourcing {
  advert: Advert
  screeningQuestions?: ScreeningQuestion[]
  status?: "DRAFT" | "OPEN" | "CLOSED"
}

export interface Vacancy {
  id?: string
  status?: VacancyStatus
  owner?: string
  userInput?: UserInput
  jobDescription: JobDescription
  idealCandidateProfile?: IdealCandidateProfile
  candidateSourcing?: CandidateSourcing
  updated?: string
  created?: string
}

export interface JobInterviewGenerationRequest {
  quantity: number
  jobTitle: string
  seniority?: string
  industries?: string[]
  skills?: string[]
  interviewerNotes?: boolean
  applicantNotes?: boolean
}
