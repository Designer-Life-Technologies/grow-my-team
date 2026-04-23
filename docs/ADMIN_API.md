# Admin API Integration Guide

This guide explains how to integrate with the Grow My Team Admin API for theme management from the AWS app.

## Base URL

```
https://your-domain.com/api/admin
```

## Authentication

**Note:** Authentication is not currently implemented. The admin endpoints are publicly accessible. Before production deployment, implement authentication to protect these endpoints.

Recommended authentication methods:
- API key in header: `Authorization: Bearer <api-key>`
- JWT token from admin session
- IP whitelist for AWS app servers

## Endpoints

### List All Themes

**Endpoint:** `GET /api/admin/themes`

**Description:** Get a list of all themes, including inactive ones.

**Response:**
```json
{
  "themes": [
    {
      "id": "string",
      "client_slug": "string",
      "name": "string",
      "company_name": "string",
      "logo_url": "string | null",
      "favicon_url": "string | null",
      "logo_width": "number",
      "website": "string | null",
      "colors": {
        "light": { ... },
        "dark": { ... }
      },
      "supports_dark_mode": "boolean",
      "is_active": "boolean"
    }
  ]
}
```

**Example:**
```bash
curl https://your-domain.com/api/admin/themes
```

---

### Create Theme

**Endpoint:** `POST /api/admin/themes`

**Description:** Create a new theme with optional asset uploads.

**Request Body:**
```typescript
{
  slug: string              // Required: Unique identifier (e.g., "acme-corp")
  name: string             // Required: Display name
  companyName: string      // Required: Company name for branding
  website?: string         // Optional: Company website URL
  colors?: {               // Optional: Color palettes
    light: {
      primary: string      // Required hex color
      secondary?: string
      accent?: string
      background?: string
      surface?: string
      text?: string
      textSecondary?: string
      border?: string
      success?: string
      warning?: string
      error?: string
    }
    dark: { ... }          // Same structure as light
  }
  logoBase64?: string      // Optional: Base64-encoded PNG logo
  faviconBase64?: string   // Optional: Base64-encoded ICO favicon
  logoWidth?: number       // Optional: Logo width in pixels (default: 110)
  supportsDarkMode?: boolean // Optional: Enable dark mode (default: true)
}
```

**Response:**
```json
{
  "theme": {
    "id": "string",
    "client_slug": "string",
    "name": "string",
    "company_name": "string",
    "logo_url": "string",
    "favicon_url": "string",
    "logo_width": "number",
    "website": "string",
    "colors": { ... },
    "supports_dark_mode": "boolean",
    "is_active": "true"
  }
}
```

**Status Codes:**
- `201` - Theme created successfully
- `400` - Invalid request body
- `500` - Server error

**Example:**
```bash
curl -X POST https://your-domain.com/api/admin/themes \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "acme-corp",
    "name": "Acme Corporation",
    "companyName": "Acme Corporation",
    "website": "https://acme.com",
    "logoBase64": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "logoWidth": 200,
    "colors": {
      "light": {
        "primary": "#0066cc",
        "secondary": "#004499"
      },
      "dark": {
        "primary": "#3399ff",
        "secondary": "#0066cc"
      }
    }
  }'
```

---

### Update Theme

**Endpoint:** `PUT /api/admin/themes/[slug]`

**Description:** Update an existing theme. Only provided fields are updated.

**Request Body:** Same as create theme, but all fields are optional.

**Response:** Same as create theme.

**Status Codes:**
- `200` - Theme updated successfully
- `400` - Invalid request body
- `404` - Theme not found
- `500` - Server error

**Example:**
```bash
curl -X PUT https://your-domain.com/api/admin/themes/acme-corp \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "logoBase64": "data:image/png;base64,iVBORw0KGgoAAAANS..."
  }'
```

---

### Delete Theme

**Endpoint:** `DELETE /api/admin/themes/[slug]`

