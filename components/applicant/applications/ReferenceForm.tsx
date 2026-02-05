"use client"

import { useRouter } from "next/navigation"
import type React from "react"
import type { ChangeEvent, FocusEvent, FormEvent } from "react"
import { useEffect, useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ResumeReference } from "@/lib/applicant"
import type { ReferenceActionState } from "@/lib/application/reference-actions"
import { cn } from "@/lib/utils"
import {
  ensureValidEmail,
  ensureValidPhone,
  FormValidationError,
  normalizeContactInput,
} from "@/lib/validation/contact"

const initialActionState: ReferenceActionState = {
  error: undefined,
  success: false,
}

type ReferenceFormValues = {
  name: string
  email: string
  phone: string
  position: string
  company: string
  relationship: string
  applicantPosition: string
}

type ReferenceFormErrors = Partial<Record<keyof ReferenceFormValues, string>>

type ReferenceFormProps = {
  applicationId: string
  redirectPath: string
  reference?: ResumeReference
  formAction: (
    prevState: ReferenceActionState,
    formData: FormData,
  ) => Promise<ReferenceActionState>
  submitLabel?: string
  submitVariant?: React.ComponentProps<typeof Button>["variant"]
}

function getInitialValues(reference?: ResumeReference): ReferenceFormValues {
  return {
    name: reference?.name || "",
    email: reference?.email ?? "",
    phone: reference?.phone ?? "",
    position: reference?.position ?? "",
    company: reference?.company ?? "",
    relationship: reference?.relationship ?? "",
    applicantPosition:
      reference?.applicantPosition !== null &&
      reference?.applicantPosition !== undefined
        ? String(reference.applicantPosition)
        : "",
  }
}

function validateReferenceFields(values: ReferenceFormValues) {
  const errors: ReferenceFormErrors = {}
  const trimmedName = values.name.trim()
  let normalizedEmail: string | null = null
  let normalizedPhone: string | null = null

  if (trimmedName.length < 2) {
    errors.name = "Name must be at least 2 characters long."
  }

  if (values.email.trim()) {
    try {
      normalizedEmail = ensureValidEmail(values.email)
    } catch (error) {
      const message =
        error instanceof FormValidationError
          ? error.message
          : "Please enter a valid email address."
      errors.email = message
    }
  }

  if (values.phone.trim()) {
    try {
      normalizedPhone = ensureValidPhone(values.phone)
    } catch (error) {
      const message =
        error instanceof FormValidationError
          ? error.message
          : "Please enter a valid phone number."
      errors.phone = message
    }
  }

  if (!values.email.trim() && !values.phone.trim()) {
    const message = "Provide at least an email or phone number."
    errors.email ||= message
    errors.phone ||= message
  }

  return {
    errors,
    normalized: {
      name: trimmedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      position: normalizeContactInput(values.position),
      company: normalizeContactInput(values.company),
      relationship: normalizeContactInput(values.relationship),
      applicantPosition: normalizeContactInput(values.applicantPosition),
    },
  }
}

