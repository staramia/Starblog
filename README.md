# Starblog

Starblog is an Astro-based personal publishing site with a Cloudflare-native admin backend.

## Features

- Astro frontend with SEO-friendly pages.
- Admin authentication (register/login/logout).
- Post management (create/edit/delete, draft/published).
- Role-based user management.
- Cloudflare D1 for persistent data.
- Cloudflare KV-backed session support.

## Tech Stack

- Astro
- TypeScript
- Cloudflare Pages + Functions
- Cloudflare D1
- Cloudflare KV

## Local Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Cloudflare Setup

### Required bindings

- `DB` (D1 database)
- `SESSION` (KV namespace)

### Required environment variables

- `PUBLIC_SITE_URL`
- `JWT_SECRET` (secret value, at least 32 characters)

## Database Migration

Apply remote migration:

```bash
npx wrangler d1 migrations apply starblog-db --remote
```

## Create First Admin User

1. Register a user via `/admin/register`.
2. Promote the user to admin:

```bash
npx wrangler d1 execute starblog-db --remote --command "UPDATE users SET role='admin' WHERE username='your_username';"
```

## Notes

- Keep `JWT_SECRET` and API tokens out of git history.
- Use Pages project settings for bindings and production variables.
