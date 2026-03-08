# Starblog Product Requirements Document (V2.1)

## 1. Product Overview

### 1.1 Goal

Build and operate a personal publishing platform with:

- A fast Astro frontend with strong SEO.
- A creator-focused admin system for writing and publishing.
- Role-based account management for multi-user collaboration.
- Cloudflare-native deployment and storage for low-cost operations.

### 1.2 Current Status

- Frontend and admin UI are deployed on Cloudflare Pages.
- Authentication, user management, and post management are implemented.
- Runtime data has been migrated to Cloudflare D1 and KV-backed sessions.

### 1.3 Success Metrics

- LCP <= 2.5s on mainstream mobile networks.
- Publish and update success rate >= 99%.
- Admin authentication success rate >= 99%.
- SEO baseline coverage (title, description, canonical, sitemap) = 100%.

## 2. Roles and Scenarios

### 2.1 Roles

- `visitor`: read published content.
- `author`: create and edit own content.
- `admin`: manage all posts and users.
- `bot`: reserved author type for report-style content.

### 2.2 Core Scenarios

1. User registers and logs in.
2. Author creates draft content in admin.
3. Content is edited and published.
4. Public pages render latest published posts from D1.
5. Admin updates user roles and handles account operations.

## 3. Information Architecture

### 3.1 Public Pages

- `/`: latest published content.
- `/posts`: article list.
- `/posts/[slug]`: post detail.
- `/tags/[tag]`: tag archive.
- `/nav`, `/nav/notes`, `/nav/reports`: curated navigation pages.
- `/sitemap-index.xml`: generated sitemap index.

### 3.2 Admin Pages

- `/admin`: admin landing.
- `/admin/login`: sign in.
- `/admin/register`: sign up.
- `/admin/posts`: post list.
- `/admin/posts/new`: create post.
- `/admin/users`: user and role management.

## 4. Functional Requirements

### 4.1 Authentication and Sessions

- Email/username + password login.
- HttpOnly cookie session with JWT signature.
- Production requires `JWT_SECRET` with at least 32 chars.
- Cookie uses secure attributes in production.

### 4.2 Post Management

- Create, edit, delete posts in admin.
- Draft/published status management.
- Slug uniqueness enforcement.
- Category support (`article`, `report`).
- Tags, excerpt, and markdown content support.

### 4.3 User Management

- Admin-only user list and role updates.
- Admin can remove non-protected users.
- API responses must not expose password hashes.

### 4.4 Public Rendering

- Read published posts from D1 at runtime.
- Sort by publish/update timestamp descending.
- Render markdown body safely for readers.

## 5. Data Model

### 5.1 Users

- `id`
- `username`
- `nickname`
- `role` (`author` | `bot` | `admin`)
- `password_hash`
- `created_at`

### 5.2 Posts

- `slug`
- `author_id`
- `post_category` (`article` | `report`)
- `title`
- `excerpt`
- `tags_json`
- `status` (`draft` | `published`)
- `published_at`
- `updated_at`
- `content`

## 6. Deployment Requirements (Cloudflare)

### 6.1 Pages Build

- Build command: `npm run build`
- Output directory: `dist`
- Runtime mode: Astro server output with Cloudflare adapter.

### 6.2 Required Bindings

- D1 binding: `DB`
- KV binding: `SESSION`

### 6.3 Required Variables

- `PUBLIC_SITE_URL` (public canonical site URL)
- `JWT_SECRET` (secret, >= 32 chars)

### 6.4 Runtime Compatibility

- Enable Node compatibility for `node:crypto` usage.
- Keep `compatibility_date` and compatibility flags aligned with production behavior.

## 7. Security Requirements

- Password hashing must be one-way and salted.
- No password hash exposure in admin/user APIs.
- JWT secret rotation strategy should be documented.
- Access control checks required for all admin routes.

## 8. Acceptance Checklist

- Public pages accessible on `pages.dev` and custom domain.
- Register/login/logout flow works in production.
- Admin can create and publish posts.
- Published posts are visible on public pages.
- D1 and KV bindings are active in production.
- Sitemap is generated and reachable.

## 9. Next Milestones

1. Add content import tool for legacy markdown.
2. Add media upload flow with Cloudflare R2.
3. Add structured audit logs for admin operations.
4. Add automated smoke tests for auth and post flows.
