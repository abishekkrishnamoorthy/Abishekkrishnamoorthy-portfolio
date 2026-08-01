# Project Overview

## Project name

Abishek Portfolio. The backend package is named `portfolio-backend`, the public frontend package is named `next-portfolio-scaffold`, and the CMS package is named `portfolio-cms-frontend`.

## Purpose

This repository contains a content-managed personal portfolio system. It includes:

- A public portfolio website for projects, blog articles, contact details, and profile/home content.
- A CMS dashboard for authenticated administrators/editors to manage portfolio content, media, users, roles, SEO, and engagement records.
- A backend API that exposes public read endpoints and protected CMS endpoints backed by MongoDB and Cloudinary.

## Goals

- Keep public portfolio content editable without changing source code.
- Maintain typed API boundaries between the frontend, CMS, and backend.
- Provide role-based CMS access.
- Support Cloudinary-backed media workflows.
- Deploy the public frontend/backend to EC2/PM2 and the CMS to S3/CloudFront.

## High-level architecture

The repository is organized as a multi-application workspace:

- `backend/`: Express + TypeScript API, MongoDB/Mongoose models, services, validation, authentication, media, and CMS/public routes.
- `frontend/`: Next.js public portfolio website using App Router, React Query, Axios, and typed service/mapping layers.
- `cms-frontend/`: Vite React CMS dashboard using React Router, React Query, Zustand stores, reusable CMS UI components, and feature-specific services/schemas.
- `.github/workflows/`: GitHub Actions deployment workflows.

## Folder structure overview

```text
.
├── backend/              # Express API, MongoDB models, services, tests, deployment config
├── frontend/             # Next.js portfolio website
├── cms-frontend/         # Vite React CMS/admin dashboard
├── .github/workflows/    # Deployment automation
├── .agents/              # Agent-related local metadata; exact purpose Unknown
├── .codex/               # Codex local metadata; exact purpose Unknown
└── *.md                  # Architecture/specification notes
```

# Technology Stack

## Frontend

- Framework: Next.js `15.5.20`
- React: `19.1.0`
- Language: TypeScript `^5`
- Styling: Tailwind CSS `^4`, `tw-animate-css`, custom global CSS
- Data fetching/state: `@tanstack/react-query` `^5.101.4`
- HTTP: Axios `^1.18.1`
- Forms/validation dependencies present: React Hook Form `^7.82.0`, Zod `^4.4.3`, `@hookform/resolvers`
- Animation/icons/content: Framer Motion, Lucide React, React Markdown, Remark GFM, Rehype Highlight

## Backend

- Runtime: Node.js, ESM modules
- Framework: Express `^4.21.2`
- Language: TypeScript `^5.7.2`
- Database ODM: Mongoose `^8.9.5`
- Validation: Zod `^3.24.1`
- Authentication: JWT via `jsonwebtoken`, password hashing via `bcryptjs`
- Cookies: `cookie-parser`
- Security/middleware: Helmet, CORS, compression, custom sanitization, request IDs
- Rate limiting: `express-rate-limit`
- Logging: Pino and Pino HTTP dependency
- Cache: Redis through `ioredis`, optional by `REDIS_URL`
- Media: Cloudinary SDK `^2.5.1`
- Tests: Vitest, Supertest, mongodb-memory-server

## CMS

- Framework: Vite `^5.4.21` + React `^18.3.1`
- Routing: React Router DOM `^6.30.2`
- Data fetching/state: TanStack React Query `^5.90.11`, Zustand `^5.0.8`
- HTTP: Axios `^1.13.2`
- Forms/validation: React Hook Form `^7.68.0`, Zod `^3.25.76`, `@hookform/resolvers`
- UI primitives: Radix UI packages, custom UI components
- Rich article editing: `@mdxeditor/editor`
- Drag/drop: `@dnd-kit/core`, `@dnd-kit/sortable`
- Charts: Recharts
- Styling: Tailwind CSS `^3.4.18`, custom tokens in `src/theme/tokens.css`
- Tests: Vitest, Testing Library, Playwright

## Database

- MongoDB via Mongoose.
- Local example: `mongodb://127.0.0.1:27017/portfolio`
- Atlas is mentioned in `backend/env.example`.

## Cloudinary

- Used by backend for signed uploads, direct upload/delete, and project header image upload.
- Required backend env vars: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

## Authentication

- JWT access tokens expire in 15 minutes.
- Refresh tokens expire in 30 days and are stored hashed in MongoDB.
- Refresh tokens are sent in an HTTP-only cookie named `refreshToken`.
- CMS sends the access token as `Authorization: Bearer <token>`.
- RBAC permissions are stored on Role documents.

## Deployment

- Backend deployment: GitHub Actions SSH to EC2, `git pull`, `npm install`, `pm2 restart portfolio-backend`.
- Frontend deployment: GitHub Actions SSH to EC2, `git fetch`, `git pull`, `npm install`, `npm run build`, `pm2 restart portfolio-frontend`, then checks `https://abishekkrishnamoorthy.online`.
- CMS deployment: GitHub Actions build, upload `cms-frontend/dist/` to S3, invalidate CloudFront.

## AWS services

- EC2: used for backend and public frontend deployment.
- S3: used for CMS static hosting deployment.
- CloudFront: used in CMS deployment cache invalidation.
- Exact AWS account, regions, bucket names, distributions, and infrastructure definitions: Unknown.

## CloudFront

- CMS workflow invalidates a distribution using secret `CLOUDFRONT_DISTRIBUTION_ID`.
- Public frontend/backend CloudFront usage: Unknown.

## S3

- CMS workflow syncs `cms-frontend/dist/` to `s3://${{ secrets.S3_BUCKET_NAME }}` with `--delete`.
- Public frontend/backend S3 usage: Unknown.

## EC2

- Frontend/backend GitHub Actions SSH into an EC2 host from secrets `EC2_HOST`, `EC2_USERNAME`, `EC2_SSH_KEY`.
- Project path on server: `/home/ubuntu/Abishekkrishnamoorthy-portfolio`.

## Nginx

- `backend/DEPLOYMENT.md` says to use `deploy/nginx/portfolio-backend.conf` as the baseline reverse proxy and add TLS termination.
- That `deploy/nginx/portfolio-backend.conf` file is not present in the repository inspected here.
- Exact Nginx config, ports, upstream blocks, SSL cert paths, and domain mappings: Unknown.

## PM2

- Backend has `backend/ecosystem.config.cjs` with app name `portfolio-backend`, script `dist/server.js`, cluster mode, `instances: "max"`, and production `NODE_ENV`.
- Frontend workflow restarts PM2 process `portfolio-frontend`; its PM2 ecosystem config is not present in the repository.

## GitHub Actions

- `.github/workflows/deploy-backend.yml`
- `.github/workflows/deploy-frontend.yml`
- `.github/workflows/deploy-cms.yml`

# Repository Structure

## `backend/`

Express API application. Responsibilities:

- App/server bootstrap in `src/app.ts` and `src/server.ts`.
- Route registration in `src/routes.ts`.
- Configuration in `src/config/`.
- Middleware in `src/middlewares/`.
- Common helpers in `src/common/`.
- Domain modules in `src/modules/`.
- Background/helper jobs in `src/jobs/`.
- Seed scripts in `src/scripts/`.
- Tests in `tests/`.
- Deployment files: `Dockerfile`, `ecosystem.config.cjs`, `DEPLOYMENT.md`.

## `frontend/`

Public portfolio website. Responsibilities:

