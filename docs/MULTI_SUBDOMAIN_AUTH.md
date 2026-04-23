# Multi-Subdomain Authentication Setup

This guide explains how to configure NextAuth for multiple subdomains (e.g., au.applicant.growmy.team, sa.applicant.growmy.team).

## Environment Variables

Add the following environment variable in Vercel for Production and Preview environments:

```
NEXTAUTH_URL=https://applicant.growmy.team
```

### How to add in Vercel:

```bash
# For Production
vercel env add NEXTAUTH_URL production
# Enter: https://applicant.growmy.team

# For Preview (UAT)
vercel env add NEXTAUTH_URL preview
# Enter: https://applicant.growmy.team
```

## Cookie Configuration

The NextAuth configuration in `lib/auth/auth.config.ts` has been updated to use wildcard domain cookies:

```typescript
cookies: {
  sessionToken: {
    name: `next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      domain: process.env.NODE_ENV === "production" ? ".applicant.growmy.team" : undefined,
    },
  },
}
```

## How It Works

1. **Wildcard Domain Cookie**: The `.applicant.growmy.team` domain (with leading dot) allows the session cookie to work across all subdomains:
   - au.applicant.growmy.team
   - sa.applicant.growmy.team
   - applicant.growmy.team

2. **NEXTAUTH_URL**: Set to the root domain, which NextAuth uses for OAuth callbacks and CSRF protection.

3. **Development**: In development, no domain is set (cookies work on localhost).

## Testing

After deployment, test authentication across subdomains:

1. Sign in on `au.applicant.growmy.team`
2. Navigate to `sa.applicant.growmy.team`
3. Verify you're still logged in (session should persist)

## Troubleshooting

**Session not persisting across subdomains:**
- Ensure `NEXTAUTH_URL` is set correctly in Vercel
- Check that the cookie domain includes the leading dot (`.applicant.growmy.team`)
- Verify cookies are being set with the correct domain in browser DevTools

**OAuth callbacks failing:**
- Ensure `NEXTAUTH_URL` matches your actual domain
- Check OAuth provider's redirect URL configuration

**Development vs Production:**
- Development: No domain set (works on localhost)
- Production: Uses `.applicant.growmy.team` wildcard domain
