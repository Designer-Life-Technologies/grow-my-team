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

**client_themes** — White-label theme configurations:

- `client_slug` — Subdomain identifier
- `organisation_id` — GetMe.video API org mapping (future)
- `custom_domain` — Future white-label domains
- `colors` (JSONB) — Light/dark color palettes
- `logo_url`, `favicon_url` — Vercel Blob URLs
- `is_active` — Soft delete flag

**Indexes:**

- `client_slug` — Theme lookup
- `organisation_id` — Org-based resolution
- `custom_domain` — Domain-based resolution
- `is_active` — Active themes only (partial index)

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
