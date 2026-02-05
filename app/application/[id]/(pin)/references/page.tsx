import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import ApplicantPublicLayout from "@/app/(applicant)/(public)/layout"
import { ReferenceForm } from "@/components/applicant/applications/ReferenceForm"
import type { Resume, ResumeReference } from "@/lib/applicant"
import {
  addApplicationResumeReference,
  getApplicationResume,
  getPositionById,
  updateApplicationResumeReference,
} from "@/lib/applicant"
import {
  isApplicationAuthError,
  redirectToApplicationPin,
} from "@/lib/application/navigation"
import type { ReferenceActionState } from "@/lib/application/reference-actions"
import { getApplicantSessionServer } from "@/lib/auth/actions"
import { clearApplicantSession } from "@/lib/auth/applicant-auth"
import { FormValidationError } from "@/lib/validation/contact"

async function addResumeReferenceAction(
  _prevState: ReferenceActionState,
  formData: FormData,
): Promise<ReferenceActionState> {
  "use server"

  const applicationId = formData.get("applicationId")?.toString()
  if (!applicationId) {
    throw new Error("Missing application ID for reference creation")
  }

  const redirectPath =
    formData.get("redirectPath")?.toString() ||
    `/application/${applicationId}/references`

  try {
    await addApplicationResumeReference(applicationId, {
      name: (formData.get("name")?.toString() || "").trim(),
      email: formData.get("email")?.toString() || null,
      phone: formData.get("phone")?.toString() || null,
      position: formData.get("position")?.toString() || null,
      company: formData.get("company")?.toString() || null,
      relationship: formData.get("relationship")?.toString() || null,
      applicantPosition: formData.get("applicantPosition")?.toString() || null,
    })
  } catch (error) {
    if (error instanceof FormValidationError) {
      return { error: error.message }
    }
    const message =
      error instanceof Error
        ? error.message
        : "We couldn't save your reference. Please try again."
    return { error: message }
  }

  revalidatePath(redirectPath)
  return { success: true }
}

async function updateResumeReferenceAction(
  _prevState: ReferenceActionState,
  formData: FormData,
): Promise<ReferenceActionState> {
  "use server"

  const applicationId = formData.get("applicationId")?.toString()
  const referenceId = formData.get("referenceId")?.toString()
  if (!applicationId || !referenceId) {
    throw new Error("Missing identifiers for reference update")
  }

  const redirectPath =
    formData.get("redirectPath")?.toString() ||
    `/application/${applicationId}/references`

  try {
    await updateApplicationResumeReference(applicationId, referenceId, {
      name: (formData.get("name")?.toString() || "").trim(),
      email: formData.get("email")?.toString() || null,
      phone: formData.get("phone")?.toString() || null,
      position: formData.get("position")?.toString() || null,
      company: formData.get("company")?.toString() || null,
      relationship: formData.get("relationship")?.toString() || null,
      applicantPosition: formData.get("applicantPosition")?.toString() || null,
    })
  } catch (error) {
    if (error instanceof FormValidationError) {
      return { error: error.message }
    }
    const message =
      error instanceof Error
        ? error.message
        : "We couldn't update your reference. Please try again."
    return { error: message }
  }

  revalidatePath(redirectPath)
  return { success: true }
}

export default async function ApplicationReferencesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { isApplicant, isApplicationUser, user } =
    await getApplicantSessionServer()

  if (!isApplicant && !isApplicationUser) {
    const nextParam = encodeURIComponent(`/application/${id}/references`)
    redirect(`/application/${id}/pin?next=${nextParam}`)
  }

  if (isApplicationUser && user?.pinAction && user.pinAction !== "REFERENCES") {
    const nextParam = encodeURIComponent(`/application/${id}/references`)
    redirect(`/application/${id}/pin?next=${nextParam}`)
  }

  const vacancy = user?.vacancyId ? await getPositionById(user.vacancyId) : null

  let resume: Resume
  try {
    resume = await getApplicationResume(id)
  } catch (error) {
    if (isApplicationAuthError(error)) {
      await clearApplicantSession()
      return redirectToApplicationPin(id, `/application/${id}/references`, {
        reason: "session_expired",
      })
    }
    throw error
  }
  const positionTitle =
    vacancy?.candidateSourcing?.advert?.title ||
    vacancy?.jobDescription?.title ||
    ""
  const referencesPath = `/application/${id}/references`
  const references = resume.references || []

  return (
    <ApplicantPublicLayout>
      <section className="mx-auto max-w-3xl animate-in fade-in duration-700">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">
            Please provide your references
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{positionTitle}</p>
        </header>

        <div className="mt-8 space-y-4 text-muted-foreground">
          <p>
            Thank you for progressing to the next stage of your application. To
            help us complete our assessment, please provide the details for your
            professional references using the tools below.
          </p>
          <p>
            Add at least two recent managers or colleagues who can confidently
            speak about your work experience for this role. Update their contact
            information so our team can reach them promptly.
          </p>
        </div>

        <div className="mt-10 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">
            Add a new reference
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Provide the details of a professional reference. We’ll notify them
            only after you submit your application.
          </p>

          <ReferenceForm
            applicationId={id}
            redirectPath={referencesPath}
            formAction={addResumeReferenceAction}
            submitLabel="Save reference"
          />
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-foreground">
            Existing references
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep your references up to date so we can reach them quickly.
          </p>

          {!references.length ? (
            <div className="mt-6 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 p-6 text-sm text-muted-foreground">
              No references added yet. Use the form above to add your first
              reference.
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {references.map((reference: ResumeReference) => (
                <ReferenceCard
                  key={reference.id || reference.name}
                  reference={reference}
                  applicationId={id}
                  redirectPath={referencesPath}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </ApplicantPublicLayout>
  )
}

function ReferenceCard({
  reference,
  applicationId,
  redirectPath,
}: {
  reference: ResumeReference
  applicationId: string
  redirectPath: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-semibold text-foreground">
            {reference.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {reference.position || "Role unknown"} ·{" "}
            {reference.company || "Company unknown"}
          </p>
        </div>
      </div>

      {reference?.id ? (
        <ReferenceForm
          reference={reference}
          applicationId={applicationId}
          redirectPath={redirectPath}
          formAction={updateResumeReferenceAction}
          submitLabel="Update reference"
          submitVariant="secondary"
        />
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          This reference came from your resume and can’t be edited yet because
          no unique identifier was provided.
        </p>
      )}
    </div>
  )
}
