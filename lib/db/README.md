# Database Layer

**Vercel Postgres (Neon)** + Lightweight Migration System

## Structure

```
lib/db/
  client.ts              # Connection pool
  themes.ts              # Theme CRUD operations
  migrate.ts             # Migration runner
  migrations/
    001_create_client_themes.sql
```

## Migrations

**Convention:** `XXX_description.sql` where XXX is a sequential number.

**Commands:**

```bash
# Run pending migrations
pnpm db:migrate

# Check status
pnpm db:migrate:status
```

**Migrations Table:** `schema_migrations` tracks applied migrations by ID.

## Database Schema

## Tables

### client_settings

Stores white-label theme configurations and client-specific settings for multi-tenant deployment.

| Column             | Type         | Description                                                     |
| ------------------ | ------------ | --------------------------------------------------------------- |
| id                 | UUID         | Primary key                                                     |
| client_slug        | VARCHAR(255) | URL-friendly identifier used as subdomain (e.g., virgin-active) |
| name               | VARCHAR(255) | Display name of the client/theme                                |
| company_name       | VARCHAR(255) | Company name for branding                                       |
| organisation_id    | VARCHAR(255) | GetMe.video API organisation ID for tenant data isolation       |
| custom_domain      | VARCHAR(255) | Custom domain for white-label (e.g., careers.virginactive.com)  |
| colors             | JSONB        | JSON containing light and dark mode color palettes              |
| logo_url           | TEXT         | URL to client logo                                              |
| favicon_url        | TEXT         | URL to client favicon                                           |
| website            | TEXT         | Client website URL                                              |
| logo_width         | INTEGER      | Logo width in pixels (optional)                                 |
| supports_dark_mode | BOOLEAN      | Whether the theme supports dark mode                            |
| gmt_api_endpoint   | VARCHAR(500) | Client-specific GetMe.video API endpoint                        |
| settings           | JSONB        | Additional client-specific settings                             |
| is_active          | BOOLEAN      | Whether the theme is active                                     |
| created_at         | TIMESTAMP    | Creation timestamp                                              |
| updated_at         | TIMESTAMP    | Last update timestamp                                           |

### Indexes

- `idx_client_settings_client_slug` on `client_slug`
- `idx_client_settings_organisation_id` on `organisation_id`
- `idx_client_settings_custom_domain` on `custom_domain`
- `idx_client_settings_active` on `is_active` (partial index for active themes)

## Functions

### getThemeBySlug(slug)

Retrieves a theme by its client slug (subdomain identifier).

### getThemeByCustomDomain(domain)

Retrieves a theme by its custom domain.

### createTheme(input)

Creates a new client theme.

### updateTheme(slug, input)

Updates an existing theme.

### deactivateTheme(slug)

Soft deletes a theme by setting `is_active = false`.

### listThemes(includeInactive)

Lists all themes, optionally including inactive ones.

## Usage

```typescript
import { createTheme, getThemeBySlug } from '@/lib/db/themes';

// Create theme
const theme = await createTheme({
  clientSlug: 'virgin-active',
  name: 'Virgin Active',
  colors: { light: {...}, dark: {...} },
});

// Fetch theme
const theme = await getThemeBySlug('virgin-active');
```

## Environment

Connection string resolved from:

- `production` → `POSTGRES_URL_PROD` or `POSTGRES_URL`
- `preview` → `POSTGRES_URL`
- `development` → `POSTGRES_URL_DEV` or `POSTGRES_URL`

---

## Theme Migration

**Migrate existing file-based themes to database + Blob:**

```bash
# Preview (dry run)
pnpm migrate:themes

# Actually migrate
pnpm migrate:themes --apply
```

**What it does:**

1. Uploads logos/favicons to Vercel Blob
2. Creates theme records in database

**Themes migrated:**

- `default` — Grow My Team
- `demo` — Demo Client
- `virgin` — Virgin Active
- `shr` — Strategic HR
- `team-puzzle` — Team Puzzle
- `placement-partner` — Placement Partner

---

## Public Theme API (Phase 4)

**Cached API endpoints for fetching themes:**

```
GET /api/themes           # List all active themes
GET /api/themes/[slug]    # Get specific theme data
```

**Response example:**

```json
{
  "id": "virgin",
  "name": "Virgin Active",
  "supportsDarkMode": true,
  "colors": { "light": {...}, "dark": {...} },
  "branding": {
    "companyName": "Virgin Active",
    "logo": { "light": "https://.../logo.png", "dark": "...", "width": 110 },
    "favicon": "https://.../favicon.ico",
    "website": "https://www.virginactive.com"
  }
}
```

**Caching:**

- Next.js `unstable_cache`: 1 hour
- CDN `Cache-Control`: 1 hour + stale-while-revalidate 24h

---

## Dynamic Theme Loading (Phase 5)

**Server-side theme resolution with fallback:**

```
GET /api/themes/[slug]
   ↓
lib/theme/resolver.ts
   ↓
Priority: query → subdomain → database → file
```

**Theme Resolution Priority:**

1. **Query param** (`?theme=virgin`) — Preview mode
2. **Subdomain** (`virgin.growmyteam.io`) — Auto-detect from host
3. **Custom domain** (future) — `custom_domain` column
4. **Database** — Cached DB theme
5. **File** — Fallback to file-based themes

**Preview Badge:**

When using dynamic themes (query, subdomain, database), a badge appears bottom-right:

- Shows theme ID and source
- Helps debug which theme is active
- Only visible in non-production or when source is dynamic

**Usage:**

```bash
# Preview any theme via query param
http://localhost:3002?theme=virgin

# Test subdomain locally (edit /etc/hosts)
127.0.0.1 virgin.localhost
# Then visit: http://virgin.localhost:3002
```
