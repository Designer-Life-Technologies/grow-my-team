"use client"

import type { ChangeEvent, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ScreeningQuestionsData } from "@/lib/candidate/types"

/**
 * ScreeningQuestionsForm Component
 *
 * Form for collecting candidate's responses to screening questions.
 * Displays 5 text area fields for detailed answers.
 *
 * Features:
 * - Controlled form inputs
 * - Multi-line text areas for detailed responses
 * - Back navigation
 * - Form validation
 */

interface Question {
  id: keyof ScreeningQuestionsData
  label: string
  placeholder?: string
}

// Array of screening questions
export const SCREENING_QUESTIONS: Question[] = [
  {
    id: "q1",
    label:
      "How would your best friend describe your personality and qualities as a person?",
  },
  {
    id: "q2",
    label:
      "Please describe how you have effectively worked with policies and procedures and how you have managed to improve your workplace.",
  },
  {
    id: "q3",
    label:
      "What skills do you possess that are ideally suited to this position, and how do you see yourself adapting to our business?",
  },
  {
    id: "q4",
    label:
      "Describe your ideal work environment and include your views on how a business can best support its employees?",
  },
  {
    id: "q5",
    label:
      "What are your expectations of your employer and what have you found frustrating in other businesses you have worked in?",
  },
]

interface ScreeningQuestionsFormProps {
  /**
   * Form data (controlled component)
   */
  formData: ScreeningQuestionsData
  /**
   * Callback when form data changes
   */
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  /**
   * Callback when form is submitted
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
}

export function ScreeningQuestionsForm({
  formData,
  onChange,
  onSubmit,
  onBack,
  isSubmitting = false,
}: ScreeningQuestionsFormProps) {
  // Validate that all required fields are filled
  const isFormValid = Object.values(formData).every(
    (value) => value.trim() !== "",
  )

  return (
    <div className="mt-8 animate-in fade-in duration-500">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold">Initial Questions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Please answer the following questions to help us understand your fit
          for this role
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-6">
          {SCREENING_QUESTIONS.map((question) => (
            <div key={question.id} className="space-y-2">
              <Label htmlFor={question.id}>
                {question.label} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id={question.id}
                name={question.id}
                value={formData[question.id]}
                onChange={onChange}
                placeholder={question.placeholder}
                rows={4}
                className="resize-none"
                required
              />
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button type="submit" disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Next"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
