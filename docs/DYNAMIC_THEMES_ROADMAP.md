# Dynamic Themes Implementation Roadmap

Multi-tenant white-label theme system using Vercel Postgres + Blob with API proxy for external admin app.

---

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   AWS Admin     │────▶│  Vercel API     │────▶│  Vercel Blob    │
│   App (future)  │     │  /api/admin/*   │     │  (logos/fav)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  Vercel Postgres│
                        │  client_themes  │
                        └─────────────────┘
                               │
                               ▼
┌─────────────────┐     ┌─────────────────┐
│   Public App    │◄────│  Theme Resolver │
│   (applicants)  │     │  subdomain/     │
│                 │     │  ?theme= param  │
└─────────────────┘     └─────────────────┘
```

**Theme Resolution Priority:**

1. `?theme=virgin-active` → localStorage persistence (preview mode)
2. `virgin-active.growmy.team` → DB lookup by subdomain → get `organisationId` → call GetMe.video API
3. Custom domain `careers.virginactive.com` → DB lookup (future feature)
4. Fallback → default theme

**Future Flow:** Subdomain/Custom domain maps to `organisationId`, which identifies the organisation in GetMe.video API for tenant-specific data.

---

## Phase 1: Infrastructure Setup

**Goal:** Provision Vercel storage and install SDKs

### 1.1 Provision Storage

```bash
# Production database
vercel postgres create grow-my-team-db-prod --environment=production

# Development database
vercel postgres create grow-my-team-db-dev --environment=development

# Blob store (single, path-separated by env)
vercel blob create grow-my-team-assets
```

### 1.2 Install Dependencies

```bash
pnpm add @vercel/postgres @vercel/blob
```

### 1.3 Environment Variables

Vercel auto-injects:

- `POSTGRES_URL` / `POSTGRES_URL_PROD` / `POSTGRES_URL_DEV`
- `BLOB_READ_WRITE_TOKEN`

Manual addition:

- `ADMIN_API_KEY` - Shared secret for AWS admin app

**Status:** ⏳ Not started

---

## Phase 2: Database Schema

**Goal:** Create `client_themes` table and migration script

### 2.1 Schema Definition

```sql
CREATE TABLE client_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug VARCHAR(255) UNIQUE NOT NULL,      -- 'virgin-active' (subdomain)
  name VARCHAR(255) NOT NULL,                    -- 'Virgin Active' (display)
  company_name VARCHAR(255),
  organisation_id VARCHAR(255),                  -- GetMe.video API org ID (future: maps subdomain to org)
  custom_domain VARCHAR(255) UNIQUE,               -- 'careers.virginactive.com' (future feature)
  colors JSONB NOT NULL,                         -- { light: {...}, dark: {...} }
  logo_url TEXT,
  favicon_url TEXT,
  website TEXT,
  supports_dark_mode BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_client_slug ON client_themes(client_slug);
CREATE INDEX idx_organisation_id ON client_themes(organisation_id);
CREATE INDEX idx_custom_domain ON client_themes(custom_domain);
CREATE INDEX idx_active ON client_themes(is_active) WHERE is_active = true;
```

### 2.2 Migration Script

Migrate existing static themes (`lib/theme/themes/*.ts`) to database:

- Extract colors, branding from TypeScript files
- Upload logos to Blob with env prefix (`prod/`, `dev/`)
- Insert records into `client_themes`

**Status:** ⏳ Not started

---

## Phase 3: Admin API (for AWS App)

**Goal:** API endpoints for external admin app to manage themes

### 3.1 Authentication Middleware

```typescript
// lib/admin/auth.ts
export function verifyAdminApiKey(request: Request): boolean {
  const apiKey = request.headers.get("X-Admin-API-Key");
  return apiKey === process.env.ADMIN_API_KEY;
}
```

### 3.2 Admin Endpoints

| Method | Endpoint                  | Description                       |
| ------ | ------------------------- | --------------------------------- |
| POST   | `/api/admin/themes`       | Create new theme                  |
| PUT    | `/api/admin/themes/:slug` | Update theme                      |
| DELETE | `/api/admin/themes/:slug` | Soft delete (set is_active=false) |
| GET    | `/api/admin/themes`       | List all themes                   |
| GET    | `/api/admin/themes/:slug` | Get single theme                  |

### 3.3 Create Theme Payload

```typescript
{
  clientSlug: "virgin-active",
  name: "Virgin Active",
  companyName: "Virgin Active Limited",
  organisationId: "virgin-active-org-123",      // GetMe.video API organisation ID
  customDomain: "careers.virginactive.com",       // Future: custom domain (optional)
  colors: {
    light: { primary: "#E11931", secondary: "#B3121D", ... },
    dark: { primary: "#FF3D57", ... }
  },
  logoBase64: "data:image/png;base64,...",  // optional
  faviconBase64: "data:image/png;base64,...", // optional
  website: "https://www.virginactive.com"
}
```

**Status:** ⏳ Not started

---

## Phase 4: Public Theme API

**Goal:** Read-only theme resolution for applicant-facing app

### 4.1 Theme Resolution Endpoint

```typescript
// app/api/themes/[slug]/route.ts
// GET /api/themes/virgin-active
// Returns: { id, name, colors, logoUrl, faviconUrl, ... }
```

### 4.2 Database Client

```typescript
// lib/db/themes.ts
import { sql } from "@vercel/postgres";

export async function getThemeBySlug(slug: string) {
  const result = await sql`
    SELECT * FROM client_themes 
    WHERE client_slug = ${slug} AND is_active = true
  `;
  return result.rows[0];
}
```

**Status:** ⏳ Not started

---

## Phase 5: Dynamic Theme Loader

**Goal:** Client-side theme resolution with subdomain + query param support

### 5.1 Middleware Setup

```typescript
// middleware.ts
// Extract subdomain and theme override, add to headers
```

### 5.2 Theme Resolution Hook

```typescript
// lib/theme/dynamic.ts
export async function resolveTheme(): Promise<Theme> {
  // 1. Check URL param ?theme=
  // 2. Persist to localStorage
  // 3. Check subdomain from header
  // 4. Fetch from /api/themes/[slug]
  // 5. Fallback to default
}
```

### 5.3 Preview Badge Component

```typescript
// components/theme/ThemePreviewBadge.tsx
// Shows when ?theme= override active
// Click to clear localStorage and reload
```

**Status:** ⏳ Not started

---

## Phase 6: Migration & Testing

**Goal:** Migrate existing themes, verify end-to-end

### 6.1 Migration Checklist

- [ ] Run schema migration
- [ ] Execute theme migration script
- [ ] Verify Blob URLs accessible
- [ ] Test subdomain resolution
- [ ] Test query param override
- [ ] Test preview badge
- [ ] Verify AWS API integration (mock)

### 6.2 Test Scenarios

| Scenario     | URL                           | Expected Theme               |
| ------------ | ----------------------------- | ---------------------------- |
| Subdomain    | `virgin-active.growmy.team`   | Virgin Active                |
| Query param  | `growmy.team?t=virgin-active` | Virgin Active + localStorage |
| Fallback     | `growmy.team`                 | Default                      |
| Invalid slug | `invalid.growmy.team`         | Default                      |

**Status:** ⏳ Not started

---

## Phase 7: AWS Integration

**Goal:** Document API for external AWS admin app

### 7.1 API Documentation

```bash
# Create theme
curl -X POST https://grow-my-team.vercel.app/api/admin/themes \
  -H "X-Admin-API-Key: $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### 7.2 SDK/Client Library (optional)

Publish small npm package for AWS app:

```typescript
import { ThemeAdminClient } from "@growmyteam/theme-admin";

const client = new ThemeAdminClient({ apiKey, baseUrl });
await client.createTheme({ clientSlug, name, colors, logoBase64 });
```

**Status:** ⏳ Not started (future phase)

---

## Quick Reference

### Branch

`feature/dynamic-themes` (created from `uat`)

### Key Files (to be created)

- `lib/db/schema.sql` - Database schema
- `lib/db/themes.ts` - Database queries
- `lib/blob/assets.ts` - Blob upload utilities
- `app/api/admin/themes/route.ts` - Admin API
- `app/api/themes/[slug]/route.ts` - Public API
- `lib/theme/dynamic.ts` - Dynamic resolution
- `scripts/migrate-themes.ts` - Migration script

### Environment Variables Required

```
POSTGRES_URL                    # Auto-injected
POSTGRES_URL_PROD              # Auto-injected
POSTGRES_URL_DEV               # Auto-injected
BLOB_READ_WRITE_TOKEN          # Auto-injected
ADMIN_API_KEY                  # Manual: shared with AWS app
VERCEL_ENV                     # Auto-injected (production/preview/development)
```

---

## Decision Log

| Date       | Decision                             | Rationale                                    |
| ---------- | ------------------------------------ | -------------------------------------------- |
| 2025-04-23 | Vercel Postgres + Blob               | Native integration, serverless-friendly      |
| 2025-04-23 | Separate prod/dev databases          | Isolation, safe migrations                   |
| 2025-04-23 | API proxy for AWS app                | Security, centralized auth                   |
| 2025-04-23 | Subdomain + query param resolution   | White-label + preview flexibility            |
| 2025-04-23 | localStorage for preview persistence | UX, survives refresh                         |
| 2025-04-23 | Add `organisationId` field           | Future: map subdomain to GetMe.video API org |
| 2025-04-23 | Add `customDomain` field             | Future: support custom domain white-labeling |

---

## Next Steps

1. **Provision Vercel storage** (Phase 1)
2. **Install SDKs** (Phase 1)
3. **Create schema** (Phase 2)
4. **Build admin API** (Phase 3)

Return to this document when resuming work.
