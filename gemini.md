# Project Context
- **Name**: Grow My Team
- **Description**: White-label SaaS platform for recruitment.
- **Type**: Next.js Web Application (App Router)

# Technology Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Vanilla CSS for basic states
- **Animations**: Framer Motion (complex/layout), CSS (simple hover/focus)
- **UI Components**: shadcn/ui patterns, Radix UI phrases
- **State Management**: React Hooks, Context API (server state via server components/actions)
- **Database/ORM**: (Inferred) Prisma or similar if applicable, else generic
- **Linting/Formatting**: Biome (`biome.jsonc`)
- **Testing**: Playwright (E2E)
- **Package Manager**: pnpm

# Coding Conventions
- **Component Style**: Functional components. Use `interface` for props.
- **Imports**: Use absolute paths (`@/components/...`) where possible.
- **Server Components**: Default to Server Components. Use `'use client'` only when necessary (interactive hooks, event listeners).
- **Styling**: Use standard Tailwind classes. Avoid `@apply` in CSS modules unless necessary for complex reusable patterns.
- **Async/Await**: Prefer `async/await` over `.then()`.
- **Formatting**: Run `pnpm format` (Biome) on changed files.

# Design & Aesthetics
- **Visual Style**: Premium, clean, modern. "Wow" factor is important.
- **Micro-Interactions**: Use Framer Motion for smooth entry/exit and layout shifts.
- **Responsiveness**: Mobile-first design.
- **Theming**: Support Dark/Light mode using standard CSS variables or Tailwind classes (e.g. `dark:bg-slate-900`).

# Workflow
- **Package Installation**: Use `pnpm add`.
- **Dev Server**: `pnpm dev`.
- **Testing**: `pnpm test:e2e`.
