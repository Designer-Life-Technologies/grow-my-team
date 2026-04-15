---
description: create a new white-label theme from supplied brand imagery
---

1. **Gather brand inputs**
   - Ask the user for all available assets: logo (SVG/PNG), favicon (if any), brand guidelines, and at least one screenshot/photo that captures the desired palette.
   - If no standalone logo exists, explicitly request one. Explain that it is required for both the ThemeProvider branding metadata and the favicon.
   - Confirm whether you are allowed to auto-generate favicons from the provided logo (requires ImageMagick `magick` CLI).

2. **Collect color references**
   - Save the provided imagery into a temporary location (`/tmp` or project `/public/themes/<working>/references/`).
   - Sample key colors (primary red, secondary dark, accent highlight, neutrals) using:
     - macOS Digital Color Meter, or
     - `magick convert input.png -format "%c" +dither -colors 8 histogram:info:-` to list dominant colors.
   - Define the Theme color slots:
     - `primary`, `secondary`, `accent`
     - `background`, `surface`, `border`
     - `text`, `textSecondary`
     - semantic `success`, `warning`, `error`
   - For dark mode, reuse hues but adjust lightness/contrast to keep WCAG-friendly contrast (~4.5:1 for text on backgrounds).

3. **Create the theme file**
   - Copy an existing theme (e.g., `lib/theme/themes/demo.ts`) as a reference.
   - Name the file `lib/theme/themes/<brand-id>.ts` (kebab-case) and export `<brandId>Theme`.
   - Populate `supportsDarkMode`, `colors.light`, `colors.dark`, and `branding` (companyName, logo paths, favicon, website).
   - Point `branding.logo.light/dark` to `/themes/<brand-id>/<asset>.png`. If logo not yet uploaded, add TODO comments and remind the user.

4. **Add assets**
   - Create `/public/themes/<brand-id>/`.
   - Place the provided logo(s) there and export additional sizes if needed. Always save the primary mark as `public/themes/<brand-id>/logo.png` (or `.svg`).
   - If a favicon was not supplied but the logo file now exists inside `public/themes/<brand-id>/`, auto-generate one (after user approval) directly from that file:
     ```bash
     # Example favicon generation (uses the already-uploaded logo)
     magick public/themes/<brand-id>/logo.png -resize 256x256 -background none -gravity center -extent 256x256 public/themes/<brand-id>/favicon.png
     magick public/themes/<brand-id>/favicon.png -define icon:auto-resize=64,48,32,16 public/themes/<brand-id>/favicon.ico
     ```
   - Update the theme file with the final asset filenames.

5. **Register the theme**
   - Edit `lib/theme/config.ts`:
     1. Import the new theme and add it to the `themes` map.
     2. Append alias strings (`brand`, `brandname`, `initials`, etc.) to `themeAliasEntries`.
     3. (Optional) Add domain mapping in `domainMap` if a dedicated hostname exists.
   - Update `components/theme/ThemeToggle.tsx` → `availableThemes` to include `{ id: "<brand-id>", name: "<Brand Name>" }` so the Theme Showcase lists it immediately.

6. **Verify in Theme Showcase**
   - Run `pnpm dev --port 3002` (or any free port) and open `http://localhost:3002/dev/theme-showcase`.
   - Select the new theme and toggle light/dark to confirm variables propagate (backgrounds, text, buttons, etc.).
   - Fix any contrast issues by adjusting palette values.

7. **Final hand-off**
   - Summarize the palette choices and asset paths for the user.
   - Mention how to activate the theme (env `NEXT_PUBLIC_THEME_ID`, domain alias, or Theme Selector).
   - If favicon/logo placeholders remain, remind the user to supply final assets.