export function ReferenceForm({
  applicationId,
  redirectPath,
  reference,
  formAction,
  submitLabel = "Save reference",
  submitVariant = "default",
}: ReferenceFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<ReferenceFormValues>(() =>
    getInitialValues(reference),
  )
  const [errors, setErrors] = useState<ReferenceFormErrors>({})
  const [serverState, setServerState] =
    useState<ReferenceActionState>(initialActionState)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setValues(getInitialValues(reference))
    setErrors({})
  }, [reference])

  useEffect(() => {
    if (serverState.success) {
      setErrors({})
      if (!reference) {
        setValues(getInitialValues())
      }
    }
  }, [serverState.success, reference])

  const isFormReady = useMemo(() => {
    return (
      values.name.trim().length >= 2 &&
      (values.email.trim().length > 0 || values.phone.trim().length > 0)
    )
  }, [values.name, values.email, values.phone])

  const hasErrors = Object.keys(errors).length > 0

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }))
    setErrors((prev) => {
      if (!prev[name as keyof ReferenceFormErrors]) {
        return prev
      }
      const next = { ...prev }
      delete next[name as keyof ReferenceFormErrors]
      return next
    })
  }

  const handleBlur = (
    event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const fieldName = event.target.name as keyof ReferenceFormValues
    const { errors: fieldErrors } = validateReferenceFields(values)
    setErrors((prev) => {
      const next = { ...prev }
      const message = fieldErrors[fieldName]
      if (message) {
        next[fieldName] = message
      } else {
        delete next[fieldName]
      }
      return next
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const { errors: validationErrors, normalized } =
      validateReferenceFields(values)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const formData = new FormData()
    formData.set("applicationId", applicationId)
    formData.set("redirectPath", redirectPath)
    if (reference?.id) {
      formData.set("referenceId", reference.id)
    }
    formData.set("name", normalized.name)
    formData.set("email", normalized.email ?? "")
    formData.set("phone", normalized.phone ?? "")
    formData.set("position", normalized.position ?? "")
    formData.set("company", normalized.company ?? "")
    formData.set("relationship", normalized.relationship ?? "")
    formData.set("applicantPosition", normalized.applicantPosition ?? "")

    startTransition(async () => {
      const result = await formAction(initialActionState, formData)
      setServerState(result)
      if (result.success) {
        toast.success(reference ? "Reference updated" : "Reference saved", {
          // description: "We'll reach out to them shortly.",
          position: "top-center",
          duration: 2000,
          className:
            "bg-emerald-600 text-white shadow-lg shadow-emerald-700/40",
        })
        router.refresh()
      }
    })
  }

  return (
    <form className="mt-6 grid gap-4" noValidate onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={reference ? `name-${reference.id}` : "name"}>
            Full name <span className="text-destructive">*</span>
          </Label>
          <Input
            id={reference ? `name-${reference.id}` : "name"}
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            placeholder="e.g. Casey Morgan"
            className={cn(
              errors.name &&
                "border-destructive focus-visible:ring-destructive",
            )}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "reference-name-error" : undefined}
          />
          {errors.name ? (
            <p id="reference-name-error" className="text-sm text-destructive">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor={reference ? `email-${reference.id}` : "email"}>
            Email
          </Label>
          <Input
            id={reference ? `email-${reference.id}` : "email"}
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="casey@example.com"
            className={cn(
              errors.email &&
                "border-destructive focus-visible:ring-destructive",
            )}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email ? "reference-email-error" : undefined
            }
          />
          {errors.email ? (
            <p id="reference-email-error" className="text-sm text-destructive">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor={reference ? `phone-${reference.id}` : "phone"}>
            Phone
          </Label>
          <Input
            id={reference ? `phone-${reference.id}` : "phone"}
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Include country code if possible"
            className={cn(
              errors.phone &&
                "border-destructive focus-visible:ring-destructive",
            )}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={
              errors.phone ? "reference-phone-error" : undefined
            }
          />
          {errors.phone ? (
            <p id="reference-phone-error" className="text-sm text-destructive">
              {errors.phone}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor={reference ? `position-${reference.id}` : "position"}>
            Position / Title
          </Label>
          <Input
            id={reference ? `position-${reference.id}` : "position"}
            name="position"
            value={values.position}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Head of Engineering"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={reference ? `company-${reference.id}` : "company"}>
            Company
          </Label>
          <Input
            id={reference ? `company-${reference.id}` : "company"}
            name="company"
            value={values.company}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Company name"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor={
              reference
                ? `applicantPosition-${reference.id}`
                : "applicantPosition"
            }
          >
            Applicant’s role while working together
          </Label>
          <Input
            id={
              reference
                ? `applicantPosition-${reference.id}`
                : "applicantPosition"
            }
            name="applicantPosition"
            value={values.applicantPosition}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Senior Designer"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label
            htmlFor={
              reference ? `relationship-${reference.id}` : "relationship"
            }
          >
            Relationship details
          </Label>
          <Textarea
            id={reference ? `relationship-${reference.id}` : "relationship"}
            name="relationship"
            value={values.relationship}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="How are you connected? What projects did you work on together?"
            rows={3}
          />
        </div>
      </div>

      {serverState.error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {serverState.error}
        </div>
      ) : null}

      {serverState.success && !serverState.error ? (
        <p className="text-sm text-muted-foreground">
          Reference saved successfully.
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="submit"
          className="min-w-32"
          variant={submitVariant}
          disabled={!isFormReady || hasErrors || isPending}
        >
          {isPending ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}
