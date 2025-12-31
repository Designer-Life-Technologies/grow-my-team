/**
 * Profile Test Types
 *
 * Shared DISC profile test type definitions used across applicant flows.
 */

export type DISCStatementCategory = "D" | "I" | "S" | "C" | "X"

export type DISCStatement = {
  statement: string
  category: DISCStatementCategory
}

export type DISCStatementGroup = {
  id: number
  statements: DISCStatement[]
}

export type DISCQuestionnaire = DISCStatementGroup[]

export type DISCStatementGroupByCategory = {
  id: number
  statementsByCategory: Partial<Record<DISCStatementCategory, DISCStatement>>
}

export type DISCAnswerCategory = DISCStatementCategory

export type DISCAnswer = {
  id: number // Statement Group ID
  most: DISCAnswerCategory
  least: DISCAnswerCategory
}

export type DISCAnswerSet = {
  id?: string // Profile Test ID
  startedAt: Date
  completedAt?: Date
  answers: DISCAnswer[]
}
