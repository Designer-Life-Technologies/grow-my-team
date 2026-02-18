// Shared validation helpers for normalizing and validating contact fields
// such as email addresses and phone numbers across applicant-facing forms.
export class FormValidationError extends Error {
  field?: string

  constructor(message: string, field?: string) {
    super(message)
    this.name = "FormValidationError"
    this.field = field
  }
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PHONE_PATTERN = /^[+\d][\d\s().-]{6,}$/

export type ContactValidationOptions = {
  required?: boolean
}

export function normalizeContactInput(
  value: string | null | undefined,
): string | null {
  if (value === null || value === undefined) {
    return null
  }

  const trimmedValue = value.toString().trim()
  return trimmedValue.length ? trimmedValue : null
}

export function ensureValidEmail(
  value: string | null | undefined,
  options: ContactValidationOptions = {},
): string | null {
  const normalized = normalizeContactInput(value)

  if (!normalized) {
    if (options.required) {
      throw new FormValidationError("Email is required.", "email")
    }

    return null
  }

  if (!EMAIL_PATTERN.test(normalized)) {
    throw new FormValidationError(
      "Please enter a valid email address.",
      "email",
    )
  }

  return normalized
}

export function ensureValidPhone(
  value: string | null | undefined,
  options: ContactValidationOptions = {},
): string | null {
  const normalized = normalizeContactInput(value)

  if (!normalized) {
    if (options.required) {
      throw new FormValidationError("Phone number is required.", "phone")
    }

    return null
  }

  if (!PHONE_PATTERN.test(normalized)) {
    throw new FormValidationError(
      "Phone numbers can include digits, spaces, or symbols like + ( ) -.",
      "phone",
    )
  }

  return normalized
}
