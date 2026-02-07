"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { RefereeForm } from "@/components/applicant/applications/RefereeForm"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Resume, ResumeReferee } from "@/lib/applicant"
import type { RefereeActionState } from "@/lib/application/referee-actions"

interface EditRefereeDialogProps {
  referee: ResumeReferee
  applicationId: string
  redirectPath: string
  formAction: (
    prevState: RefereeActionState,
    formData: FormData,
  ) => Promise<RefereeActionState>
  resumePositions?: Resume["positions"]
  trigger?: ReactNode
}

export function EditRefereeDialog({
  referee,
  applicationId,
  redirectPath,
  formAction,
  resumePositions,
  trigger,
}: EditRefereeDialogProps) {
  const [open, setOpen] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  const handleDialogChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setResetKey((prev) => prev + 1)
    }
  }

  const handleSuccess = () => {
    setOpen(false)
    setResetKey((prev) => prev + 1)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="min-w-24">
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit referee</DialogTitle>
          <DialogDescription>
            Update this contact’s information so our team can reach them
            quickly.
          </DialogDescription>
        </DialogHeader>
        <RefereeForm
          applicationId={applicationId}
          redirectPath={redirectPath}
          referee={referee}
          formAction={formAction}
          submitLabel="Save Changes"
          onSuccess={handleSuccess}
          resetKey={resetKey}
          resumePositions={resumePositions}
        />
      </DialogContent>
    </Dialog>
  )
}
