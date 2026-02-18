"use client"

import type { ChangeEvent, FocusEvent, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/**
 * ApplicationForm Component
 *
 * Form for collecting candidate's basic information during job application.
 * Includes first name, last name, email, phone, and LinkedIn URL fields.
 *
 * Features:
 * - Controlled form inputs
 * - Auto-populated from API data
 * - Email validation
 * - Required field validation
 * - Back navigation
 * - Responsive grid layout
 */

interface ApplicationFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  linkedInUrl: string
}

interface ApplicationFormProps {
  /**
   * Form data (controlled component)
   */
  formData: ApplicationFormData
  /**
   * Callback when a form field changes
   */
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  /**
   * Optional callback when a form field loses focus
   */
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void
  /**
   * Callback when the form is submitted
   */
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  /**
   * Callback when back button is clicked
   */
  onBack: () => void
  /**
   * Whether the form is currently submitting
   */
  isSubmitting?: boolean
  /**
   * Optional field-level validation errors
   */
  errors?: Partial<Record<keyof ApplicationFormData, string>>
}

export function ApplicationForm({
  formData,
  onChange,
  onBlur,
  onSubmit,
  onBack,
  isSubmitting = false,
  errors,
}: ApplicationFormProps) {
  // Validate that required fields are filled
  const isFormValid =
    formData.firstName.trim() !== "" && formData.email.trim() !== ""
  const hasErrors = Boolean(errors && Object.keys(errors).length)

  return (
    <div className="mt-8 animate-in fade-in duration-500">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold">Personal Details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Please review and confirm your information
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="John"
                className={cn(
                  errors?.firstName &&
                    "border-destructive focus-visible:ring-destructive",
                )}
                aria-invalid={Boolean(errors?.firstName)}
                aria-describedby={
                  errors?.firstName ? "firstName-error" : undefined
                }
                required
              />
              {errors?.firstName ? (
                <p id="firstName-error" className="text-sm text-destructive">
                  {errors.firstName}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={onChange}
              onBlur={onBlur}
              placeholder="john.doe@example.com"
              className={cn(
                errors?.email &&
                  "border-destructive focus-visible:ring-destructive",
              )}
              aria-invalid={Boolean(errors?.email)}
              aria-describedby={errors?.email ? "email-error" : undefined}
              required
            />
            {errors?.email ? (
              <p id="email-error" className="text-sm text-destructive">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={onChange}
              onBlur={onBlur}
              placeholder="+1 (555) 123-4567"
              className={cn(
                errors?.phone &&
                  "border-destructive focus-visible:ring-destructive",
              )}
              aria-invalid={Boolean(errors?.phone)}
              aria-describedby={errors?.phone ? "phone-error" : undefined}
            />
            {errors?.phone ? (
              <p id="phone-error" className="text-sm text-destructive">
                {errors.phone}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedInUrl">LinkedIn Profile URL</Label>
            <Input
              id="linkedInUrl"
              name="linkedInUrl"
              type="url"
              value={formData.linkedInUrl}
              onChange={onChange}
              onBlur={onBlur}
              placeholder="https://www.linkedin.com/in/your-profile"
              className={cn(
                errors?.linkedInUrl &&
                  "border-destructive focus-visible:ring-destructive",
              )}
              aria-invalid={Boolean(errors?.linkedInUrl)}
              aria-describedby={
                errors?.linkedInUrl ? "linkedInUrl-error" : undefined
              }
            />
            {errors?.linkedInUrl ? (
              <p id="linkedInUrl-error" className="text-sm text-destructive">
                {errors.linkedInUrl}
              </p>
            ) : null}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || hasErrors || isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Next"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
