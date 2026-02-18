"use client"

import { useRouter } from "next/navigation"
import type React from "react"
import type { ChangeEvent, FocusEvent, FormEvent } from "react"
import { useEffect, useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Resume, ResumePosition, ResumeReferee } from "@/lib/applicant"
import type { RefereeActionState } from "@/lib/application/referee-actions"
import { cn } from "@/lib/utils"
import {
  ensureValidEmail,
  ensureValidPhone,
  FormValidationError,
  normalizeContactInput,
} from "@/lib/validation/contact"

const initialActionState: RefereeActionState = {
  error: undefined,
  success: false,
}

const NO_APPLICANT_POSITION_VALUE = "__none__"

type RefereeFormValues = {
  name: string
  email: string
  phone: string
  position: string
  company: string
  relationship: string
  applicantPosition: string
}

type RefereeFormErrors = Partial<Record<keyof RefereeFormValues, string>>

type RefereeFormProps = {
  applicationId: string
  redirectPath: string
  referee?: ResumeReferee
  formAction: (
    prevState: RefereeActionState,
    formData: FormData,
  ) => Promise<RefereeActionState>
  submitLabel?: string
  submitVariant?: React.ComponentProps<typeof Button>["variant"]
  onSuccess?: () => void
  resumePositions?: Resume["positions"]
  resetKey?: number
}

function getInitialValues(referee?: ResumeReferee): RefereeFormValues {
  return {
    name: referee?.name || "",
    email: referee?.email ?? "",
    phone: referee?.phone ?? "",
    position: referee?.position ?? "",
    company: referee?.company ?? "",
    relationship: referee?.relationship ?? "",
    applicantPosition:
      referee?.applicantPosition !== null &&
      referee?.applicantPosition !== undefined
        ? String(referee.applicantPosition)
        : "",
  }
}

