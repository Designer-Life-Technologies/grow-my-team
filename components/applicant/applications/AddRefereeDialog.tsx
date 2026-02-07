"use client"

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
import type { Resume } from "@/lib/applicant"
import type { RefereeActionState } from "@/lib/application/referee-actions"

interface AddRefereeDialogProps {
  applicationId: string
  redirectPath: string
  formAction: (
    prevState: RefereeActionState,
    formData: FormData,
  ) => Promise<RefereeActionState>
  resumePositions?: Resume["positions"]
}

export function AddRefereeDialog({
  applicationId,
  redirectPath,
  formAction,
  resumePositions,
}: AddRefereeDialogProps) {
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)

  const handleDialogChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setFormKey((prev) => prev + 1)
    }
  }

  const handleSuccess = () => {
    setOpen(false)
    setFormKey((prev) => prev + 1)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button className="mt-4 min-w-[160px]">Add Referee</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a New Referee</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <RefereeForm
          key={formKey}
          applicationId={applicationId}
          redirectPath={redirectPath}
          formAction={formAction}
          submitLabel="Save Referee"
          onSuccess={handleSuccess}
          resumePositions={resumePositions}
        />
      </DialogContent>
    </Dialog>
  )
}
