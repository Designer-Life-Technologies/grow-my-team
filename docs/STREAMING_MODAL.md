# Streaming Modal System

## Overview

The Streaming Modal system provides a globally accessible modal popup that displays real-time updates from long-running API operations. It's designed to keep users informed during operations like file processing, data imports, or any task that streams progress updates via Server-Sent Events (SSE).

## Features

- **Global Access**: Available from any component in the application via React Context
- **Real-time Updates**: Displays streaming events as they arrive from the API
- **Auto-scrolling**: Automatically scrolls to show the latest updates
- **Status Indicators**: Visual icons for different event types (info, success, error, loading)
- **Non-dismissible During Processing**: Prevents accidental closure while operations are in progress
- **Timestamps**: Each event is timestamped for reference
- **Clean UI**: Modern, accessible design using Radix UI Dialog

## Architecture

### Components

1. **Dialog** (`components/ui/dialog.tsx`)
   - Base dialog component built on Radix UI
   - Provides accessible modal functionality

2. **StreamingModal** (`components/ui/StreamingModal.tsx`)
   - Displays streaming events in a scrollable list
   - Handles visual presentation of events
   - Manages auto-scrolling behavior

3. **StreamingModalProvider** (`components/ui/StreamingModalProvider.tsx`)
   - React Context provider for global state management
   - Exposes `useStreamingModal` hook
   - Manages modal open/close state and event collection

4. **Streaming API Utilities** (`lib/api/streaming.ts`)
   - Server-side utilities for handling SSE connections
   - Provides `createStreamingConnection` and `processStreamingEvents` functions

## Usage

### Basic Example

```tsx
"use client"

import { useStreamingModal } from "@/components/ui/StreamingModalProvider"

export function MyComponent() {
  const { startStreaming, addEvent, completeStreaming, errorStreaming } = useStreamingModal()

  const handleLongRunningOperation = async () => {
    // Start the streaming modal
    startStreaming(
      "Processing Your File",
      "Please wait while we process your document..."
    )

    try {
      // Simulate streaming events
      addEvent("Uploading file...", "loading")
      await uploadFile()
      
      addEvent("File uploaded successfully", "success")
      addEvent("Analyzing content...", "loading")
      await analyzeContent()
      
      addEvent("Analysis complete", "success")
      addEvent("Generating report...", "loading")
      await generateReport()
      
      addEvent("Report generated successfully", "success")
      
      // Mark as complete
      completeStreaming()
    } catch (error) {
      // Handle errors
      errorStreaming(`Operation failed: ${error.message}`)
    }
  }

  return (
    <button onClick={handleLongRunningOperation}>
      Start Processing
    </button>
  )
}
```

### Using with Server-Sent Events (SSE)

For real API streaming, use the server-side utilities:

#### Server Action Example

```typescript
"use server"

import { processStreamingEvents } from "@/lib/api/streaming"

export async function processDocument(documentId: string) {
  // This function can be called from a client component
  // The streaming events will be handled by the callback
  
  const events: Array<{ type: string; message: string }> = []
  
  await processStreamingEvents(`/api/documents/${documentId}/process`, {
    method: "POST",
    onEvent: (event, data) => {
      // Parse the event data
      const parsedData = JSON.parse(data)
      events.push({
        type: event,
        message: parsedData.message,
      })
    },
    onComplete: () => {
      console.log("Processing complete")
    },
    onError: (error) => {
      console.error("Processing failed:", error)
    },
  })
  
  return events
}
```

#### Client Component with Server Action

```tsx
"use client"

import { useStreamingModal } from "@/components/ui/StreamingModalProvider"
import { processDocument } from "./actions"

export function DocumentProcessor({ documentId }: { documentId: string }) {
  const { startStreaming, addEvent, completeStreaming, errorStreaming } = useStreamingModal()

  const handleProcess = async () => {
    startStreaming("Processing Document", "Analyzing your document...")

    try {
      const events = await processDocument(documentId)
      
      // Display all events
      for (const event of events) {
        addEvent(event.message, event.type as any)
      }
      
      completeStreaming()
    } catch (error) {
      errorStreaming(`Failed to process document: ${error.message}`)
    }
  }

  return (
    <button onClick={handleProcess}>
      Process Document
    </button>
  )
}
```

### Advanced: Direct SSE Streaming

For more control over streaming, use the async generator:

```typescript
"use server"

import { createStreamingConnection } from "@/lib/api/streaming"

export async function* streamDocumentProcessing(documentId: string) {
  for await (const { event, data } of createStreamingConnection(
    `/api/documents/${documentId}/process`,
    { method: "POST" }
  )) {
    // Parse and yield events
    const parsedData = JSON.parse(data)
    yield {
      type: event,
      message: parsedData.message,
    }
  }
}
```

## API Reference

### `useStreamingModal` Hook

Returns an object with the following methods:

#### `startStreaming(title: string, description?: string): void`
Opens the modal and initializes a new streaming session.

- **title**: Modal title
- **description**: Optional description text

