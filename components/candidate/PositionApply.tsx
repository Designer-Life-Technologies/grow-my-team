"use client"

import Link from "next/link"
import { signIn } from "next-auth/react"
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useStreamingModal } from "@/components/ui/StreamingModalProvider"
import { useApplicantSession } from "@/hooks/use-applicant-session"
import { useCreateApplication } from "@/hooks/use-create-application"
import type { Applicant } from "@/lib/candidate/types"
import { ApplicationForm } from "./ApplicationForm"
import { ResumeDropzone } from "./ResumeDropzone"

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
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [linkedInUrl, setLinkedInUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  // Store applicant data from API (available for future use/debugging)
  const [_applicantData, setApplicantData] = useState<Applicant | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    linkedInUrl: "",
  })

  // Check if applicant is already signed in
  const { isApplicant, user, isLoading } = useApplicantSession()

  // Populate form with existing applicant session data
  useEffect(() => {
    if (isApplicant && user) {
      console.log("👤 Existing applicant session found:", user)
      setFormData({
        firstName: user.name || "",
        lastName: "", // lastname not in session.user.name
        email: user.email || "",
        phone: user.mobile?.localNumber || "",
        linkedInUrl: user.linkedInUrl || "",
      })
      // Skip resume upload and show application form directly
      setShowApplicationForm(true)
    }
  }, [isApplicant, user])

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
    completeStreaming,
    errorStreaming,
    isProcessing,
  } = useStreamingModal()

  const { createApplication } = useCreateApplication()

  /**
   * Handle resume upload and/or LinkedIn submission with streaming updates
   */
  const handleNext = async () => {
    if (!selectedFile && !linkedInUrl.trim()) return

    setIsUploading(true)
    setError(null)

    // Start the streaming modal
    startStreaming(
      "AI is processing your resumé",
      "This process can take up to a minute. Please be patient...",
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
      const result = await createApplication(applicationFormData, (event) => {
        console.log("🎯 Event received:", event)
        // Display events as they arrive in real-time
        addEvent(event.message, event.type)
      })

      // Check if there were any errors
      if (!result.success) {
        const errorMessage =
          result.events.find((e) => e.type === "error")?.message ||
          "Failed to submit. Please try again."
        setError(errorMessage)
        completeStreaming()
        return
      }

      // Success - show application form with applicant data
      console.log("✅ Application result:", result)

      if (result.applicant) {
        setApplicantData(result.applicant)
        console.log("👤 Applicant data:", result.applicant)

        // Populate form with data from API (note: API uses lowercase field names)
        setFormData({
          firstName: result.applicant.firstname || "",
          lastName: result.applicant.lastname || "",
          email: result.applicant.email?.address || "",
          phone: result.applicant.mobile?.localNumber || "",
          linkedInUrl: result.applicant.linkedInUrl || "",
        })

        // Sign in the applicant to create a session
        await signIn("applicant", {
          redirect: false,
          applicantId: result.applicant.id,
          applicantData: JSON.stringify(result.applicant),
        })
        console.log("🔐 Applicant session created")
      }

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  /**
   * Handle form submission
   */
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // TODO: Submit application with form data
    console.log("Application submitted:", { formData, positionId })
  }

  // Show loading skeleton while checking session
  if (isLoading) {
    return <PositionApplySkeleton />
  }

  return (
    <section className="mx-auto max-w-3xl animate-in fade-in duration-700">
      <div className="mb-6">
        <Link
          href={`/candidate/position/${positionId}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to position details
        </Link>
      </div>

      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Apply for {positionTitle}
        </h1>
        {isApplicant && (
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back! Your information has been pre-filled from your
            previous application.
          </p>
        )}
      </header>

      {/* Resume Upload Section - Hidden when applicant data is available */}
      {!showApplicationForm && (
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
      {showApplicationForm && (
        <ApplicationForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleFormSubmit}
          onBack={() => setShowApplicationForm(false)}
        />
      )}
    </section>
  )
}