- Next.js App Router pages in `src/app/`.
- Public UI components in `src/components/`.
- Public API services in `src/services/`.
- React Query hooks in `src/hooks/`.
- Type definitions in `src/types/`.
- Environment parsing in `src/lib/env.ts`.
- Axios client in `src/lib/axios.ts`.
- Constants in `src/constants/`.
- Tests in `src/test/` and co-located `*.test.ts(x)` files.

## `cms-frontend/`

CMS/admin dashboard. Responsibilities:

- Vite React entry in `src/main.tsx`.
- React Router config in `src/app/routes.tsx`.
- Auth and app providers in `src/app/providers/`.
- Dashboard/auth layouts in `src/app/layouts/`.
- Route guards in `src/app/guards.tsx`.
- Pages in `src/pages/`.
- Feature services and schemas in `src/features/`.
- Reusable UI/form/table/media/layout components in `src/components/`.
- API envelope and Axios client in `src/lib/api/`.
- Auth token/permission helpers in `src/lib/auth/`.
- Zustand stores in `src/stores/`.
- Custom hooks in `src/hooks/`.
- Theme tokens in `src/theme/tokens.css`.
- Playwright tests in `tests/e2e/`.

## `.github/`

GitHub Actions workflows for production deployment.

## `shared/`

No `shared/` folder was found in the repository.

## Root markdown files

- `Backend-Architecture-Specification.md`
- `CMS-FRONTEND-ARCHITECTURE.md`
- `HERO-REDESIGN-SPECIFICATION.md`

These appear to be planning/architecture notes. This `ABOUT_PROJECT.md` is based on actual implementation files and only uses these notes when they match observed code.

# System Architecture

## Communication flow

- Portfolio website calls public backend endpoints under `/api`.
- CMS calls protected backend endpoints under `/api/cms`.
- Backend reads and writes MongoDB through Mongoose repositories.
- Backend signs Cloudinary uploads and deletes Cloudinary assets.
- CMS uploads files directly to Cloudinary after receiving a signed upload payload from backend, then records the uploaded asset in MongoDB.
- CMS authentication uses login/refresh/logout endpoints, JWT access tokens, refresh-token cookies, and RBAC middleware.
- Deployment is automated by GitHub Actions. Backend/frontend deploy to EC2 and restart PM2; CMS builds and deploys to S3 with CloudFront invalidation.

## Architecture diagram

```text
                 GitHub push to main
                         |
          +--------------+---------------+
          |              |               |
   deploy-frontend  deploy-backend  deploy-cms
          |              |               |
      EC2 + PM2      EC2 + PM2      S3 static hosting
          |              |               |
   portfolio site   Express API      CloudFront
          |              ^
          |              |
          +---- /api ----+
                         |
                    MongoDB
                         |
                    Mongoose

   CMS dashboard -- /api/cms --> Express API -- Cloudinary signed upload/delete
        |                              |
        +-- direct file upload --------+
            to Cloudinary upload API
```

# Backend

## Framework

The backend is an Express application written in TypeScript using ESM. `src/server.ts` connects to MongoDB and starts the Express app from `src/app.ts`.

## Routing

All API routes are registered in `src/routes.ts`.

- Public routes are mounted at `/api`.
- CMS routes are mounted at `/api/cms`.
- Auth routes are mounted under `/api/cms/auth`.
- Health routes are mounted directly at `/health` and `/health/ready`.

## Middleware

Global middleware in `src/app.ts`:

- `requestIdMiddleware`: attaches/generates `x-request-id`.
- Request completion logging through Pino.
- `helmet()`: security headers.
- `cors({ origin: env.ALLOWED_ORIGINS, credentials: true })`.
- `compression()`.
- `cookieParser(env.COOKIE_SECRET)`.
- `express.json({ limit: "8mb" })`.
- `express.urlencoded({ extended: true })`.
- `sanitizeMiddleware`: removes object keys containing `$` or `.` recursively.
- `publicRateLimit` on `/api`.
- `notFoundMiddleware`.
- `errorHandler`.

Route-specific middleware:

- `validate(...)`: Zod body/query/param validation.
- `authMiddleware`: validates bearer access token and loads user.
- `rbac(module, action)`: checks role permissions.
- `publicCache(ttlSeconds = 300)`: optional Redis-backed public GET cache.
- `contactRateLimit`: 5 contact/meeting submissions per 15 minutes.
- `loginRateLimit`: 5 logins per 15 minutes.

## Controllers

Some modules use controller files:

- `auth.controller.ts`
- `experience.controller.ts`
- `about.controller.ts`
- `settings.controller.ts`
- `seo.controller.ts`
- `audit-log.controller.ts`
- `dashboard.controller.ts`

Other modules are wired directly in `routes.ts` using service calls.

## Services

Services implement domain behavior and cache/media side effects:

- `homeService`: public home aggregation, CMS singleton updates.
- `skillsService`: skills singleton read/update.
- `projectsService`: public and CMS project/header behavior, Cloudinary header uploads, cache invalidation, media usage sync.
- `blogService`: public and CMS blog behavior, read-time calculation, block operations.
- `contactService`: contact singleton, contact messages, meeting requests, honeypot spam filtering.
- `mediaService`: signed upload payloads, media asset records, Cloudinary deletion, usage tracking.
- `experienceService`, `aboutService`, `settingsService`, `seoService`, `usersService`, `dashboardService`.

## Validation

Each module has Zod validation files named `*.validation.ts`. Shared validators live in `src/common/validation.ts`, including slug, URL, HTTPS URL, date string, email, and phone schemas.

## Database access

Database access is through Mongoose models and repository files:

- Models: `src/modules/*/*.model.ts`.
- Repositories: `src/modules/*/*.repository.ts`.
- Connection: `src/config/db.ts`.

## Authentication

- Login checks email/password with bcrypt.
- Access JWT uses `JWT_ACCESS_SECRET` and expires in 15 minutes.
- Refresh JWT uses `JWT_REFRESH_SECRET` and expires in 30 days.
- Refresh tokens are hashed with SHA-256 before storage.
- Refresh-token rotation revokes the previous refresh token.
- Reuse/invalid refresh token detection revokes the entire token family.

## Error handling

- Domain errors use `AppError(statusCode, code, message, details?)`.
- Zod errors return HTTP 400 with code `VALIDATION_ERROR`.
- Unknown errors return HTTP 500 with code `INTERNAL_SERVER_ERROR`.
- Error responses use `{ error, meta: { requestId } }`.

## Logging

- Logger: Pino.
- Log level: `silent` in test, `info` in production, `debug` otherwise.
- Redacted fields include authorization headers, cookies, password, access token, and refresh token.
- `src/app.ts` logs completed requests with method, path, status code, and request ID.

## Rate limiting

- Public API: 100 requests per 15 minutes.
- Contact endpoints: 5 requests per 15 minutes.
- Login endpoint: 5 requests per 15 minutes.

## Configuration

Environment is parsed in `src/config/env.ts` with Zod. Defaults are provided for local development where appropriate.

## Folder conventions

Backend modules generally follow:

```text
src/modules/<module>/
├── <module>.model.ts
├── <module>.repository.ts
├── <module>.service.ts
├── <module>.validation.ts
└── <module>.controller.ts   # present for some modules
```

# Frontend

## Framework

The public portfolio is a Next.js App Router app using React 19 and TypeScript.

## Routing

Routes implemented under `frontend/src/app/`:

- `/`
- `/projects`
- `/projects/[slug]`
- `/blog`
- `/blog/[slug]`
- `/contact`

## State management

- Server/client state is handled with TanStack React Query.
- `QueryProvider` wraps the app in `src/app/layout.tsx`.
- Navigation context exists in `src/context/NavigationContext.tsx`.
- No Redux store or global Zustand store was observed in the public frontend.