#### `addEvent(message: string, type?: "info" | "success" | "error" | "loading" | "progress"): void`
Adds a new event to the streaming modal.

- **message**: Event message to display
- **type**: Event type (default: "info")

#### `completeStreaming(): void`
Marks the streaming operation as complete. The modal can then be closed by the user.

#### `errorStreaming(message: string): void`
Adds an error event and marks the operation as complete.

- **message**: Error message to display

#### `clearEvents(): void`
Clears all events from the modal.

#### `isProcessing: boolean`
Whether a streaming operation is currently in progress.

#### `isOpen: boolean`
Whether the modal is currently open.

## Event Types

The `StreamingEvent<T>` interface is defined in `lib/types/streaming.ts` and supports both API streaming and UI display:

```typescript
interface StreamingEvent<T = unknown> {
  type: "info" | "success" | "error" | "progress" | "loading"
  message: string
  data?: T        // Optional data payload from the API
  id?: string     // Unique identifier (auto-generated by UI)
  timestamp?: Date // Timestamp (auto-generated by UI)
}
```

### `info`
- **Icon**: Blue alert circle
- **Use**: General information updates

### `success`
- **Icon**: Green check circle
- **Use**: Successful completion of steps

### `error`
- **Icon**: Red X circle
- **Use**: Error messages

### `loading`
- **Icon**: Blue spinning loader
- **Use**: Operations in progress

### `progress`
- **Icon**: Purple spinning loader
- **Use**: Progress updates from long-running operations

## API Streaming Format

The API should send Server-Sent Events in the following format:

```
event: info
data: {"message": "Starting process..."}

event: loading
data: {"message": "Processing file..."}

event: success
data: {"message": "File processed successfully"}

event: error
data: {"message": "An error occurred"}
```

### SSE Message Structure

- **event**: Event type (info, success, error, loading, or custom)
- **data**: JSON string containing event data
  - **message**: Required. The message to display

## Best Practices

1. **Always handle errors**: Use `errorStreaming()` in catch blocks to inform users of failures

2. **Provide meaningful messages**: Make event messages descriptive and user-friendly

3. **Use appropriate event types**: Choose the right event type for visual clarity

4. **Don't forget to complete**: Always call `completeStreaming()` or `errorStreaming()` when done

5. **Keep messages concise**: The modal has limited space, keep messages brief

6. **Test error scenarios**: Ensure error handling works correctly

## Example: File Upload with Processing

```tsx
"use client"

import { useStreamingModal } from "@/components/ui/StreamingModalProvider"
import { processResume } from "@/lib/candidate/actions"

export function ResumeUploader() {
  const { startStreaming, addEvent, completeStreaming, errorStreaming } = useStreamingModal()

  const handleUpload = async (file: File) => {
    startStreaming(
      "Processing Resume",
      "Uploading and analyzing your resume..."
    )

    try {
      // Upload file
      addEvent("Uploading resume...", "loading")
      const uploadResult = await uploadFile(file)
      addEvent(`Resume uploaded: ${file.name}`, "success")

      // Process resume
      addEvent("Extracting information...", "loading")
      const result = await processResume(uploadResult.id)
      
      addEvent("Personal information extracted", "success")
      addEvent("Work experience parsed", "success")
      addEvent("Skills identified", "success")
      addEvent("Education history processed", "success")

      // Complete
      addEvent("Resume processing complete!", "success")
      completeStreaming()
      
      // Navigate or update UI
      router.push(`/candidate/profile/${result.candidateId}`)
    } catch (error) {
      errorStreaming(
        error instanceof Error 
          ? error.message 
          : "Failed to process resume"
      )
    }
  }

  return (
    <ResumeDropzone onFileSelect={handleUpload} />
  )
}
```

## Troubleshooting

### Modal doesn't appear
- Ensure `StreamingModalProvider` is in your app layout
- Check that you're calling `startStreaming()` before adding events

### Events not displaying
- Verify you're calling `addEvent()` after `startStreaming()`
- Check browser console for errors

### Modal won't close
- Ensure you've called `completeStreaming()` or `errorStreaming()`
- The modal is designed to prevent closure during processing

### SSE connection fails
- Verify the API endpoint supports Server-Sent Events
- Check authentication token is valid
- Ensure proper CORS headers if needed

## Integration Checklist

- [x] `StreamingModalProvider` added to root layout
- [x] Dialog component created
- [x] StreamingModal component created
- [x] Streaming API utilities created
- [x] Documentation completed

## Related Files

- `lib/types/streaming.ts` - Generic StreamingEvent type definition
- `components/ui/dialog.tsx` - Base dialog component
- `components/ui/StreamingModal.tsx` - Modal display component
- `components/ui/StreamingModalProvider.tsx` - Context provider
- `lib/api/streaming.ts` - Server-side streaming utilities
- `app/layout.tsx` - Provider integration

## Future Enhancements

Potential improvements for future iterations:

- Progress bar support
- Collapsible event groups
- Export event log functionality
- Custom event styling
- Sound notifications
- Multiple concurrent streams
