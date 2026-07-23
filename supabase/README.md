# Supabase authentication setup

The application keeps authentication disabled until the database schema and
email redirects are configured. Complete these steps before setting
`NEXT_PUBLIC_AUTH_ENABLED=true`.

## 1. Apply the database schema

Open the Supabase SQL Editor for the intended project and run `schema.sql`.
The script creates:

- private trigger functions;
- role-aware public profile tables;
- organization memberships and organization-owned jobs;
- row-level security policies;
- minimum Data API grants;
- automatic profile creation after signup.

Do not expose a service-role or secret key to the application. The browser and
server clients use only the project's publishable key.

## 2. Configure URL settings

In Authentication > URL Configuration:

- use `http://localhost:3000` as the Site URL while developing locally;
- add `http://localhost:3000/auth/confirm*` for local development;
- before launch, replace the Site URL with the production origin and add the
  exact production `/auth/confirm*` URL to Redirect URLs.

Set `NEXT_PUBLIC_SITE_URL` to the same stable production origin in Vercel.

## 3. Configure email templates

Email confirmations should remain enabled.

New Free-plan projects that use Supabase's default email provider cannot edit
email templates. The default templates use `{{ .ConfirmationURL }}` and are
appropriate for development. Configure custom SMTP before a public launch.

After custom SMTP is enabled, the Confirm signup template can use this link:

```html
<a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">
  Confirm your email address
</a>
```

For the Reset password template, use this link:

```html
<a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=recovery">
  Reset your password
</a>
```

The default Supabase mail service is suitable only for initial testing.

## 4. Enable authentication

Add these variables to local `.env.local` and to the Vercel project:

```text
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_AUTH_ENABLED=true
```

After deployment, test professional signup, employer signup, email
confirmation, sign-in, onboarding, organization editing, job draft creation,
job status changes, sign-out, and password recovery.

## Employer workspace migrations

Existing environments should apply the versioned SQL files in
`supabase/migrations/` in filename order. The employer workspace migration
moves each existing employer profile into an organization, assigns that user as
the owner, and preserves the original onboarding data.

Organization, membership, and job access is protected by row-level security.
The application uses the authenticated user's publishable-key session; no
service-role key is required or permitted in the web application.
