"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSession, signIn } from "next-auth/react"
import {
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
  useState,
} from "react"
import { Button } from "@/components/ui/button"
import { useStreamingModal } from "@/components/ui/StreamingModalProvider"
import { useCreateApplicant } from "@/hooks/use-create-applicant"
import {
  createApplication,
  submitScreeningAnswers,
  updateApplicant,
} from "@/lib/applicant"
import type { Applicant } from "@/lib/applicant/types"
import { logger } from "@/lib/utils/logger"
import {
  ensureValidEmail,
  ensureValidPhone,
  FormValidationError,
} from "@/lib/validation/contact"
import { ApplicationForm } from "./ApplicationForm"
import { ApplicationSuccess } from "./ApplicationSuccess"
import { ResumeDropzone } from "./ResumeDropzone"
import {
  SCREENING_QUESTIONS,
  ScreeningQuestionsForm,
} from "./ScreeningQuestionsForm"

/**
 * PositionApply Component
 *
 * Orchestrates the job application process by managing the resume upload
 * and application form workflow.
 *
 * Features:
 * - Resume upload with validation
 * - Loading state during upload
 * - Application form for candidate details
 * - Multi-step workflow
 * - Error handling
 */

interface PositionApplyProps {
  /**
   * Position ID for the application
   */
  positionId: string
  /**
   * Position title to display in the header
   */
  positionTitle: string
}

/**
 * PositionApplySkeleton Component
 *
 * Loading skeleton that matches the PositionApply layout.
 * Used as a loading state while the component is being loaded.
 */
export function PositionApplySkeleton() {
  return (
    <section className="mx-auto max-w-3xl opacity-60">
      <div className="mb-6">
        <div className="h-4 w-48 animate-pulse rounded bg-foreground/10" />
      </div>

      <header>
        <div className="h-9 w-2/3 animate-pulse rounded bg-foreground/10" />
        <div className="mt-2 h-5 w-3/4 animate-pulse rounded bg-foreground/10" />
      </header>

      <div className="mt-8">
        <div className="h-64 w-full animate-pulse rounded-lg bg-foreground/10" />
      </div>
    </section>
  )
}

