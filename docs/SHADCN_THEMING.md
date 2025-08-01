# Shadcn UI Theming Integration Guide

## Overview

This guide explains how to integrate our custom theming system with Shadcn UI components, ensuring all current and future Shadcn components automatically work with our white-label theming system.

## How It Works

Our theming system generates **Shadcn-compatible CSS variables** directly from our theme configuration:
- `--primary`, `--background`, `--foreground`, etc.
- Plus extended colors: `--success`, `--warning`

This approach ensures:
- All existing Shadcn components work without modification
- Future Shadcn components will automatically inherit theming
- Simpler CSS with no duplicate variables
- Standard Shadcn naming conventions

## Variable Mapping

Our theme colors are mapped to Shadcn's standard variables:

| Our Theme Color | Shadcn Variable | Usage |
|----------------|-----------------|-------|
| `colors.primary` | `--primary` | Primary buttons, links, focus states |
| `colors.secondary` | `--secondary` | Secondary buttons, badges |
| `colors.accent` | `--accent` | Hover states, highlights |
| `colors.background` | `--background` | Page background |
| `colors.surface` | `--card`, `--muted` | Cards, surfaces, muted areas |
| `colors.text` | `--foreground`, `--card-foreground` | Text colors |
| `colors.textSecondary` | `--muted-foreground` | Secondary text |
| `colors.border` | `--border`, `--input` | Borders, input borders |
| `colors.error` | `--destructive` | Error states, destructive actions |
| `colors.success` | `--success` | Success states (extended) |
| `colors.warning` | `--warning` | Warning states (extended) |

## Usage Patterns

### For Existing Shadcn Components
No changes needed! Components like `Button`, `Card`, `Input` automatically use the theme:

```tsx
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// These automatically use the current theme
<Button>Primary Button</Button>
<Card>Themed Card</Card>
```

### For Custom Components
Use standard Shadcn variables for consistency:

```tsx
// ✅ Using Shadcn variables (recommended)
<div className="bg-background text-foreground border border-border">
  Content
</div>

// ✅ For extended colors not in standard Shadcn
<div className="bg-[var(--success)] text-white">
  Success message
</div>
<div className="bg-[var(--warning)] text-white">
  Warning message
</div>
```

### For New Shadcn Components
When adding new Shadcn components, they'll automatically work with theming:

```bash
# Add any new Shadcn component
pnpm dlx shadcn@latest add dialog

# The component will automatically use theme variables
import { Dialog } from "@/components/ui/dialog"
<Dialog>Automatically themed!</Dialog>
```

## Theme-Aware Component Examples

### Login Form with Theming
```tsx
import { useTheme } from "@/lib/theme"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function LoginForm() {
  const { currentTheme } = useTheme()
  
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <img 
          src={currentTheme.branding.logo.light} 
          alt={currentTheme.branding.companyName}
          className="h-8 w-auto dark:hidden"
        />
        <img 
          src={currentTheme.branding.logo.dark} 
          alt={currentTheme.branding.companyName}
          className="h-8 w-auto hidden dark:block"
        />
        <CardTitle>Welcome to {currentTheme.branding.companyName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button className="w-full">Sign In</Button>
      </CardContent>
    </Card>
  )
}
```

### Theme Toggle Integration
```tsx
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="bg-background border-b border-border">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-foreground">App Title</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline">Settings</Button>
        </div>
      </div>
    </header>
  )
}
```

## Best Practices

### 1. Use Shadcn Variables for Consistency
```tsx
// ✅ Good - Uses standard Shadcn variables
<div className="bg-card text-card-foreground border border-border">

// ❌ Avoid - Hardcoded colors
<div className="bg-white text-black border border-gray-200">
```

### 2. Theme-Aware Conditional Styling
```tsx
import { useTheme } from "@/lib/theme"

export function Component() {
  const { isDark, currentTheme } = useTheme()
  
  return (
    <div className={cn(
      "transition-colors",
      isDark ? "bg-card" : "bg-background"
    )}>
      <img 
        src={isDark ? currentTheme.branding.logo.dark : currentTheme.branding.logo.light}
        alt={currentTheme.branding.companyName}
      />
    </div>
  )
}
```

### 3. Custom Color Extensions
For colors not covered by Shadcn, use our custom variables:

```tsx
// For success, warning states
<div className="bg-[var(--color-success)] text-white">
  Success message
</div>

<div className="bg-[var(--color-warning)] text-white">
  Warning message
</div>
```

## Testing Themes

### 1. Test with Different Themes
```tsx
// Set theme via environment variable
NEXT_PUBLIC_THEME_ID=team-puzzle pnpm dev

// Or programmatically
const { setTheme } = useTheme()
setTheme('team-puzzle')
```

### 2. Test Light/Dark Modes
```tsx
const { setMode } = useTheme()
setMode('light')  // Test light mode
setMode('dark')   // Test dark mode
setMode('system') // Test system preference
```

## Troubleshooting

### Colors Not Updating
1. Ensure ThemeProvider wraps your app
2. Check that components use CSS variables, not hardcoded colors
3. Verify theme is properly loaded in browser dev tools

### New Shadcn Components Not Themed
1. Check if the component uses standard Shadcn variables
2. If not, consider customizing the component to use theme variables
3. Report any issues for future theme system updates

## Future Compatibility

This integration ensures:
- ✅ All current Shadcn components work with theming
- ✅ Future Shadcn components will automatically inherit theming
- ✅ White-label deployments work seamlessly
- ✅ Light/dark mode support is built-in
- ✅ Custom themes can be added without component changes