**Description:** Soft delete a theme (sets `is_active = false`). The theme is not permanently removed from the database.

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- `200` - Theme deleted successfully
- `404` - Theme not found
- `500` - Server error

**Example:**
```bash
curl -X DELETE https://your-domain.com/api/admin/themes/acme-corp
```

---

## Asset Upload Guidelines

### Logo
- **Format:** PNG
- **Recommended size:** 200px width (adjustable via `logoWidth` parameter)
- **Background:** Transparent or white
- **Encoding:** Base64 data URL (`data:image/png;base64,...`)

### Favicon
- **Format:** ICO
- **Size:** 16x16, 32x32, or 48x48 pixels
- **Encoding:** Base64 data URL (`data:image/x-icon;base64,...`)

### Base64 Encoding Example (JavaScript)
```javascript
// Convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

// Usage
const base64Logo = await fileToBase64(logoFile)
```

---

## Color Palette Reference

### Required Colors
- `primary` - Main brand color (buttons, links, highlights)
- `secondary` - Secondary brand color (hover states, accents)

### Optional Colors
If not provided, these default to sensible values:
- `accent` - Accent color for highlights
- `background` - Page background
- `surface` - Card/surface background
- `text` - Primary text color
- `textSecondary` - Secondary text color
- `border` - Border and divider color
- `success` - Success state color
- `warning` - Warning state color
- `error` - Error state color

### Light vs Dark Mode
Both `light` and `dark` palettes must follow the same structure. Dark mode colors should be inverted for better contrast on dark backgrounds.

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional details (validation errors)"
}
```

**Common Errors:**
- `400 Bad Request` - Invalid request body, validation failed
- `404 Not Found` - Theme does not exist
- `500 Internal Server Error` - Server error, check logs

---

## Cache Invalidation

Theme data is cached for 1 hour. After creating, updating, or deleting a theme, the cache will be invalidated automatically (TODO: implement).

**Current behavior:** Changes may take up to 1 hour to appear due to caching.

---

## Rate Limiting

Rate limiting is not currently implemented. Consider adding rate limiting for production:
- Recommended: 100 requests per minute per API key
- Use Redis or similar for distributed rate limiting

---

## Testing

### Using cURL
```bash
# List themes
curl https://localhost:3002/api/admin/themes

# Create theme
curl -X POST https://localhost:3002/api/admin/themes \
  -H "Content-Type: application/json" \
  -d '{"slug":"test","name":"Test","companyName":"Test"}'
```

### Using JavaScript/TypeScript
```typescript
async function createTheme(themeData) {
  const response = await fetch('https://your-domain.com/api/admin/themes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(themeData)
  })
  const data = await response.json()
  return data
}
```

---

## Security Considerations

1. **Authentication:** Implement API key or JWT authentication before production
2. **HTTPS:** Always use HTTPS in production
3. **Input Validation:** All inputs are validated using Zod schemas
4. **Asset Size Limits:** Consider adding size limits for base64 uploads (e.g., 5MB)
5. **Slug Validation:** Slugs are validated to prevent directory traversal or injection
6. **Rate Limiting:** Implement rate limiting to prevent abuse

---

## Troubleshooting

### Theme not appearing after creation
- Check if theme was created successfully (check response)
- Wait for cache to expire (1 hour) or implement cache invalidation
- Verify the theme slug matches what you're using in queries

### Asset upload failing
- Ensure base64 string is properly formatted (`data:image/...;base64,...`)
- Check file size (large files may timeout)
- Verify image format (PNG for logos, ICO for favicons)

### Validation errors
- Check that all required fields are provided
- Ensure hex colors are valid format (`#RRGGBB`)
- Verify slug format (lowercase, numbers, hyphens only)

---

## Next Steps

1. Implement authentication for admin endpoints
2. Add cache invalidation after theme updates
3. Implement rate limiting
4. Add asset size limits
5. Create admin UI in AWS app
6. Add webhook notifications for theme changes