export function PositionApply({
  positionId,
  positionTitle,
}: PositionApplyProps) {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [linkedInUrl, setLinkedInUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [showScreeningQuestions, setShowScreeningQuestions] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isUpdatingApplicant, setIsUpdatingApplicant] = useState(false)
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false)
  // Store applicant data from API (available for future use/debugging)
  const [_applicantData, setApplicantData] = useState<Applicant | null>(null)
  // Store application ID to prevent duplicate application creation
  const [applicationId, setApplicationId] = useState<string | null>(null)
  type PersonalDetailsFormData = {
    firstName: string
    lastName: string
    email: string
    phone: string
    linkedInUrl: string
  }

  const handleFormBlur = (e: FocusEvent<HTMLInputElement>) => {
    const fieldName = e.target.name as keyof PersonalDetailsFormData
    const { errors } = validatePersonalDetails(formData)
    setFormErrors((prev) => {
      const next = { ...prev }
      const message = errors[fieldName]
      if (message) {
        next[fieldName] = message
      } else {
        delete next[fieldName]
      }
      return next
    })
  }

  const [formData, setFormData] = useState<PersonalDetailsFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    linkedInUrl: "",
  })
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof PersonalDetailsFormData, string>>
  >({})
  const [screeningData, setScreeningData] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
  })

  const validatePersonalDetails = (
    data: PersonalDetailsFormData,
  ): {
    errors: Partial<Record<keyof PersonalDetailsFormData, string>>
    normalizedEmail: string | null
    normalizedPhone: string | null
  } => {
    const errors: Partial<Record<keyof PersonalDetailsFormData, string>> = {}
    let normalizedEmail: string | null = null
    let normalizedPhone: string | null = null

    if (!data.firstName.trim()) {
      errors.firstName = "First name is required."
    }

    try {
      normalizedEmail = ensureValidEmail(data.email, { required: true })
    } catch (validationError) {
      const message =
        validationError instanceof FormValidationError
          ? validationError.message
          : "Please enter a valid email address."
      errors.email = message
    }

    if (data.phone.trim()) {
      try {
        normalizedPhone = ensureValidPhone(data.phone)
      } catch (validationError) {
        const message =
          validationError instanceof FormValidationError
            ? validationError.message
            : "Please enter a valid phone number."
        errors.phone = message
      }
    }

    return { errors, normalizedEmail, normalizedPhone }
  }

  /**
   * Handle file selection from dropzone
   */
  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
  }

  /**
   * Handle validation errors from dropzone
   */
  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  /**
   * Handle LinkedIn URL change
   */
  const _handleLinkedInChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLinkedInUrl(e.target.value)
  }

  const {
    startStreaming,
    addEvent,
    addEventObject,
    completeStreaming,
    errorStreaming,
    isProcessing,
  } = useStreamingModal()

  const { createApplicant } = useCreateApplicant()

  /**
   * Handle resume upload and/or LinkedIn submission with streaming updates
   */
  const handleNext = async () => {
    if (!selectedFile && !linkedInUrl.trim()) return

    setIsUploading(true)
    setError(null)

    // Start the streaming modal
    startStreaming(
      "AI is processing your resume",
      "This process can take up to 30 seconds. Please be patient...",
    )

    try {
      // Create FormData
      const applicationFormData = new FormData()
      applicationFormData.append("vacancyId", positionId)
      if (selectedFile) {
        applicationFormData.append("resume", selectedFile)
      }
      if (linkedInUrl.trim()) {
        applicationFormData.append("linkedInUrl", linkedInUrl.trim())
      }

      // Submit with real-time streaming
      const result = await createApplicant(applicationFormData, (event) => {
        logger.log("🎯 Event received:", event)
        // Display events as they arrive in real-time (preserve progress)
        if (event) {
          const { message, type, progress, data } = event
          if (typeof progress === "number" || data !== undefined) {
            addEventObject({ message, type, progress, data })
          } else {
            addEvent(message, type)
          }
        }
      })

      // Check if there were any errors
      if (!result.success) {
        const errorMessage =
          result.events.find((e) => e.type === "error")?.message ||
          "Failed to submit. Please try again."
        setError(errorMessage)
        errorStreaming(errorMessage)
        return
      }

      // Success - show application form with applicant data
      logger.log("✅ Application result:", result)

      if (!result.auth) {
        throw new Error("Missing applicant auth payload from resume upload")
      }

      const signInRes = await signIn("applicant", {
        id: result.auth.id,
        nonce: result.auth.nonce,
        redirect: false,
      })

      if (signInRes?.error) {
        const qs = new URLSearchParams({ error: "Authentication failed" })
        router.replace(`/applicant/login?${qs.toString()}`)
        return
      }

      const session = await getSession()
      const sessionUser = session?.user

      if (!sessionUser || sessionUser.userType !== "applicant") {
        const qs = new URLSearchParams({ error: "Authentication failed" })
        router.replace(`/applicant/login?${qs.toString()}`)
        return
      }

      const applicant: Applicant = {
        id: sessionUser.id,
        firstname: sessionUser.firstname || "",
        lastname: sessionUser.lastname || "",
        email: sessionUser.email || "",
        mobile: sessionUser.mobile ?? "",
        linkedInUrl: sessionUser.linkedInUrl,
      }

      setApplicantData(applicant)

      // Populate form with data from session-derived applicant profile
      setFormData({
        firstName: applicant.firstname || "",
        lastName: applicant.lastname || "",
        email:
          typeof applicant.email === "string"
            ? applicant.email
            : applicant.email?.address || "",
        phone:
          typeof applicant.mobile === "string"
            ? applicant.mobile
            : applicant.mobile?.localNumber || "",
        linkedInUrl: applicant.linkedInUrl || "",
      })
      setFormErrors({})

      completeStreaming()
      setShowApplicationForm(true)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred"
      errorStreaming(errorMessage)
      setError(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  /**
   * Handle form field changes
   */
  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const fieldName = name as keyof PersonalDetailsFormData
    const updatedData = {
      ...formData,
      [fieldName]: value,
    }
    const { errors } = validatePersonalDetails(updatedData)

    setFormData(updatedData)
    setFormErrors((prev) => {
      const next = { ...prev }
      const message = errors[fieldName]
      if (message) {
        next[fieldName] = message
      } else {
        delete next[fieldName]
      }
      return next
    })
  }

  /**
   * Handle application form submission - update applicant and show screening questions
   */
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const { errors, normalizedEmail, normalizedPhone } =
      validatePersonalDetails(formData)

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    setIsUpdatingApplicant(true)

    try {
      // Get applicant ID from stored applicant data
      if (!_applicantData?.id) {
        setError(
          "No applicant data found. Please complete the resume upload step.",
        )
        return
      }

      const applicantId = _applicantData.id

      const updateData: Parameters<typeof updateApplicant>[1] = {
        firstname: formData.firstName.trim(),
        lastname: formData.lastName.trim(),
      }

      if (normalizedEmail) {
        updateData.email = normalizedEmail
      }

      if (normalizedPhone) {
        updateData.mobile = normalizedPhone
      }

      if (formData.linkedInUrl.trim()) {
        updateData.linkedInUrl = formData.linkedInUrl.trim()
      }

      logger.log("Updating applicant:", { applicantId, updateData })

      const result = await updateApplicant(applicantId, updateData)

      if (!result.success) {
        setError(result.error || "Failed to update applicant information")
        return
      }

      logger.log("✅ Applicant updated successfully:", result.applicant)

      if (result.applicant) {
        setApplicantData(result.applicant)
      }

      if (!applicationId) {
        logger.log("Creating application:", {
          applicantId,
          positionId,
        })

        const applicationResult = await createApplication(
          applicantId,
          positionId,
        )

        if (!applicationResult.success) {
          const errorMsg =
            applicationResult.error || "Failed to create application"
          logger.error("❌ Failed to create application:", errorMsg)
          setError(errorMsg)
          return
        }

        logger.log(
          "✅ Application created successfully:",
          applicationResult.applicationId,
        )

        setApplicationId(applicationResult.applicationId || null)

        logger.log("✅ Application created - guest application flow (no login)")
      } else {
        logger.log(
          "ℹ️ Application already exists, skipping creation:",
          applicationId,
        )
      }

      setShowApplicationForm(false)
      setShowScreeningQuestions(true)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      logger.error("Error updating applicant:", err)
    } finally {
      setIsUpdatingApplicant(false)
    }
  }

  /**
   * Handle screening questions form field changes
   */
  const handleScreeningChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setScreeningData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  /**
   * Handle screening questions form submission
   */
  const handleScreeningSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmittingApplication(true)
    setError(null)

    try {
      // Get applicant ID and application ID from stored data
      if (!_applicantData?.id) {
        setError("No applicant data found")
        return
      }

      if (!applicationId) {
        setError("No application ID found. Please complete the previous steps.")
        return
      }

      // Prepare answers array with question/answer pairs
      const answers = SCREENING_QUESTIONS.map((q) => ({
        question: q.label,
        answer: screeningData[q.id],
      }))

      logger.log("Submitting screening answers:", {
        applicantId: _applicantData.id,
        applicationId,
        answers,
      })

      // Submit screening answers
      const result = await submitScreeningAnswers(
        _applicantData.id,
        applicationId,
        answers,
      )

      if (!result.success) {
        setError(result.error || "Failed to submit screening answers")
        return
      }

      logger.log("✅ Screening answers submitted successfully")

      // Show success message
      setShowScreeningQuestions(false)
      setShowSuccess(true)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      logger.error("Error submitting application:", err)
    } finally {
      setIsSubmittingApplication(false)
    }
  }

  return (
    <section className="mx-auto max-w-3xl animate-in fade-in duration-700">
      <div className="mb-6">
        <Link
          href={`/position/${positionId}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to position details
        </Link>
      </div>

      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Apply for {positionTitle}
        </h1>
      </header>

      {/* Resume Upload Section - Hidden when applicant data, screening questions, or success are shown */}
      {!showApplicationForm && !showScreeningQuestions && !showSuccess && (
        <div className="mt-8">
          <ResumeDropzone
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onError={handleError}
            isDragging={isDragging}
            onDraggingChange={setIsDragging}
          />

          {/* Or divider */}
          {/* <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                And / Or
              </span>
            </div>
          </div> */}

          {/* LinkedIn URL input */}
          {/* <div className="space-y-2">
            <Label htmlFor="linkedInUrl">LinkedIn Profile URL</Label>
            <Input
              id="linkedInUrl"
              name="linkedInUrl"
              type="url"
              value={linkedInUrl}
              onChange={handleLinkedInChange}
              placeholder="https://www.linkedin.com/in/your-profile"
            />
            <p className="text-xs text-muted-foreground">
              Provide your LinkedIn profile as an alternative to uploading a
              resume
            </p>
          </div> */}

          {/* Error message */}
          {error && (
            <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Next button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleNext}
              disabled={
                (!selectedFile && !linkedInUrl.trim()) ||
                isUploading ||
                isProcessing
              }
              className="min-w-24"
            >
              {isUploading || isProcessing ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <title>Loading</title>
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Uploading...
                </>
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Application Form */}
      {showApplicationForm && !showScreeningQuestions && !showSuccess && (
        <>
          <ApplicationForm
            formData={formData}
            onChange={handleFormChange}
            onBlur={handleFormBlur}
            onSubmit={handleFormSubmit}
            onBack={() => setShowApplicationForm(false)}
            isSubmitting={isUpdatingApplicant}
            errors={formErrors}
          />
          {error && (
            <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </>
      )}

      {/* Screening Questions Form */}
      {showScreeningQuestions && !showSuccess && (
        <>
          <ScreeningQuestionsForm
            formData={screeningData}
            onChange={handleScreeningChange}
            onSubmit={handleScreeningSubmit}
            onBack={() => {
              setShowScreeningQuestions(false)
              setShowApplicationForm(true)
            }}
            isSubmitting={isSubmittingApplication}
          />
          {error && (
            <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </>
      )}

      {/* Success Message */}
      {showSuccess && (
        <ApplicationSuccess
          positionTitle={positionTitle}
          positionId={positionId}
          applicantEmail={
            _applicantData?.email
              ? typeof _applicantData.email === "string"
                ? _applicantData.email
                : _applicantData.email.address
              : undefined
          }
        />
      )}
    </section>
  )
}