## API layer

- `src/lib/axios.ts` creates the Axios client from `env.API_URL` and `env.API_TIMEOUT_MS`.
- `src/services/*.service.ts` provide module-specific API functions.
- `src/services/response.ts` unwraps backend response envelopes.
- `src/services/mappers.ts` maps backend DTOs to frontend domain types.

## Components

Major component groups:

- `components/layout/`: `SiteShell`, `Navbar`, `Footer`, mobile nav.
- `components/home/`: home hero and sections.
- `components/hero/`: redesigned hero primitives and tokens.
- `components/projects/`: projects list, toolbar, hero, item cards.
- `components/project-details/`: detail client, tabs, stats, structure, tech stack.
- `components/blog/`: blog index/detail, sidebar, article renderer.
- `components/contact/`: contact page and hub.
- `components/common/`: reusable button, badge, tag, empty/error/skeleton states.
- `components/assistant/`: assistant modal.

## Layouts

The root layout uses `SiteShell` around all pages. HTML is rendered with `lang="en"` and `className="dark"`.

## Theme

The public frontend uses Tailwind CSS and global CSS in `src/app/globals.css`. Shared constants and hero tokens support visual consistency.

## Utilities

- `src/lib/env.ts`: typed environment object.
- `src/lib/query-client.ts`: React Query client setup.
- `src/lib/utils.ts`: utility helpers.
- `src/constants/`: navigation, categories, sorting, site metadata.

## Environment variables

The frontend reads only `NEXT_PUBLIC_*` variables through `src/lib/env.ts`.

## SEO implementation

- Global metadata is defined in `src/app/layout.tsx`.
- Page-level metadata exists for home, projects, blog, and contact pages.
- Dynamic page metadata details for `/projects/[slug]` and `/blog/[slug]`: Unknown from the inspected output.
- SEO overrides exist in backend/CMS, but public frontend consumption of `/api/cms/seo` or SEO override data was not observed.

## Data fetching

Public services call:

- `/home`
- `/projects`
- `/projects/header`
- `/projects/:slug`
- `/projects/:slug/related`
- `/blogs`
- `/blogs/:slug`
- `/contact`
- `/contact/messages`
- `/contact/meeting-requests`

React Query hooks under `src/hooks/` wrap these services.

## Caching

- Frontend caching is handled by React Query.
- Backend public GET responses can be Redis-cached through `publicCache`.
- Exact React Query stale times/cache settings: Unknown without inspecting `src/lib/query-client.ts`.

# CMS

## Architecture

The CMS is a Vite React single-page app. `src/main.tsx` boots the app, providers live in `src/app/providers/`, and React Router is configured in `src/app/routes.tsx`.

## Modules

Implemented CMS routes/modules:

- Dashboard
- Home editor
- Skills editor
- Projects list/editor/header
- Blogs list/editor/block operations
- Experience
- About editor
- Contact editor
- Messages
- Meeting requests
- Media library
- SEO
- Settings
- Users
- Roles
- Audit logs
- Profile
- Error pages: 403, 404, 500

## Navigation

Navigation groups are defined in `src/components/layout/navigation.ts`:

- Content: Dashboard, Home, Skills, Projects, Blogs, Experience, About.
- Engagement: Contact, Messages, Meeting Requests.
- Library: Media, SEO.
- Admin: Settings, Users, Roles, Audit Logs, Profile, Forbidden.

Navigation items include Lucide icons and module names used for permission checks.

## Media upload

- CMS asks backend for a signed upload payload at `/api/cms/media/sign-upload`.
- CMS uploads directly to Cloudinary using `fetch("https://api.cloudinary.com/v1_1/<cloudName>/auto/upload")`.
- CMS then creates a backend media record at `/api/cms/media`.
- Media components include `UploadDropzone`, `ImagePreview`, and `MediaGrid`.

## Forms

- Feature schemas live under `src/features/<module>/<module>.schema.ts`.
- Shared form components live in `src/components/form/`: `FormField`, `FormSection`, `SaveButton`, `SlugInput`, `TagInput`, `DatePickerField`.
- Form handling uses React Hook Form and Zod.

## Validation

- Client-side validation is feature-specific through Zod schemas.
- Server-side validation is also enforced in backend `*.validation.ts` files.

## API communication

- `src/lib/api/axiosClient.ts` centralizes CMS HTTP calls.
- `src/lib/api/endpoints.ts` defines all CMS endpoint strings.
- Response interceptor unwraps backend envelopes.
- 401 responses trigger one refresh attempt, then retry the original request.

## Authentication

- CMS login stores the access token via `src/lib/auth/tokenStore.ts`.
- Refresh tokens are stored by the browser as HTTP-only cookies.
- `RequireAuth` and `RequirePermission` guards protect routes.
- `withCredentials: true` is enabled on the Axios client.

## Current implemented modules

Observed implemented pages and services:

- Auth login/refresh/logout.
- Dashboard summary.
- Home, skills, projects, blogs, experience, about, contact.
- Contact messages and meeting requests.
- Media library.
- SEO overrides.
- Settings.
- Users, roles, audit logs.

## Current pending modules

- Public frontend service `assistant.service.ts` returns `notImplemented("Portfolio assistant")`.
- Public frontend service `experience.service.ts` returns `notImplemented("Public experience data")`.
- CMS modules planned but not implemented beyond observed files: Unknown.

## UI component patterns

- Reusable CMS components are under `src/components/ui/`, `src/components/form/`, `src/components/table/`, `src/components/feedback/`, `src/components/layout/`, and `src/components/media/`.
- CMS uses Lucide icons, Radix primitives, Tailwind CSS, and custom theme tokens.
- Pages should reuse existing UI/form/table/media primitives before introducing new components.

# Database

MongoDB collections are inferred from Mongoose model names. Exact physical collection names are Mongoose defaults unless explicitly configured; no explicit collection names were observed.

## `AboutContent`

- Purpose: Singleton about-page/profile content.
- Important fields: `_id`, `bio`, `profileImage.url`, `profileImage.alt`, `resumeUrl`, `highlights`.
- Relationships: none observed.
- Used by: about CMS module, media usage sync.

## `AuditLog`

- Purpose: Store CMS write operations.
- Important fields: `actor`, `action`, `collection`, `documentId`, `diff`, timestamps.
- Relationships: `actor` references `User`.
- Used by: audit logs module and `saveAndAudit` calls in routes.

## `BlogArticle`

- Purpose: Blog/article content for public site and CMS.
- Important fields: `slug`, `title`, `excerpt`, `category`, `publishedAt`, `updatedAt`, `readTimeMinutes`, `author`, `tags`, `coverImageUrl`, SEO fields, `blocks`, `editorDocument`, `featured`, `publishStatus`.
- Relationships: none explicit.
- Used by: public blog pages, CMS blogs, dashboard summary, media usage sync.

## `ContactContent`

- Purpose: Singleton contact page content.
- Important fields: `hero`, `contact.email`, `contact.phone`, `contact.location`, `contact.resume`, `availability`, `businessHours`, `communicationMethods`, `socialLinks`.
- Relationships: none observed.
- Used by: public contact/profile data, CMS contact editor.

## `ContactMessage`

- Purpose: Contact form submissions.
- Important fields: `name`, `email`, `subject`, `message`, `source`, `status`, `ipAddress`, `userAgent`.
- Relationships: none observed.
- Used by: public contact form, CMS messages, dashboard summary.

## `MeetingRequest`

