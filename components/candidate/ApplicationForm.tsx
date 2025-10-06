"use client"

import type { ChangeEvent, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
   * Callback when form data changes
   */
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  /**
   * Callback when form is submitted
   */
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  /**
   * Callback when back button is clicked
   */
  onBack: () => void
}

export function ApplicationForm({
  formData,
  onChange,
  onSubmit,
  onBack,
}: ApplicationFormProps) {
  return (
    <div className="mt-8 animate-in fade-in duration-500">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold">Application Details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Please review and confirm your information
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={onChange}
                placeholder="John"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={onChange}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={onChange}
              placeholder="john.doe@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={onChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedInUrl">LinkedIn Profile URL</Label>
            <Input
              id="linkedInUrl"
              name="linkedInUrl"
              type="url"
              value={formData.linkedInUrl}
              onChange={onChange}
              placeholder="https://www.linkedin.com/in/your-profile"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit">Submit Application</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