function validateRefereeFields(values: RefereeFormValues) {
  const errors: RefereeFormErrors = {}
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
    const message = "Provide at least an email or phone number for the referee."
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

export function RefereeForm({
  applicationId,
  redirectPath,
  referee,
  formAction,
  submitLabel = "Save Referee",
  submitVariant = "default",
  onSuccess,
  resumePositions,
  resetKey,
}: RefereeFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<RefereeFormValues>(() =>
    getInitialValues(referee),
  )
  const [errors, setErrors] = useState<RefereeFormErrors>({})
  const [serverState, setServerState] =
    useState<RefereeActionState>(initialActionState)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    void resetKey
    setValues(getInitialValues(referee))
    setErrors({})
  }, [referee, resetKey])

  useEffect(() => {
    if (serverState.success) {
      setErrors({})
      if (!referee) {
        setValues(getInitialValues())
      }
    }
  }, [serverState.success, referee])

  const isFormReady = useMemo(() => {
    return (
      values.name.trim().length >= 2 &&
      (values.email.trim().length > 0 || values.phone.trim().length > 0)
    )
  }, [values.name, values.email, values.phone])

  const hasErrors = Object.keys(errors).length > 0

  const selectablePositions = useMemo(() => {
    if (!resumePositions?.length) {
      return []
    }
    return resumePositions.filter(
      (position): position is ResumePosition & { id: string | number } =>
        position?.id !== null && position?.id !== undefined,
    )
  }, [resumePositions])

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }))
    setErrors((prev) => {
      if (!prev[name as keyof RefereeFormErrors]) {
        return prev
      }
      const next = { ...prev }
      delete next[name as keyof RefereeFormErrors]
      return next
    })
  }

  const handleApplicantPositionChange = (nextValue: string) => {
    const normalizedValue =
      nextValue === NO_APPLICANT_POSITION_VALUE ? "" : nextValue
    const matchingPosition = normalizedValue
      ? selectablePositions.find(
          (position) => String(position.id) === normalizedValue,
        )
      : undefined
    const matchingCompany = matchingPosition?.company?.name?.trim()
    const shouldClearCompany = !normalizedValue
    setValues((prev) => ({
      ...prev,
      applicantPosition: normalizedValue,
      ...(shouldClearCompany
        ? { company: "" }
        : matchingCompany
          ? { company: matchingCompany }
          : {}),
    }))
    setErrors((prev) => {
      if (!prev.applicantPosition) {
        return prev
      }
      const next = { ...prev }
      delete next.applicantPosition
      return next
    })
  }

  const applicantPositionFieldId = referee
    ? `applicantPosition-${referee.id}`
    : "applicantPosition"

  const handleBlur = (
    event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const nextTarget = event.relatedTarget
    if (
      nextTarget instanceof HTMLElement &&
      nextTarget.dataset.dialogClose === "true"
    ) {
      return
    }
    const fieldName = event.target.name as keyof RefereeFormValues
    const { errors: fieldErrors } = validateRefereeFields(values)
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
      validateRefereeFields(values)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const formData = new FormData()
    formData.set("applicationId", applicationId)
    formData.set("redirectPath", redirectPath)
    if (referee?.id) {
      formData.set("refereeId", referee.id)
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
        toast.success(referee ? "Referee updated" : "Referee saved", {
          description: "",
          position: "top-center",
          duration: 2000,
          className:
            "bg-emerald-600 text-white shadow-lg shadow-emerald-700/40",
        })
        router.refresh()
        onSuccess?.()
      }
    })
  }

  return (
    <form className="mt-6 grid gap-4" noValidate onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2 space-y-2 min-w-0">
          <Label htmlFor={applicantPositionFieldId}>
            Relates to my work at
          </Label>
          <Select
            value={values.applicantPosition || NO_APPLICANT_POSITION_VALUE}
            onValueChange={handleApplicantPositionChange}
            disabled={!selectablePositions.length}
          >
            <SelectTrigger
              id={applicantPositionFieldId}
              aria-disabled={!selectablePositions.length}
              aria-label="Related applicant position"
              className="w-full max-w-full min-w-0 overflow-hidden whitespace-nowrap"
            >
              <SelectValue
                className="truncate"
                placeholder={
                  selectablePositions.length
                    ? "Select a previous position"
                    : "No previous positions available"
                }
              />
            </SelectTrigger>
            <SelectContent className="max-w-[calc(100vw-1.5rem)]">
              <SelectItem
                value={NO_APPLICANT_POSITION_VALUE}
                className="whitespace-normal break-words"
              >
                Not tied to a specific role
              </SelectItem>
              {selectablePositions.map((position) => {
                const companyName = position.company?.name
                const optionLabel = companyName
                  ? `${companyName} · ${position.title}`
                  : position.title
                return (
                  <SelectItem
                    key={position.id}
                    value={String(position.id)}
                    className="whitespace-normal break-words"
                  >
                    {optionLabel}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor={referee ? `name-${referee.id}` : "name"}>
            Full name <span className="text-destructive">*</span>
          </Label>
          <Input
            id={referee ? `name-${referee.id}` : "name"}
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
            aria-describedby={errors.name ? "referee-name-error" : undefined}
          />
          {errors.name ? (
            <p id="referee-name-error" className="text-sm text-destructive">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor={referee ? `company-${referee.id}` : "company"}>
            Company
          </Label>
          <Input
            id={referee ? `company-${referee.id}` : "company"}
            name="company"
            value={values.company}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Company name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={referee ? `position-${referee.id}` : "position"}>
            Position / Title
          </Label>
          <Input
            id={referee ? `position-${referee.id}` : "position"}
            name="position"
            value={values.position}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Head of Engineering"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={referee ? `email-${referee.id}` : "email"}>
            Email
          </Label>
          <Input
            id={referee ? `email-${referee.id}` : "email"}
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
            aria-describedby={errors.email ? "referee-email-error" : undefined}
          />
          {errors.email ? (
            <p id="referee-email-error" className="text-sm text-destructive">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor={referee ? `phone-${referee.id}` : "phone"}>
            Phone
          </Label>
          <Input
            id={referee ? `phone-${referee.id}` : "phone"}
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
            aria-describedby={errors.phone ? "referee-phone-error" : undefined}
          />
          {errors.phone ? (
            <p id="referee-phone-error" className="text-sm text-destructive">
              {errors.phone}
            </p>
          ) : null}
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label
            htmlFor={referee ? `relationship-${referee.id}` : "relationship"}
          >
            Relationship details
          </Label>
          <Textarea
            id={referee ? `relationship-${referee.id}` : "relationship"}
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
          Referee saved successfully.
        </p>
      ) : null}

      <div className="flex justify-end">
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={!isFormReady || isPending || hasErrors}
            variant={submitVariant}
          >
            {isPending ? "Saving..." : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}