- Purpose: Meeting/call scheduling requests.
- Important fields: `meetingType`, `fullName`, `email`, `phone`, `preferredDate`, `preferredTime`, `timezone`, `purpose`, `message`, `status`, `ipAddress`, `userAgent`.
- Relationships: none observed.
- Used by: public meeting request form, CMS meeting requests, dashboard summary.

## `Experience`

- Purpose: Work/experience entries.
- Important fields: `role`, `company`, `location`, `startDate`, `endDate`, `description`, `techTags`, `orderIndex`, `publishStatus`.
- Relationships: none observed.
- Used by: CMS experience module. Public frontend experience service is currently not implemented.

## `HomeContent`

- Purpose: Singleton home/hero content.
- Important fields: `hero.roleBadge`, `hero.headline`, `hero.highlightedHeadline`, `hero.subheadline`, `hero.portraitUrl`, `hero.portraitAlt`, `hero.backgroundUrl`, CTA labels, status, social links.
- Relationships: none observed.
- Used by: public home page, CMS home editor.

## `MediaAsset`

- Purpose: Track Cloudinary media assets and usage.
- Important fields: `publicId`, `url`, `secureUrl`, `folder`, `resourceType`, `format`, `width`, `height`, `bytes`, `usedIn`, `deleteFailed`.
- Relationships: `usedIn` stores collection/document/field references as plain strings.
- Used by: media library, Cloudinary delete flow, content usage tracking.

## `Project`

- Purpose: Portfolio project content.
- Important fields: `slug`, `orderIndex`, `title`, `tagline`, `shortDescription`, `description`, `status`, `category`, `thumbnailUrl`, `techTags`, `highlights`, `liveDemoUrl`, `githubUrl`, `durationLabel`, `role`, `lastUpdatedAt`, `techIcons`, `readmeMarkdown`, `projectStructure`, `techStackTable`, `gallery`, `architectureNotes`, `challenges`, `solutions`, `learningOutcomes`, `architectureDiagramUrl`, `isFeatured`, `publishStatus`, `previousProject`, `nextProject`, `createdBy`, `updatedBy`.
- Relationships: `createdBy` and `updatedBy` reference `User`.
- Used by: public project pages, CMS projects, dashboard summary, media usage sync.

## `ProjectHeaderContent`

- Purpose: Singleton header content for the projects page.
- Important fields: `_id`, `badge`, `title`, `highlightText`, `description`, `showcaseImages`.
- Relationships: none observed.
- Used by: public projects page and CMS project header editor.

## `RefreshToken`

- Purpose: Persist refresh token families for session rotation and revocation.
- Important fields: `userId`, `tokenHash`, `familyId`, `revokedAt`, `expiresAt`.
- Relationships: `userId` references `User`.
- Used by: authentication service.

## `Role`

- Purpose: RBAC role definitions.
- Important fields: `name`, `permissions.module`, `permissions.actions`.
- Relationships: used by `User.roleId`.
- Used by: RBAC middleware, users/roles CMS.

## `SeoOverride`

- Purpose: Store page-specific SEO metadata.
- Important fields: `pagePath`, `metaTitle`, `metaDescription`, `ogImageUrl`, `canonicalUrl`.
- Relationships: none observed.
- Used by: CMS SEO module. Public frontend runtime use: Unknown.

## `Settings`

- Purpose: Singleton settings container.
- Important fields: `_id`, `seo`, `forms`, `scheduling`.
- Relationships: none observed.
- Used by: CMS settings module.

## `SkillsContent`

- Purpose: Singleton skills and currently-learning content.
- Important fields: `categories`, `learningItems`.
- Relationships: none observed.
- Used by: public home page, CMS skills editor.

## `User`

- Purpose: CMS user accounts.
- Important fields: `name`, `email`, `passwordHash`, `roleId`, `active`.
- Relationships: `roleId` references `Role`.
- Used by: auth, users CMS, audit logs.

# API Documentation

All successful backend responses use this envelope:

```json
{
  "data": {},
  "meta": {
    "requestId": "..."
  }
}
```

