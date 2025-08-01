# Theming Guide - Grow My Team

## Overview

Grow My Team supports comprehensive white labeling through a flexible theming system. You can create custom themes for different clients or environments while maintaining full light/dark mode support.

## Creating a New Theme

### Method 1: Environment Variable Theme Selection

1. **Set the theme ID in your environment:**
   ```bash
   # .env.local
   NEXT_PUBLIC_THEME_ID=team-puzzle
   ```

2. **Create theme configuration:**
   ```typescript
   // lib/theme/themes/team-puzzle.ts
   import { Theme } from '../types';
   
   export const teamPuzzleTheme: Theme = {
     id: 'team-puzzle',
     name: 'Team Puzzle',
     colors: {
       light: {
         primary: '#FF6B35',
         secondary: '#004E89',
         accent: '#009FFD',
         background: '#FFFFFF',
         surface: '#F8F9FA',
         text: '#1A1A1A',
         textSecondary: '#6B7280',
         border: '#E5E7EB',
         success: '#10B981',
         warning: '#F59E0B',
         error: '#EF4444'
       },
       dark: {
         primary: '#FF8A65',
         secondary: '#42A5F5',
         accent: '#26C6DA',
         background: '#0F172A',
         surface: '#1E293B',
         text: '#F8FAFC',
         textSecondary: '#94A3B8',
         border: '#334155',
         success: '#34D399',
         warning: '#FBBF24',
         error: '#F87171'
       }
     },
     branding: {
       companyName: 'Team Puzzle',
       logo: {
         light: '/themes/team-puzzle/logo-light.svg',
         dark: '/themes/team-puzzle/logo-dark.svg'
       },
       favicon: '/themes/team-puzzle/favicon.ico'
     }
   };
   ```

3. **Register the theme:**
   ```typescript
   // lib/theme/config.ts
   import { teamPuzzleTheme } from './themes/team-puzzle';
   
   export const themes = {
     default: defaultTheme,
     'team-puzzle': teamPuzzleTheme,
     // Add more themes here
   };
   ```

### Method 2: Runtime Theme Switching

```typescript
// In your component
import { useTheme } from '@/lib/theme/ThemeProvider';

function ThemeSwitcher() {
  const { setTheme, currentTheme } = useTheme();
  
  return (
    <select 
      value={currentTheme.id} 
      onChange={(e) => setTheme(e.target.value)}
    >
      <option value="default">Default</option>
      <option value="team-puzzle">Team Puzzle</option>
      <option value="client-beta">Beta Industries</option>
    </select>
  );
}
```

## Theme Structure

```typescript
interface Theme {
  id: string;
  name: string;
  colors: {
    light: ColorPalette;
    dark: ColorPalette;
  };
  branding: {
    companyName: string;
    logo: {
      light: string;
      dark: string;
    };
    favicon?: string;
  };
}
```

## Deployment Strategies

### Single-Tenant Deployment
```bash
# Deploy with specific theme
NEXT_PUBLIC_THEME_ID=team-puzzle pnpm build
```

### Multi-Tenant Deployment
```typescript
// Detect theme from subdomain or domain
const getThemeFromDomain = (hostname: string): string => {
  if (hostname.includes('puzzle')) return 'team-puzzle';
  if (hostname.includes('beta')) return 'client-beta';
  return 'default';
};
```

## Asset Management

1. **Create theme-specific asset folders:**
   ```
   public/
   ├── themes/
   │   ├── team-puzzle/
   │   │   ├── logo-light.svg
   │   │   ├── logo-dark.svg
   │   │   └── favicon.ico
   │   └── beta/
   │       ├── logo-light.svg
   │       ├── logo-dark.svg
   │       └── favicon.ico
   ```

2. **Dynamic asset loading:**
   ```typescript
   const { currentTheme } = useTheme();
   const logoSrc = currentTheme.branding.logo.light;
   ```

## Best Practices

- **Color Accessibility**: Ensure sufficient contrast ratios for both light and dark modes
- **Asset Optimization**: Use SVG logos for scalability and smaller file sizes
- **Theme Testing**: Test all themes in both light and dark modes
- **Fallback Handling**: Always provide fallback values for missing theme properties
- **Performance**: Consider lazy loading theme assets for better performance

## Quick Start

For a quick overview of the theming system and how to get started, refer to the main [README.md](../README.md) file.