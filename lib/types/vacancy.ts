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