Errors use:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": []
  },
  "meta": {
    "requestId": "..."
  }
}
```

## Health

| Method | URL | Purpose | Auth required | Response format |
|---|---|---|---|---|
| GET | `/health` | Basic health check | No | `{ data: { status: "ok" }, meta }` |
| GET | `/health/ready` | DB readiness check | No | `{ data: { status, db }, meta }` |

## Public: Home

| Method | URL | Purpose | Auth required | Response format |
|---|---|---|---|---|
| GET | `/api/home` | Aggregate home hero, featured projects, skills, learning items, and latest articles | No | Envelope with home payload |

## Public: Projects

| Method | URL | Purpose | Auth required | Response format |
|---|---|---|---|---|
| GET | `/api/projects` | List published projects with query validation/filtering | No | Envelope with projects page payload |
| GET | `/api/projects/header` | Get projects page header content | No | Envelope with `ProjectHeaderContent` |
| GET | `/api/projects/:slug` | Get project detail by slug | No | Envelope with `Project` |
| GET | `/api/projects/:slug/related` | Get related projects by slug/category | No | Envelope with `Project[]` |

## Public: Blogs

| Method | URL | Purpose | Auth required | Response format |
|---|---|---|---|---|
| GET | `/api/blogs` | List published blog articles | No | Envelope with blog list payload |
| GET | `/api/blogs/:slug` | Get blog detail by slug | No | Envelope with blog detail payload |

## Public: Contact

| Method | URL | Purpose | Auth required | Response format |
|---|---|---|---|---|
| GET | `/api/contact` | Get contact page content | No | Envelope with `ContactContent` |
| POST | `/api/contact/messages` | Submit contact message | No | Envelope with `{ id, status, message }` |
| POST | `/api/contact/meeting-requests` | Submit meeting request | No | Envelope with `{ id, status, message }` |

## CMS: Auth

| Method | URL | Purpose | Auth required | Response format |
|---|---|---|---|---|
| POST | `/api/cms/auth/login` | Authenticate user and set refresh cookie | No | Envelope with `{ accessToken, user }` |
| POST | `/api/cms/auth/refresh` | Rotate refresh token and issue new access token | Refresh cookie/body token | Envelope with `{ accessToken }` |
| POST | `/api/cms/auth/logout` | Revoke refresh token and clear cookie | Refresh cookie/body token | Envelope with `{ status: "ok" }` |

## CMS: Dashboard

| Method | URL | Purpose | Auth required | Response format |
|---|---|---|---|---|
| GET | `/api/cms/dashboard/summary` | Get project/article/message/meeting counts | Yes, `dashboard:read` | Envelope with `DashboardSummary` |

## CMS: Home

| Method | URL | Purpose | Auth required | Response format |
|---|---|---|---|---|
| GET | `/api/cms/home` | Get CMS home singleton | Yes, `home:read` | Envelope with `HomeContent` |
| PUT | `/api/cms/home` | Update home singleton | Yes, `home:update` | Envelope with updated `HomeContent` |

## CMS: Skills

| Method | URL | Purpose | Auth required | Response format |
|---|---|---|---|---|
| GET | `/api/cms/skills` | Get skills singleton | Yes, `skills:read` | Envelope with `SkillsContent` |
| PUT | `/api/cms/skills` | Update skills singleton | Yes, `skills:update` | Envelope with updated `SkillsContent` |

## CMS: Projects

| Method | URL | Purpose | Auth required | Response format |
|---|---|---|---|---|
| GET | `/api/cms/projects` | List all CMS projects | Yes, `projects:read` | Envelope with `Project[]` |
| GET | `/api/cms/projects/header` | Get projects header singleton | Yes, `projects:read` | Envelope with `ProjectHeaderContent` |
| PUT | `/api/cms/projects/header` | Update projects header singleton | Yes, `projects:update` | Envelope with updated header |
| POST | `/api/cms/projects/header/showcase-image` | Upload base64 showcase image to Cloudinary | Yes, `projects:update` | Envelope with `{ imageUrl }` |
| POST | `/api/cms/projects` | Create project | Yes, `projects:create` | Envelope with created `Project` |
| PUT | `/api/cms/projects/:slug` | Update project | Yes, `projects:update` | Envelope with updated `Project` |
| DELETE | `/api/cms/projects/:slug` | Delete project | Yes, `projects:delete` | Envelope with deleted/null result |
| PATCH | `/api/cms/projects/reorder` | Reorder projects | Yes, `projects:update` | Envelope with `Project[]` |
| PATCH | `/api/cms/projects/:slug/publish` | Change project publish status | Yes, `projects:publish` | Envelope with updated `Project` |

## CMS: Blogs

| Method | URL | Purpose | Auth required | Response format |
|---|---|---|---|---|
| GET | `/api/cms/blogs` | List all CMS blog articles | Yes, `blogs:read` | Envelope with `BlogArticle[]` |
| POST | `/api/cms/blogs` | Create blog article | Yes, `blogs:create` | Envelope with created `BlogArticle` |
| PUT | `/api/cms/blogs/:slug` | Update blog article | Yes, `blogs:update` | Envelope with updated `BlogArticle` |
| PATCH | `/api/cms/blogs/:slug/publish` | Change blog publish status | Yes, `blogs:publish` | Envelope with updated `BlogArticle` |
| DELETE | `/api/cms/blogs/:slug` | Delete blog article | Yes, `blogs:delete` | Envelope with deleted/null result |
| POST | `/api/cms/blogs/:slug/blocks` | Add article block | Yes, `blogs:update` | Envelope with updated `BlogArticle` |
| PATCH | `/api/cms/blogs/:slug/blocks/reorder` | Reorder article blocks | Yes, `blogs:update` | Envelope with updated `BlogArticle` |
| DELETE | `/api/cms/blogs/:slug/blocks/:blockId` | Delete article block | Yes, `blogs:update` | Envelope with updated `BlogArticle` |

## CMS: Contact and Engagement

| Method | URL | Purpose | Auth required | Response format |
|---|---|---|---|---|
| GET | `/api/cms/contact` | Get contact singleton | Yes, `contact:read` | Envelope with `ContactContent` |
| PUT | `/api/cms/contact` | Update contact singleton | Yes, `contact:update` | Envelope with updated `ContactContent` |
| GET | `/api/cms/messages` | List contact messages | Yes, `messages:read` | Envelope with `ContactMessage[]` |
| PATCH | `/api/cms/messages/:id/status` | Update message status | Yes, `messages:update` | Envelope with updated message |
| GET | `/api/cms/meeting-requests` | List meeting requests | Yes, `meeting-requests:read` | Envelope with `MeetingRequest[]` |
| PATCH | `/api/cms/meeting-requests/:id/status` | Update meeting request status | Yes, `meeting-requests:update` | Envelope with updated meeting request |

## CMS: Media

| Method | URL | Purpose | Auth required | Response format |
|---|---|---|---|---|
| POST | `/api/cms/media/sign-upload` | Create Cloudinary signed upload payload | Yes, `media:create` | Envelope with `{ timestamp, folder, signature, cloudName, apiKey }` |
| GET | `/api/cms/media` | List media assets, optionally by folder | Yes, `media:read` | Envelope with `MediaAsset[]` |
| POST | `/api/cms/media` | Create media asset record after upload | Yes, `media:create` | Envelope with created `MediaAsset` |
| DELETE | `/api/cms/media/:id` | Delete Cloudinary asset and media record | Yes, `media:delete` | Envelope with delete result |

## CMS: Experience

| Method | URL | Purpose | Auth required | Response format |
|---|---|---|---|---|
| GET | `/api/cms/experience` | List experience records | Yes, `experience:read` | Envelope with `Experience[]` |
| POST | `/api/cms/experience` | Create experience record | Yes, `experience:create` | Envelope with created `Experience` |
| PUT | `/api/cms/experience/:id` | Update experience record | Yes, `experience:update` | Envelope with updated `Experience` |
| DELETE | `/api/cms/experience/:id` | Delete experience record | Yes, `experience:delete` | Envelope with deleted/null result |
| PATCH | `/api/cms/experience/reorder` | Reorder experience records | Yes, `experience:update` | Envelope with `Experience[]` |

## CMS: About

| Method | URL | Purpose | Auth required | Response format |
|---|---|---|---|---|
| GET | `/api/cms/about` | Get about singleton | Yes, `about:read` | Envelope with `AboutContent` |
| PUT | `/api/cms/about` | Update about singleton | Yes, `about:update` | Envelope with updated `AboutContent` |

## CMS: Settings

| Method | URL | Purpose | Auth required | Response format |
|---|---|---|---|---|
| GET | `/api/cms/settings` | Get settings singleton | Yes, `settings:read` | Envelope with `Settings` |
| PUT | `/api/cms/settings` | Update settings singleton | Yes, `settings:update` | Envelope with updated `Settings` |

## CMS: SEO

| Method | URL | Purpose | Auth required | Response format |
|---|---|---|---|---|
| GET | `/api/cms/seo` | List SEO overrides | Yes, `seo:read` | Envelope with `SeoOverride[]` |
| POST | `/api/cms/seo` | Create SEO override | Yes, `seo:create` | Envelope with created `SeoOverride` |
| PUT | `/api/cms/seo/:id` | Update SEO override | Yes, `seo:update` | Envelope with updated `SeoOverride` |
| DELETE | `/api/cms/seo/:id` | Delete SEO override | Yes, `seo:delete` | Envelope with deleted/null result |

## CMS: Users, Roles, Audit

| Method | URL | Purpose | Auth required | Response format |
|---|---|---|---|---|
| GET | `/api/cms/users` | List CMS users | Yes, `users:read` | Envelope with `User[]` |
| POST | `/api/cms/users` | Create CMS user | Yes, `users:create` | Envelope with created `User` |
| PATCH | `/api/cms/users/:id` | Update CMS user | Yes, `users:update` | Envelope with updated `User` |
| GET | `/api/cms/roles` | List roles | Yes, `roles:read` | Envelope with `Role[]` |
| PUT | `/api/cms/roles/:id` | Update role permissions | Yes, `roles:update` | Envelope with updated `Role` |
| GET | `/api/cms/audit-logs` | List audit logs | Yes, `settings:read` | Envelope with `AuditLog[]` |

# Authentication

## Login flow

1. CMS posts email/password to `/api/cms/auth/login`.
2. Backend finds the user by email and compares the password with `bcrypt.compare`.
3. Backend signs a 15-minute access token and a 30-day refresh token.
4. Backend stores a SHA-256 hash of the refresh token in MongoDB with a `familyId`.
5. Backend returns `{ accessToken, user }` and sets the HTTP-only `refreshToken` cookie.
6. CMS stores the access token client-side using `tokenStore`.

## Refresh token

- Refresh endpoint reads `req.cookies.refreshToken` or `req.body.refreshToken`.
- Refresh token is verified with `JWT_REFRESH_SECRET`.
- Stored hash is checked against `RefreshToken`.
- Previous refresh token is revoked.
- New refresh token is issued in the same family and stored hashed.
- If a token is missing, expired, revoked, or invalid, the family is revoked.

## JWT

- Access token payload: `{ sub: userId, role: roleName }`.
- Refresh token payload: `{ sub, role, familyId }`.
- Access token expiry: `15m`.
- Refresh token expiry: `30d`.

## Protected routes

- CMS routes use `cmsGuard(moduleName, action)`, which expands to `authMiddleware` and `rbac(moduleName, action)`.
- `SUPER_ADMIN` bypasses individual permission checks.
- Other roles require a matching permission entry with the needed action.

## Cookies

- Cookie name: `refreshToken`.
- `httpOnly: true`.
- `secure: true` only when `NODE_ENV === "production"`.
- `sameSite: "lax"`.
- `maxAge`: 30 days.

## Session handling

- Session state is token-based, not server session based.
- Refresh-token records provide revocation and family reuse detection.
- Logout revokes the current refresh token and clears the cookie.

## Middleware

- `authMiddleware` reads `Authorization: Bearer <accessToken>`, verifies it, loads the user, and sets `req.user`.
- `rbac` reads role permissions from `req.user.roleId`.

# Media

## Cloudinary usage

Cloudinary is configured in `backend/src/config/cloudinary.ts` from backend environment variables.

## Folder structure

Observed folder conventions:

- Generic CMS upload folder is supplied by the CMS; fallback in CMS service is `"portfolio"`.
- Project header image uploads use backend folder `"portfolio/projects-header"`.
- Other specific Cloudinary folders: Unknown.

## Upload flow

Generic media library:

1. CMS calls `/api/cms/media/sign-upload` with `{ folder }`.
2. Backend signs `{ timestamp, folder }` with Cloudinary API secret.
3. CMS sends file directly to Cloudinary `/auto/upload`.
4. CMS posts the returned Cloudinary metadata to `/api/cms/media`.
5. Backend stores a `MediaAsset` record.

Project header showcase image upload:

1. CMS sends base64 image data to `/api/cms/projects/header/showcase-image`.
2. Backend validates MIME type and size.
3. Backend uploads to Cloudinary folder `portfolio/projects-header`.
4. Backend returns `{ imageUrl }`.

## Delete flow

1. CMS calls `DELETE /api/cms/media/:id`.
2. Backend finds the media asset.
3. Backend calls `cloudinary.uploader.destroy(asset.publicId)`.
4. On success, backend deletes the MongoDB record and invalidates public cache.
5. On failure, backend sets `deleteFailed = true` and returns `{ deleted: false, deleteFailed: true }`.

## Image optimization

- Cloudinary stores media and returns secure URLs.
- Backend does not appear to add Cloudinary transformation URLs automatically.
- Next.js image optimization configuration: Unknown from inspected files.

## Current conventions

- Media usage is tracked by scanning URL-like fields in content payloads and storing usage entries in `MediaAsset.usedIn`.
- Content writes often call `mediaService.syncUsageForDocument`.
- Content deletes call `mediaService.clearUsageForDocument`.

# Deployment

## Backend deployment

Implemented workflow: `.github/workflows/deploy-backend.yml`.

- Trigger: push to `main` with changes under `backend/**`.
- Runner: `ubuntu-latest`.
- SSH action: `appleboy/ssh-action@v1.2.0`.
- Server path: `/home/ubuntu/Abishekkrishnamoorthy-portfolio`.
- Commands: `git pull origin main`, `cd backend`, `npm install`, `pm2 restart portfolio-backend`.

Backend runbook `backend/DEPLOYMENT.md` additionally says first deploy should run:

- `npm ci`
- `npm run build`
- `npm run seed:admin`
- `npm run seed:content`
- `pm2 start ecosystem.config.cjs`
- Verify `/health/ready`, `/api/home`, `/api/projects`, `/api/blogs`, `/api/contact`.

Note: the workflow does not run `npm run build`; whether the server builds elsewhere is Unknown.

## Frontend deployment

Implemented workflow: `.github/workflows/deploy-frontend.yml`.

- Trigger: push to `main` with changes under `frontend/**`.
- SSH to EC2 using repository secrets.
- Pulls latest code in `/home/ubuntu/Abishekkrishnamoorthy-portfolio`.
- Runs `npm install` and `npm run build` inside `frontend/`.
- Restarts `pm2 restart portfolio-frontend`.
- Runs `pm2 save`, `pm2 list`, waits, and checks `curl -I https://abishekkrishnamoorthy.online`.

Frontend PM2 config file: Unknown.

## CMS deployment

Implemented workflow: `.github/workflows/deploy-cms.yml`.

- Trigger: push to `main` with changes under `cms-frontend/**`.
- Uses Node.js 22.
- Generates `.env` with `VITE_API_BASE_URL`, `VITE_SITE_URL`, and `VITE_APP_NAME`.
- Runs `npm install` and `npm run build`.
- Uploads `dist/` to S3 with `aws s3 sync dist/ s3://<bucket> --delete`.
- Invalidates CloudFront with `aws cloudfront create-invalidation --paths "/*"`.

## S3

- Used for CMS build artifacts.
- Bucket name comes from GitHub secret `S3_BUCKET_NAME`.

## CloudFront

- Used for CMS cache invalidation.
- Distribution ID comes from GitHub secret `CLOUDFRONT_DISTRIBUTION_ID`.

## EC2

- Used for backend and public frontend.
- Host/user/key come from `EC2_HOST`, `EC2_USERNAME`, `EC2_SSH_KEY`.

## Nginx

- Backend runbook mentions reverse proxy and TLS termination.
- Actual Nginx config file is not present.
- Exact Nginx routes, upstream ports, proxy headers, SSL settings: Unknown.

## PM2

- Backend: `portfolio-backend`, script `dist/server.js`, cluster mode, max instances.
- Frontend: process name `portfolio-frontend` is referenced by workflow.
- CMS: not managed by PM2 in the observed workflow.

## GitHub Actions

Secrets observed:

- `EC2_HOST`
- `EC2_USERNAME`
- `EC2_SSH_KEY`
- `VITE_API_URL`
- `VITE_SITE_URL`
- `VITE_APP_NAME`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET_NAME`
- `CLOUDFRONT_DISTRIBUTION_ID`

## Environment variables

Production env is injected differently per app:

- Backend: expected on EC2 or deployment environment; see `backend/env.example` and `backend/DEPLOYMENT.md`.
- Frontend: expected at Next.js build/runtime; no `.env.example` was found for `frontend/`.
- CMS: generated in GitHub Actions before build.

## SSL

- Backend runbook says TLS termination should be added with Certbot or a preferred certificate manager.
- Actual SSL certificate setup: Unknown.

## Domain mapping

- Public frontend workflow checks `https://abishekkrishnamoorthy.online`.
- Backend allowed origins include `https://abishekkrishnamoorthy.online` and `https://www.abishekkrishnamoorthy.online`.
- Backend API domain/subdomain: Unknown.
- CMS domain/subdomain: Unknown.

## Subdomains

Unknown from codebase. No explicit CMS/API subdomain mapping was found.

# Environment Variables

## Backend

| Variable | Purpose | Example value | Used by |
|---|---|---|---|
| `NODE_ENV` | Runtime mode; affects logging and secure cookies | `production` | Backend |
| `PORT` | API listen port | `4000` | Backend |
| `API_BASE_URL` | Backend base URL | `http://localhost:4000` | Backend env config; direct runtime use Unknown |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowlist | `http://localhost:3000,http://localhost:5173` | Backend CORS |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/portfolio` | Backend DB |
| `JWT_ACCESS_SECRET` | JWT access signing secret | `change-this-development-access-secret` | Backend auth |
| `JWT_REFRESH_SECRET` | JWT refresh signing secret | `change-this-development-refresh-secret` | Backend auth |
| `COOKIE_SECRET` | Signed cookie parser secret | `change-this-development-cookie-secret` | Backend cookies |
| `REDIS_URL` | Optional Redis URL for public GET cache | `redis://localhost:6379` | Backend cache |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `my-cloud` | Backend media |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` | Backend media |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `secret` | Backend media |
| `SUPER_ADMIN_EMAIL` | Seed admin email | `admin@example.com` | `seed:admin` |
| `SUPER_ADMIN_PASSWORD` | Seed admin password | `change-this-admin-password` | `seed:admin` |
| `SUPER_ADMIN_NAME` | Seed admin display name | `Portfolio Admin` | `seed:admin` |
| `PUBLIC_SITE_ORIGIN` | Mentioned in deployment runbook | `https://abishekkrishnamoorthy.online` | Runtime use Unknown |
| `CMS_ORIGIN` | Mentioned in deployment runbook | Unknown | Runtime use Unknown |

## Frontend

| Variable | Purpose | Example value | Used by |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Public API base URL | `http://localhost:4000/api` | Frontend Axios |
| `NEXT_PUBLIC_API_TIMEOUT_MS` | Axios timeout | `10000` | Frontend Axios/env |
| `NEXT_PUBLIC_APP_NAME` | Site/application name | `Abishek Krishnamoorthy - Portfolio` | Frontend env/site metadata |
| `NEXT_PUBLIC_SITE_URL` | Canonical public site URL | `https://abishekkrishnamoorthy.online` | Frontend metadata/env |
| `NEXT_PUBLIC_RESUME_URL` | Resume link fallback | `https://example.com/resume.pdf` | Frontend env |
| `NEXT_PUBLIC_GITHUB_URL` | GitHub profile fallback | `https://github.com/` | Frontend env |
| `NEXT_PUBLIC_LINKEDIN_URL` | LinkedIn profile fallback | `https://linkedin.com/in/` | Frontend env |
| `NEXT_PUBLIC_EMAIL` | Email fallback | `hello@abishekkrishnamoorthy.online` | Frontend env |
| `NEXT_PUBLIC_SCHEDULE_CALL_URL` | Scheduling link fallback | `https://cal.com/...` | Frontend env |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics measurement ID | `G-XXXXXXXXXX` | Frontend env; implementation use Unknown |

## CMS

| Variable | Purpose | Example value | Used by |
|---|---|---|---|
| `VITE_API_BASE_URL` | Backend origin, without `/api` suffix in observed client | `http://localhost:4000` | CMS Axios |
| `VITE_SITE_URL` | Site URL generated by deployment workflow | `https://abishekkrishnamoorthy.online` | CMS runtime use Unknown |
| `VITE_APP_NAME` | CMS app name generated by deployment workflow | `Portfolio CMS` | CMS runtime use Unknown |
| `VITE_APP_ENV` | Mentioned in architecture docs | `production` | Runtime use Unknown |

## GitHub Actions / AWS

| Variable/Secret | Purpose | Example value | Used by |
|---|---|---|---|
| `EC2_HOST` | SSH host for EC2 deploys | `ec2-x.compute.amazonaws.com` | Backend/frontend workflows |
| `EC2_USERNAME` | SSH user | `ubuntu` | Backend/frontend workflows |
| `EC2_SSH_KEY` | Private key for SSH deploy | `-----BEGIN...` | Backend/frontend workflows |
| `AWS_ACCESS_KEY_ID` | AWS deploy access key | Unknown | CMS workflow |
| `AWS_SECRET_ACCESS_KEY` | AWS deploy secret key | Unknown | CMS workflow |
| `AWS_REGION` | AWS region | `ap-south-1` | CMS workflow |
| `S3_BUCKET_NAME` | CMS deployment bucket | Unknown | CMS workflow |
| `CLOUDFRONT_DISTRIBUTION_ID` | CMS distribution invalidation target | Unknown | CMS workflow |
| `VITE_API_URL` | GitHub secret mapped into `VITE_API_BASE_URL` | Unknown | CMS workflow |
| `VITE_SITE_URL` | GitHub secret mapped into CMS `.env` | Unknown | CMS workflow |
| `VITE_APP_NAME` | GitHub secret mapped into CMS `.env` | Unknown | CMS workflow |

# Coding Standards

## Naming conventions

- Backend files use module prefixes: `projects.service.ts`, `projects.repository.ts`, `projects.validation.ts`.
- React components use PascalCase filenames.
- Hooks use `useX` naming.
- Services use `<module>.service.ts`.
- Types use `<domain>.types.ts`.
- Constants use descriptive names and `as const` where appropriate.

## Folder conventions

- Keep backend domain logic inside `backend/src/modules/<module>/`.
- Keep public frontend API logic inside `frontend/src/services/`.
- Keep public frontend UI grouped by route/domain under `frontend/src/components/`.
- Keep CMS feature logic inside `cms-frontend/src/features/<module>/`.
- Keep reusable CMS controls in `cms-frontend/src/components/`.

## Import conventions

- Backend uses `@/` path aliases and ESM `.js` suffixes in TypeScript imports.
- Frontend and CMS use `@/` path aliases.
- Prefer local service/schema/component imports over cross-layer shortcuts.

## Error handling

- Backend should throw `AppError` for expected domain errors.
- Backend should validate incoming data with Zod before service execution.
- Frontend normalizes Axios errors into `ApiError`.
- CMS converts backend errors into `ApiError` from `src/lib/api/envelope.ts`.

## Component organization

- Page components should compose existing domain/reusable components.
- Reusable UI primitives should live in common UI folders.
- Feature-specific components should stay close to their feature when possible.

## Reusable component patterns

- Public frontend uses `Button`, `Badge`, `Tag`, `EmptyState`, `ErrorState`, `SkeletonBlock`, and domain cards/sections.
- CMS uses `Button`, `IconButton`, `Input`, `Textarea`, `Select`, `Modal`, `Drawer`, `ConfirmDialog`, `Card`, table components, form components, feedback components, and media components.

## Code style

- TypeScript throughout all apps.
- Zod for validation schemas.
- Axios service wrappers for API access.
- React Query hooks/services for data fetching.
- Tests exist for mappers, response envelopes, API contracts, validation, permissions, save workflows, and smoke behavior.

## Theme consistency

- Public frontend theme comes from Tailwind/global CSS and component tokens.
- CMS theme uses Tailwind CSS plus `src/theme/tokens.css`.
- New UI should reuse the nearest existing component and styling conventions.

# Existing Features

## Portfolio

- Home page with CMS-driven hero, featured projects, skills, currently learning items, and latest articles.
- Projects listing, project header, project detail, related projects.
- Blog index and blog detail pages.
- Contact page with contact info, social links, contact form, and meeting request flow.
- Profile data aggregation from home/contact content.
- React Query data fetching and typed DTO mapping.
- SEO metadata defaults and page-level metadata.

## CMS

- Login/logout/refresh.
- Dashboard summary.
- Home editor.
- Skills editor.
- Projects management including header, image upload, create, update, delete, reorder, publish.
- Blog management including create, update, delete, publish, block add/reorder/delete, article builder feature.
- Experience management.
- About editor.
- Contact editor.
- Contact messages and meeting requests with status updates.
- Media library with Cloudinary upload/delete tracking.
- SEO override management.
- Settings editor.
- User and role management.
- Audit logs.
- Protected routes and permission-based navigation.

## Backend

- Public API endpoints.
- Protected CMS API endpoints.
- MongoDB persistence with Mongoose.
- JWT auth and refresh token rotation.
- RBAC.
- Audit logging for CMS writes.
- Redis-backed public cache when configured.
- Cache invalidation after content changes.
- Cloudinary signed uploads and deletion.
- Validation, sanitization, rate limiting, request IDs, logging, and error envelopes.
- Seed scripts for admin roles/user and initial content.

## Authentication

- CMS JWT login.
- Refresh cookie and refresh-token records.
- Role permissions for CMS modules/actions.

## Media

- Cloudinary direct uploads through CMS.
- Media asset database records.
- Usage tracking by content document.
- Delete-failure tracking.

## Deployment

- Backend GitHub Actions deploy to EC2/PM2.
- Frontend GitHub Actions deploy to EC2/PM2.
- CMS GitHub Actions deploy to S3/CloudFront.

# Pending Features

Observed pending/not implemented items:

- Public portfolio assistant service is currently a `notImplemented("Portfolio assistant")` placeholder.
- Public frontend experience service is currently a `notImplemented("Public experience data")` placeholder.
- Public use of SEO override records is Unknown.
- Nginx configuration referenced by backend docs is not present.
- Frontend PM2 ecosystem configuration is not present.
- Other planned features: Unknown.

# Known Bugs

Potential bugs discovered from code inspection:

- `GET /health/ready` returns `status: "fssjd"` when the database is ready. This appears accidental; expected value is likely `"ready"` or `"ok"`.
- `backend/DEPLOYMENT.md` references `deploy/nginx/portfolio-backend.conf`, but no `deploy/` or `nginx/` config folder was found.
- Backend deploy workflow runs `npm install` and restarts PM2 but does not run `npm run build`, while PM2 backend script points to `dist/server.js`.
- `frontend/src/lib/env.ts` and `frontend/src/lib/axios.ts` contain `console.log` statements for environment/API URL values.
- Frontend `experience.service.ts` and `assistant.service.ts` throw not-implemented errors if called.

# Technical Debt

- Align backend deployment workflow with the TypeScript build output expected by PM2.
- Add or document the missing Nginx reverse proxy configuration.
- Add a frontend PM2 ecosystem file or document how `portfolio-frontend` is created.
- Remove debug `console.log` calls from production frontend code.
- Wire public experience API/pages if experience is intended to appear publicly.
- Decide whether SEO overrides should be consumed by public Next.js metadata.
- Add `.env.example` files for `frontend/` and `cms-frontend/`.
- Consider stronger Cloudinary folder conventions per content module.
- Avoid `redis.keys` in cache invalidation for large production keyspaces; consider `SCAN`.
- Document infrastructure ownership for S3, CloudFront, EC2, domains, and SSL.

# Future Roadmap

Recommended improvements based on the current architecture:

- Implement public experience data flow or remove unused public service placeholders.
- Implement the portfolio assistant feature behind a real backend endpoint if it is part of the product direction.
- Add public SEO override lookup and integrate it into Next.js metadata generation.
- Formalize deployment docs for all three apps, including PM2 process creation, Nginx config, SSL, and rollback.
- Add CI workflows for lint/typecheck/test before deployment.
- Add shared API contract documentation generated from backend route schemas.
- Expand media lifecycle tooling for orphan cleanup and Cloudinary reconciliation.
- Add pagination/filtering to CMS list endpoints where lists can grow.
- Add audit-log diff comparison instead of storing only submitted request body.
- Add observability around API latency, deployment health, and Cloudinary failures.

# AI Development Instructions

Future AI assistants should follow these rules before implementing features:

- Always inspect existing components, services, schemas, routes, and models before creating new ones.
- Reuse existing UI primitives in `frontend/src/components/common/` and `cms-frontend/src/components/ui/`, `form/`, `table/`, `feedback/`, and `media/`.
- Follow the existing folder structure for the target app.
- Do not duplicate components or services with similar responsibilities.
- Maintain the current design language and theme tokens.
- Do not introduce new dependencies unless the existing stack cannot reasonably support the requirement.
- Prefer extending existing modules over creating parallel modules.
- Keep public API response envelopes backward compatible.
- Keep CMS endpoint strings in `cms-frontend/src/lib/api/endpoints.ts` aligned with `backend/src/routes.ts`.
- Keep validation in both client schemas and backend Zod validation where applicable.
- Preserve RBAC conventions: `cmsGuard(module, action)` in backend and `RequirePermission` in CMS.
- Never break existing public routes or CMS routes.
- Update or add focused tests when touching API contracts, validation, auth, or mapper behavior.
- Use Cloudinary/media usage helpers when adding fields that store media URLs.
- In backend TypeScript imports, preserve the existing `@/... .js` import style.
- Do not refactor unrelated files while adding features.
- If a behavior cannot be determined from code, document it as `Unknown` and inspect further instead of guessing.

# File Tree

Simplified repository tree:

```text
.
├── ABOUT_PROJECT.md
├── Backend-Architecture-Specification.md
├── CMS-FRONTEND-ARCHITECTURE.md
├── HERO-REDESIGN-SPECIFICATION.md
├── backend
│   ├── API-POSTMAN-TESTING.md
│   ├── CMS-CONSTRUCTION-README.md
│   ├── DEPLOYMENT.md
│   ├── Dockerfile
│   ├── ecosystem.config.cjs
│   ├── env.example
│   ├── package.json
│   ├── src
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── routes.ts
│   │   ├── common
│   │   ├── config
│   │   ├── jobs
│   │   ├── middlewares
│   │   ├── modules
│   │   │   ├── about
│   │   │   ├── auditLogs
│   │   │   ├── auth
│   │   │   ├── blog
│   │   │   ├── contact
│   │   │   ├── dashboard
│   │   │   ├── experience
│   │   │   ├── home
│   │   │   ├── media
│   │   │   ├── projects
│   │   │   ├── seo
│   │   │   ├── settings
│   │   │   ├── skills
│   │   │   └── users
│   │   ├── scripts
│   │   └── types
│   └── tests
│       ├── helpers
│       ├── integration
│       └── unit
├── cms-frontend
│   ├── README.md
│   ├── index.html
│   ├── package.json
│   ├── playwright.config.ts
│   ├── src
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── app
│   │   ├── components
│   │   ├── features
│   │   ├── hooks
│   │   ├── lib
│   │   ├── pages
│   │   ├── stores
│   │   ├── theme
│   │   └── types
│   └── tests
│       └── e2e
├── frontend
│   ├── README.md
│   ├── components.json
│   ├── next.config.ts
│   ├── package.json
│   ├── scripts
│   └── src
│       ├── app
│       ├── components
│       ├── constants
│       ├── context
│       ├── hooks
│       ├── lib
│       ├── services
│       ├── test
│       └── types
└── .github
    └── workflows
        ├── deploy-backend.yml
        ├── deploy-cms.yml
        └── deploy-frontend.yml
```

# Summary

A visitor loads the Next.js portfolio frontend. React Query hooks call typed frontend services, which use Axios to request public backend endpoints under `/api`. The Express backend validates requests, optionally serves cached public GET responses from Redis, queries MongoDB through Mongoose repositories, wraps successful results in `{ data, meta }`, and returns them to the frontend for rendering.

An administrator uses the Vite CMS. After login, the CMS stores a short-lived access token and receives an HTTP-only refresh-token cookie. CMS routes and backend endpoints are protected by auth and RBAC. Content edits call `/api/cms/*` endpoints, backend services update MongoDB, write audit logs, sync media usage when relevant, invalidate public cache, and return updated records. Media uploads are signed by the backend, uploaded directly from CMS to Cloudinary, then recorded in MongoDB.

Production deployment is split: backend and public frontend are deployed to EC2 and restarted with PM2 through GitHub Actions, while the CMS is built in GitHub Actions, uploaded to S3, and refreshed through CloudFront invalidation.
