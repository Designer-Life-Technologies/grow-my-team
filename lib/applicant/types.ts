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

/**
 * Minimal shape for an applicant's application record returned by GetMe.video.
 * Fields are intentionally optional to accommodate evolving API responses.
 */
export interface ApplicantApplication {
  id: string
  status?: string
  vacancy?: string
  applicant?: {
    id?: string
    firstname?: string
    lastname?: string
    email?: Email | string
    mobile?: Phone | string
    linkedInUrl?: string
  }
}

/**
 * Reference entry extracted from an applicant's resume.
 */
export interface ResumeReference {
  id?: string
  name: string
  email?: string | null
  phone?: string | null
  position?: string | null
  company?: string | null
  relationship?: string | null
  applicantPosition?: number | string | null
}

export type ResumeStatus =
  | "DRAFT"
  | "PROCESSING"
  | "PERSONAL_PROFILE"
  | "COMPLETE"
  | "ARCHIVED"

export interface ResumePositionCompany {
  name: string
  location: string | null
  linkedInUrl: string | null
  linkedInId: string | null
  websiteUrl: string | null
  logoUrl: string | null
}

export interface ResumePositionDate {
  year: number
  month: number
}

export interface ResumePosition {
  title: string
  company: ResumePositionCompany
  startDate: ResumePositionDate
  endDate: ResumePositionDate | null
  description: string
  responsibilities: string[]
  achievements: string[]
}

/**
 * Minimal shape for an application's resume payload retrieved from GetMe.video.
 * Fields are optional to accommodate evolving API responses.
 */
export interface Resume {
  id?: string
  name?: string
  file?: string
  status?: ResumeStatus
  positions?: ResumePosition[]
  references?: ResumeReference[]
}
