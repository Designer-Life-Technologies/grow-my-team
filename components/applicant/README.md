# Applicant Components

This directory contains all components used in the public-facing applicant section of the application. These components are optimized for applicant experience, job discovery, and the application process.

## Directory Structure

The components are organized into three logical categories:

### `/positions`

Components for displaying open positions and position details.

**Components:**

- `PositionDetail.tsx` - Displays detailed information about a specific job position
- `PositionDetailSkeleton` - Loading skeleton for position details

**When to use:**

- Viewing job position listings
- Displaying job requirements, descriptions, and details
- Public-facing position pages

---

### `/applications`

Components for the complete job application process, from resume upload to submission.

**Components:**

- `PositionApply.tsx` - Main orchestrator for the application workflow
- `PositionApplySkeleton` - Loading skeleton for the application page
- `ApplicationForm.tsx` - Form for collecting applicant personal details
- `ResumeDropzone.tsx` - Drag-and-drop resume upload component
- `ScreeningQuestionsForm.tsx` - Form for answering screening questions
- `ApplicationSuccess.tsx` - Success message after application submission

**Application Flow:**

1. Resume upload (`ResumeDropzone`)
2. Personal details review (`ApplicationForm`)
3. Screening questions (`ScreeningQuestionsForm`)
4. Success confirmation (`ApplicationSuccess`)

**When to use:**

- Job application pages
- Resume upload functionality
- Multi-step application forms
- Application confirmation screens

---

### `/applicant`

Components related to applicant user interface and management.

**Components:**

- `ApplicantUserMenu.tsx` - User menu for authenticated applicants

**When to use:**

- Applicant-specific navigation
- Authenticated applicant UI elements
- Applicant profile management

---

## Usage

All components are exported through the main barrel export at `components/applicant/index.ts`. Import them using:

```typescript
import {
  PositionDetail,
  PositionApply,
  ApplicationForm,
  ApplicantUserMenu,
} from "@/components/applicant";
```

Or import from specific subdirectories:

```typescript
import { PositionDetail } from "@/components/applicant/positions";
import { ApplicationForm } from "@/components/applicant/applications";
import { ApplicantUserMenu } from "@/components/applicant/applicant";
```

## Component Guidelines

### Naming Conventions

- All component files use PascalCase (e.g., `PositionDetail.tsx`)
- Skeleton components are suffixed with `Skeleton` (e.g., `PositionDetailSkeleton`)
- Each subdirectory has an `index.ts` for named exports

### Organization Principles

- **Positions**: Components focused on displaying job listings and details
- **Applications**: Components involved in the application submission process
- **Applicant**: Components for applicant-specific functionality and UI

### Best Practices

1. Keep components focused on a single responsibility
2. Use TypeScript for all components with proper type definitions
3. Include JSDoc comments for complex components
4. Export components as named exports (not default exports)
5. Maintain consistent prop naming and patterns

## Related Documentation

- [Hooks Documentation](../../hooks/README.md) - Custom hooks used by these components
- [Applicant Actions](../../lib/applicant/actions.ts) - Server actions for applicant operations
- [Authentication](../../docs/NEXT_AUTH_SETUP.md) - Applicant authentication setup

## Adding New Components

When adding a new component to this directory:

1. Determine which category it belongs to (positions, applications, or applicant)
2. Create the component file in the appropriate subdirectory using PascalCase
3. Add the export to the subdirectory's `index.ts`
4. Update the main `components/applicant/index.ts` if needed
5. Update this README with component documentation
6. Follow the established patterns and conventions
