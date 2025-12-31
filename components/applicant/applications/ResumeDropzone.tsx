"use client"

import { type ChangeEvent, type DragEvent, useRef } from "react"

/**
 * ResumeDropzone Component
 *
 * Handles file upload via drag-and-drop or file browser.
 * Validates file type and size before accepting.
 *
 * Features:
 * - Drag and drop file upload
 * - Click to browse file upload
 * - File type validation (PDF, DOC, DOCX)
 * - File size validation (max 5MB)
 * - Visual feedback for drag states
 */

interface ResumeDropzoneProps {
  /**
   * Selected file (controlled component)
   */
  selectedFile: File | null
  /**
   * Callback when file is selected
   */
  onFileSelect: (file: File) => void
  /**
   * Callback when validation error occurs
   */
  onError: (error: string) => void
  /**
   * Whether the dropzone is in dragging state
   */
  isDragging: boolean
  /**
   * Callback when drag state changes
   */
  onDraggingChange: (isDragging: boolean) => void
}

export function ResumeDropzone({
  selectedFile,
  onFileSelect,
  onError,
  isDragging,
  onDraggingChange,
}: ResumeDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Accepted file types
  const acceptedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]
  const maxFileSize = 5 * 1024 * 1024 // 5MB

  /**
   * Validate file type and size
   */
  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return "Please upload a PDF, DOC, or DOCX file"
    }
    if (file.size > maxFileSize) {
      return "File size must be less than 5MB"
    }
    return null
  }

  /**
   * Handle file selection
   */
  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      onError(validationError)
      return
    }

    onError("") // Clear any previous errors
    onFileSelect(file)
  }

  /**
   * Handle drag events
   */
  const handleDragEnter = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onDraggingChange(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // Only set dragging to false if we're actually leaving the drop zone
    // Check if the related target is outside the current target
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      onDraggingChange(false)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onDraggingChange(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  /**
   * Handle file input change
   */
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  /**
   * Trigger file input click
   */
  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="Resume file input"
      />

      {/* Drop zone */}
      <button
        type="button"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={`
          relative flex min-h-64 w-full cursor-pointer flex-col items-center justify-center
          rounded-lg border-2 border-dashed p-8 transition-colors
          ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/50 hover:bg-accent/50"
          }
        `}
      >
        {selectedFile ? (
          // File selected state
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-8 w-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Document icon</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium">{selectedFile.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Click or drag to replace
            </p>
          </div>
        ) : (
          // Empty state
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-8 w-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Upload icon</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-lg font-medium">
              Drag and drop your resume here
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              or click to browse
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Supported formats: PDF, DOC, DOCX (max 5MB)
            </p>
          </div>
        )}
      </button>
    </>
  )
}
