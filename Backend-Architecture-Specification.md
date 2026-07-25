# Portfolio Backend — Architecture Specification

**Prepared by:** Lead Software Architect
**Audience:** Backend Engineer (Codex) implementing the system
**Source of truth for the API surface:** `README.md` (Frontend API Contract — Home, Projects, Blog, Contact modules)
**Status:** Design document. No implementation code included by design.

---

## 0. How To Read This Document

This document does not redesign the frontend. Every endpoint, field name, validation rule, and response shape defined in the attached README is treated as fixed. Where the README already specifies field-by-field contracts (Hero, Featured Projects, Skills, Blog Blocks, Contact, Meeting Requests, etc.), this document does not repeat those tables — it references them by section name and focuses on how the **backend** is structured to serve them.

Where this document proposes something the README does not cover (Experience, About, Users/Roles, SEO, Settings, Media Library — all CMS modules the frontend doesn't yet consume), each proposal is flagged **[NEW — not in frontend contract]** and follows the same format the README uses:

- **Current Design** — what exists today (usually: nothing, mock data only)
- **Issue** — why it needs a backend shape
- **Recommendation** — the proposed schema/API
- **Reason** — why

---

## 1. System Architecture Overview

### 1.1 High-Level Topology

```
                    ┌─────────────────────────┐
                    │   Admin CMS (SPA)       │
                    │   (separate frontend)   │
                    └───────────┬─────────────┘
                                │ HTTPS (JWT Bearer)
                                │
┌───────────────────┐          ▼          ┌─────────────────────┐
│  Public Portfolio  │──HTTPS──▶  Backend API (Node.js/Express) │
│  (Next.js 15)      │          │  - Public routes (no auth)     │
└───────────────────┘          │  - CMS routes (JWT + RBAC)      │
                                └───────────┬─────────────────────┘
                                            │
                     ┌──────────────────────┼───────────────────────┐
                     ▼                      ▼                       ▼
              ┌─────────────┐        ┌─────────────┐        ┌──────────────┐
              │  MongoDB    │        │  Cloudinary  │        │ Redis (cache │
              │  (Atlas)    │        │  (media CDN) │        │ + rate-limit)│
              └─────────────┘        └─────────────┘        └──────────────┘
```

One backend, two API surfaces (`/api/*` public, `/api/cms/*` protected), one database. This is a **modular monolith**, not microservices.

### 1.2 Architecture Pattern Decision

| Requirement | This project |
|---|---|
| Team size | 1–2 developers |
| Domain boundaries | Well understood (4 content modules + contact) |
| Deployment | Single deploy unit acceptable |
| Scaling needs | Uniform (read-heavy public API) |

**Decision: Modular Monolith with layered (clean-ish) architecture** — not microservices, not full hexagonal/DDD. Reason: a portfolio site with one writer (the site owner via CMS) and many anonymous readers has no team-boundary or independent-scaling pressure that would justify microservice overhead. The module boundaries are enforced at the **code level** (folder-per-module, no cross-module imports of internals), so extraction into a service later is possible without a rewrite.

### 1.3 Layering (per module)

```
Route  →  Controller  →  Service  →  Repository  →  Mongoose Model
(HTTP)    (req/res,       (business     (data          (schema,
           validation      logic,        access,        indexes)
           trigger)        orchestration) queries only)
```

- **Route**: declares HTTP verb/path, attaches middleware (auth, validation, rate-limit).
- **Controller**: thin. Parses request, calls service, shapes HTTP response. No business logic.
- **Service**: business logic, orchestration across repositories, cache reads/writes, no knowledge of `req`/`res`.
- **Repository**: only place that talks to Mongoose. Services never import a Model directly.
- **Model**: Mongoose schema + indexes + statics.

Dependency direction is strictly inward (Route → Controller → Service → Repository). Nothing below the Service layer knows about Express. This gives you the testability benefit of clean architecture without the ceremony of full hexagonal ports/adapters, which would be overkill here.

---

## 2. Tech Stack (as specified)

| Layer | Choice | Notes |
|---|---|---|
| Runtime | Node.js (LTS) | |
| Framework | Express.js | |
| Database | MongoDB (Atlas) | Document model fits variable CMS content (blog blocks, project galleries) |
| ODM | Mongoose | Schema validation + middleware hooks |
| Auth | JWT (access + refresh) | CMS only; public API is unauthenticated |
| Media | Cloudinary | Signed uploads, transformations, CDN delivery |
| Cache | Redis | Public GET caching + rate-limit store |
| Validation | Zod | Colocated per module, shared primitives |
| Logging | Pino | Structured JSON, request-id correlation |
| API style | REST | Matches the README's recommended endpoints exactly |

**Database selection rationale** (per standard SQL vs NoSQL decision criteria): content is document-shaped and schema evolves per module (blog `blocks[]` is a discriminated-union array, project galleries vary in size), read:write ratio is extremely read-heavy, and there is no need for cross-collection ACID transactions except in the Media Library cleanup job (which Mongoose sessions cover). MongoDB is the correct choice here — this matches the stack already specified, not an alternative recommendation.

---

## 3. Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts                # validated env vars (zod)
│   │   ├── db.ts                 # mongoose connection
│   │   ├── redis.ts
│   │   ├── cloudinary.ts
│   │   └── constants.ts          # enums: categories, roles, block types
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   └── auth.validation.ts
│   │   ├── users/                # Users, Roles, Permissions (CMS)
│   │   ├── home/                 # GET /api/home + CMS home content
│   │   ├── skills/                # Skills categories + Currently Learning
│   │   ├── projects/              # Public list/detail/related + CMS CRUD
│   │   ├── blog/                  # Public listing/detail/related + CMS block editor
│   │   ├── experience/            # [NEW] CMS timeline module
│   │   ├── about/                 # [NEW] CMS about-page module
│   │   ├── contact/               # Contact info, contact form, meeting requests
│   │   ├── media/                 # Cloudinary upload + Media Library
│   │   ├── seo/                   # [NEW] per-page SEO overrides
│   │   └── settings/              # [NEW] site-wide settings singleton
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts     # verifies JWT
│   │   ├── rbac.middleware.ts     # checks permission for route
│   │   ├── validate.middleware.ts # zod schema runner
│   │   ├── rateLimit.middleware.ts
│   │   ├── errorHandler.middleware.ts
│   │   ├── requestId.middleware.ts
│   │   └── notFound.middleware.ts
│   │
│   ├── common/
│   │   ├── AppError.ts
│   │   ├── asyncHandler.ts
│   │   ├── apiResponse.ts         # { data, meta } / { error, meta } envelope
│   │   ├── pagination.ts          # shared page/pageSize helpers
│   │   └── slugify.ts
│   │
│   ├── jobs/
│   │   ├── readTimeCalculator.ts  # runs on blog save
│   │   ├── cacheInvalidator.ts    # runs on publish/update
│   │   └── orphanedMediaSweeper.ts
│   │
│   ├── app.ts                     # express app, middleware wiring
│   └── server.ts                  # http server bootstrap
│
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── package.json
└── tsconfig.json
```

**Rule enforced across the codebase:** a module may only import another module's `*.service.ts` (never its repository or model directly). This is the boundary that keeps this a *modular* monolith rather than a ball of mud, and it's what makes future extraction to a separate service (if e.g. Blog ever needs independent scaling) a low-risk move.

---

## 4. Authentication & Authorization

### 4.1 Scope of Auth

The **public API has no authentication** — every `GET /api/*` route the frontend calls today (home, projects, blog, contact info) stays open, matching the README exactly. Only the **CMS API** (`/api/cms/*`) requires auth.

### 4.2 Authentication Flow

- `POST /api/cms/auth/login` — email + password → access token (JWT, 15 min expiry) + refresh token (httpOnly, secure cookie, 30 days).
- `POST /api/cms/auth/refresh` — rotates refresh token, issues new access token.
- `POST /api/cms/auth/logout` — invalidates refresh token (stored hash in `users` collection or a `refreshTokens` collection for multi-device revocation).
- Passwords hashed with bcrypt (cost factor 12).
- Access tokens signed with `HS256` (single-service backend; `RS256` only pays off with multiple verifying services, which doesn't apply here).
- Account lockout after 5 failed attempts within 15 minutes (Redis counter).

### 4.3 Authorization — RBAC

**[NEW — not in frontend contract, but required by "Users / Roles / Permissions" CMS modules in the brief]**

- **Current Design:** none — no backend exists yet.
- **Issue:** the brief asks for a CMS with Users, Roles, and Permissions as distinct modules, implying more than one CMS operator eventually (the owner today, possibly a collaborator or VA later).
- **Recommendation:** a `roles` collection with a permission matrix (`module` × `action`), and `users` reference a `roleId`. Ship with three seeded roles:

| Role | Permissions |
|---|---|
| `SUPER_ADMIN` | all modules, all actions, including Users/Roles/Settings |
| `EDITOR` | create/read/update/publish on Home, Projects, Blog, Skills, Experience, About, Media; **no** access to Users, Roles, Settings |
| `VIEWER` | read-only across all CMS modules (for stakeholders who want to preview drafts) |

- **Reason:** a hardcoded 2-role system would need a schema migration the moment a second collaborator is added. A data-driven permission matrix costs almost nothing extra now and avoids that migration later.

Middleware: `rbac.middleware.ts` reads `req.user.role.permissions`, checks `(module, action)` against the route's declared requirement, 403s otherwise.

---

## 5. Database Architecture

### 5.1 Collections Overview

| Collection | Type | Maps to CMS module | Maps to public endpoint |
|---|---|---|---|
| `homeContent` | Singleton | Home | `GET /api/home` (hero + cta labels only — see §5.3) |
| `skillsContent` | Singleton | Skills | embedded in `GET /api/home`, and `GET /api/skills` if needed standalone |
| `projects` | Collection | Projects | `GET /api/projects`, `GET /api/projects/:slug`, `GET /api/projects/:slug/related` |
| `blogArticles` | Collection | Blogs | `GET /api/blogs`, `GET /api/blogs/:slug` |
| `experience` | Collection | Experience | *(not yet consumed by frontend)* |
| `aboutContent` | Singleton | About | *(not yet consumed by frontend)* |
| `contactContent` | Singleton | Contact | `GET /api/contact` |
| `contactMessages` | Collection | Contact → Meeting Requests / Messages | `POST /api/contact/messages` |
| `meetingRequests` | Collection | Meeting Requests | `POST /api/contact/meeting-requests` |
| `mediaAssets` | Collection | Media Library | (CMS only; public consumes via Cloudinary URL) |
| `seoOverrides` | Collection | SEO | *(not yet consumed by frontend)* |
| `settings` | Singleton | Settings | selectively exposed (e.g. business hours inside `/api/contact`) |
| `users` | Collection | Users | CMS auth only |
| `roles` | Collection | Roles / Permissions | CMS auth only |
| `refreshTokens` | Collection | (internal) | CMS auth only |
| `auditLogs` | Collection | (internal, Settings → Activity) | CMS only |

**Why singletons for Home/Skills/About/Contact/Settings:** these are "one row of site-wide content," not repeatable entities — there is exactly one hero, one skills panel, one contact page. Modeling them as a collection with a single document (enforced by a fixed, hardcoded `_id: "singleton"`) avoids the awkwardness of an array-with-one-item and gives the CMS simple "load/save" semantics instead of list/create/delete semantics that don't apply.

**Why `projects` and `blogArticles` are true collections:** these are repeatable, independently orderable, filterable, paginated entities — exactly what the README's list/detail/query contracts describe.

### 5.2 Schema Sketches

These are conceptual field groupings, not Mongoose code (per the "no models" instruction). Field names, types, validation ranges, and required/optional status for Home/Projects/Blog/Contact are **exactly as defined in the README's field-by-field contract** — this section only adds the fields the README doesn't cover (CMS/internal bookkeeping) and groups things by collection.

**`projects` document**
- All fields from README §"Project List Item Fields" + §"Complete Recommended Project Detail Response" (`id` is the Mongo `_id` stringified or a separate stable slug-safe id — recommend keeping `_id` as the canonical `id` to avoid dual-identifier drift).
- `+ isFeatured: boolean` (drives the Home `featuredProjects` and `?featured=true` query already in the README's query contract)
- `+ publishStatus: 'draft' | 'published'` (CMS-only; public API only ever returns `published`)
- `+ createdAt / updatedAt` (Mongoose timestamps; `lastUpdatedAt` in the public contract maps to `updatedAt`)
- `+ createdBy / updatedBy` (ref → `users`, for CMS audit trail)

**`blogArticles` document**
- All fields from README §"Blog Listing Field Contract" + §"Complete Recommended Blog Details Response", including the embedded `blocks[]` array with its discriminated `type` field exactly as enumerated in the README (`heading`, `paragraph`, `image`, `gallery`, `video`, `code`, `quote`, `divider`, `callout`, `table`, `bullet-list`, `numbered-list`, `checklist`, `pdf`, `docx`, `ppt`, `zip`, `github-link`, `live-demo`, `documentation`, `research-paper`, `youtube`, `google-drive`, `button`, `markdown`).
- `+ publishStatus: 'draft' | 'published'`
- `+ readTimeMinutes` is **computed and stored** at save-time by the `readTimeCalculator` job (README explicitly recommends this: "compute during publish or save, not during every page request").
- `blocks[]` stays **embedded**, not a separate collection — block count per article is small and bounded (tens, not thousands), always read/written as a whole document, and the frontend's discriminated-union renderer expects one ordered array. Normalizing it would add joins for no benefit.

**`skillsContent` document (singleton)**
- `categories: [{ id, title, items: string[], orderIndex }]`
- `learningItems: [{ id, label, icon, progressPercent, orderIndex }]`
- Matches README §Skills and §Currently Learning exactly; `orderIndex` added so CMS drag-reorder has something to persist (README notes the frontend currently uses array index for the icon, which is a frontend improvement item, not a backend concern).

**`contactContent` document (singleton)**
- Exactly the shape in README §"Complete Recommended Contact Information Response": `hero`, `contact` (email/phone/location/resume/availability/businessHours), `communicationMethods[]`, `socialLinks[]`.

**`meetingRequests` document**
- Exactly the README §"Meeting Request Contract" payload fields, `+ status: 'received' | 'reviewed' | 'scheduled' | 'declined'`, `+ ipAddress`, `+ userAgent` (README's own spam-prevention recommendation), `+ createdAt`.

**`contactMessages` document**
- Exactly the README §"Contact Form Contract" payload fields, `+ status: 'received' | 'read' | 'archived'`, `+ ipAddress`, `+ userAgent`, `+ createdAt`.

**`experience` document [NEW]**
- **Current Design:** none.
- **Issue:** brief lists "Experience" as a required CMS module; no frontend page consumes it yet.
- **Recommendation:** `{ id, role, company, location, startDate, endDate | null (current), description, techTags: string[], orderIndex, publishStatus }`.
- **Reason:** mirrors the shape every portfolio "work history" timeline needs, and matches the tagging/tech-stack conventions already established in `projects`.

**`aboutContent` document (singleton) [NEW]**
- **Recommendation:** `{ bio (rich text/blocks, reuse the blog block schema for consistency), profileImage, resumeUrl, highlights: string[] }`.
- **Reason:** reusing the blog `blocks[]` shape here (rather than inventing a second rich-content format) means one block-rendering component on the frontend eventually covers both Blog and About — a deliberate consistency choice, flagged here for the frontend team's awareness even though it's not required by the current contract.

**`seoOverrides` document [NEW]**
- `{ pagePath, metaTitle, metaDescription, ogImageUrl, canonicalUrl }`, one per route that needs an override; falls back to `settings.seo` defaults.

**`settings` document (singleton) [NEW]**
- Site-wide: SEO defaults, contact form settings (recipient email, allowed subjects, spam protection toggles), scheduling settings (available days/hours, meeting durations, approval-workflow copy) — these are the exact groupings the README's own §"Contact CMS Structure" and §"Blog CMS Structure" call for under "Settings" and "Form Settings"/"Scheduling Settings".

**`users` / `roles` / `refreshTokens` / `auditLogs`**
- Standard CMS auth bookkeeping as described in §4.

### 5.3 Relationships

This system deliberately has **almost no foreign-key style relationships** between content collections, because the read pattern is "give me everything this page needs in one call" (the README's own recommendation for Home: "Use one API... reduces request overhead").

- **Featured Projects on Home** → not a reference; the Home service queries `projects` where `isFeatured: true`, ordered by `orderIndex`, limited to 3. No join needed.
- **Related Projects / Related Articles** → computed at read time (same `category`/`tags` overlap, excluding current item, limited to 2–3), not stored as an explicit array of IDs. This avoids stale references when a related item is unpublished or deleted.
- **Previous/Next Project & Article** → computed from `orderIndex` (projects) / `publishedAt` (articles) at read time, not stored.
- **Media references** → `mediaAssets` documents store a `usedIn: [{ collection, documentId, field }]` array purely for the CMS Media Library's "where is this used" and orphan-detection features — this is metadata for the Media Library UI, not a data-integrity foreign key enforced by the database.
- **`users.roleId → roles._id`** is the one real reference in the system, since roles are genuinely a shared, reused entity across many users.

### 5.4 Indexes

| Collection | Index | Purpose |
|---|---|---|
| `projects` | `{ slug: 1 }` unique | Detail page lookup, README's `/projects/[slug]` route |
| `projects` | `{ publishStatus: 1, isFeatured: 1, orderIndex: 1 }` | Home featured query |
| `projects` | `{ publishStatus: 1, category: 1, orderIndex: -1 }` | Listing filter + sort |
| `projects` | text index on `title, tagline, techTags` | README's `search` query param |
| `blogArticles` | `{ slug: 1 }` unique | Detail page lookup |
| `blogArticles` | `{ publishStatus: 1, publishedAt: -1 }` | Listing sort, prev/next computation |
| `blogArticles` | `{ publishStatus: 1, category: 1 }` | Filter |
| `blogArticles` | text index on `title, excerpt, tags` | Search (if/when added to Blog listing, per parity with Projects) |
| `meetingRequests` | `{ email: 1, createdAt: -1 }` | Admin lookup, dedupe checks |
| `meetingRequests` | `{ status: 1, preferredDate: 1 }` | CMS dashboard queue view |
| `contactMessages` | `{ status: 1, createdAt: -1 }` | CMS inbox view |
| `mediaAssets` | `{ folder: 1, createdAt: -1 }` | Media Library browsing |
| `users` | `{ email: 1 }` unique | Login lookup |

---

## 6. Media Management — Cloudinary Strategy

- **Upload path:** the browser never talks to Cloudinary directly with a raw API secret. Backend issues a **signed upload signature** (`POST /api/cms/media/sign-upload`) with a short expiry; the CMS frontend uploads directly to Cloudinary using that signature (keeps large binaries off the Node process), then calls `POST /api/cms/media` with the returned `publicId`/`url`/metadata to persist a `mediaAssets` record.
- **Folder convention:** `portfolio/{module}/{yyyy}/{mm}/` (e.g. `portfolio/projects/2026/07/`) — keeps the Cloudinary dashboard navigable and mirrors the Media Library's own folder filter.
- **Transformations:** `f_auto,q_auto` on every delivery URL for automatic format/quality; named transformation presets for known slots (`thumbnail` 400×300, `hero` 1600×900, `gallery` 1200×800) so the frontend never has to hand-build transformation strings.
- **Reuse & orphan detection:** `mediaAssets.usedIn[]` is updated whenever a document field referencing a Cloudinary URL is saved (via a lightweight post-save hook per module). The `orphanedMediaSweeper` job (weekly) flags assets with an empty `usedIn[]` for manual review/deletion in the Media Library — never auto-deletes, to avoid destroying something referenced by external content (e.g. a `readmeMarkdown` string that hotlinks an image URL without a formal field reference).
- **Deletion:** CMS delete action calls Cloudinary's destroy API and removes the `mediaAssets` record in the same request; if Cloudinary destroy fails, the local record is kept and flagged `deleteFailed` for retry rather than silently orphaning the CDN asset.

---

## 7. Validation Strategy

- **Zod schemas colocated per module** (`*.validation.ts`), one schema per route (body/query/params validated separately).
- **Shared primitives** in `common/`: `slugSchema` (regex `^[a-z0-9]+(?:-[a-z0-9]+)*$`, matches README), `urlSchema` (absolute HTTPS), `paginationQuerySchema` (`page`, `pageSize` with the exact per-module min/max the README specifies — e.g. Projects `pageSize` max 20 vs the Home featured `limit` max 12 — these are **not** the same schema, they're parameterized).
- All string length/enum constraints (hero headline 10–60 chars, project title 3–48 chars, blog block `type` enum, etc.) are lifted **verbatim** from the README's field-by-field contract — this document does not restate them all; the validation schema is the executable version of that table.
- Server-side validation runs even though the frontend already validates (README explicitly calls this out for Contact and Meeting Requests) — never trust client input for a publicly reachable POST endpoint.

---

## 8. Error Handling

Standard envelope (matches conventional REST API practice for this stack):

```json
// Success
{ "data": { /* ... */ }, "meta": { "requestId": "..." } }

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [{ "field": "email", "message": "must be a valid email" }]
  },
  "meta": { "requestId": "..." }
}
```

- `AppError` class (`statusCode`, `code`, `details?`) thrown from services; a single `errorHandler.middleware.ts` catches everything (including unhandled Mongoose/Zod errors) and normalizes to the envelope above.
- `asyncHandler` wrapper removes repetitive try/catch in controllers.
- Standard status codes: `200/201/204` success, `400` validation, `401` unauthenticated, `403` unauthorized, `404` not found, `409` conflict (e.g. duplicate slug), `429` rate-limited, `500` unhandled.
- Public-facing errors **never** leak stack traces or raw Mongoose error text (README explicitly asks for this on Contact: "Avoid exposing raw email delivery errors to the UI").

---

## 9. Logging

- **Pino**, structured JSON, one line per request via `pino-http`, correlated by a `requestId` (UUID v4) generated per request and echoed in the `meta.requestId` response field — this is what ties a user-reported error back to a specific log line.
- Log levels: `debug` (dev only), `info` (request completed), `warn` (validation failures, rate-limit hits), `error` (5xx, uncaught exceptions).
- **Never log:** raw passwords, JWTs, Cloudinary secrets, full contact-form message bodies (PII minimization — log message length/id, not content).
- Production: ship stdout JSON logs to whatever the deploy target's log driver is (CloudWatch on AWS, or a hosted log service) — no in-app file logging, to keep the process stateless.

---

## 10. Security

- **Helmet** with CSP, HSTS, cross-origin policies enabled.
- **CORS** allowlist: the public portfolio origin and the CMS origin explicitly; no wildcard.
- **Rate limiting** (Redis-backed `express-rate-limit`):
  - General public API: 100 req / 15 min / IP.
  - `POST /api/contact/messages`, `POST /api/contact/meeting-requests`: 5 req / 15 min / IP (spam prevention, per README's own recommendation).
  - `POST /api/cms/auth/login`: 5 req / 15 min / IP + account-level lockout (see §4.2).
- **Input sanitization:** strip Mongo operator injection (`$`, `.` in keys) on all req.body/query before it reaches a query.
- **Honeypot field** on both public forms (hidden field that must stay empty; non-empty ⇒ silently 200 without persisting, per README's spam-prevention recommendation).
- **JWT:** short-lived access tokens, httpOnly+secure+sameSite refresh cookie, refresh-token rotation with reuse detection (if a used-and-rotated refresh token is replayed, revoke the whole token family).
- **Password policy:** bcrypt cost 12, minimum 12-character passwords enforced at signup/reset (CMS users are created by a `SUPER_ADMIN`, not self-registered — no public signup endpoint exists).
- **Audit log:** every CMS create/update/delete/publish action writes an `auditLogs` entry (`actor`, `action`, `collection`, `documentId`, `diff`, `timestamp`) — supports the "Settings → Activity" CMS need and basic accountability without full event sourcing.

---

## 11. Caching

- **Redis** cache for public `GET` endpoints only (`/api/home`, `/api/projects`, `/api/blogs`, `/api/contact`) — CMS routes are never cached (always fresh for the editor).
- **Key pattern:** `cache:public:{route}:{queryHash}` (e.g. `cache:public:projects:category=AI&page=1`).
- **TTL:** 5 minutes as a safety net, but the primary invalidation mechanism is **explicit**: the `cacheInvalidator` job runs on every publish/update/delete in Home, Projects, Blog, Skills, Contact, and busts the relevant cache keys immediately — so editors see instant updates without waiting for TTL expiry, while the TTL protects against a missed invalidation path.
- **HTTP caching headers:** `ETag` + `Cache-Control: public, max-age=60, stale-while-revalidate=300` on public GETs, enabling a CDN (e.g. Cloudflare in front of the API, or Next.js's own fetch cache) to absorb repeat traffic before it reaches the app server at all.

---

## 12. Pagination, Filtering, Searching

- **Projects listing:** `page`/`pageSize` (default 5, max 20) exactly as the README's query contract specifies, plus `category`, `search` (MongoDB text index), `sort` (`newest`/`oldest`/`az` → maps to `orderIndex desc/asc` or `title asc`), `featured` (boolean), `limit` (for the Home preview call, max 12, separate from listing `pageSize`) — implemented as **two separate query schemas** (`ProjectListQuerySchema` vs `FeaturedProjectsQuerySchema`) even though they hit the same repository method, because their validation ranges genuinely differ (README treats them as distinct use cases).
- **Blog listing:** offset pagination (`page`/`pageSize`), `category` filter, text search on `title/excerpt/tags` (parity feature — README doesn't specify a blog search param today, flagged as a nice-to-have, not required).
- Shared `paginate()` repository helper returns `{ items, hasNextPage, nextPage, total }` — the exact shape the README's Project List and Blog List responses expect.

---

## 13. Performance

- `lean()` on all read-only Mongoose queries (skip hydration cost for plain JSON responses).
- **Separate list vs. detail projections** — the repository's `findListItem` projection excludes `readmeMarkdown`, `projectStructure`, `gallery`, `architectureNotes`, etc. from the Projects list query (this is precisely the README's own "Final Recommendation" for Projects: avoid downloading long markdown/galleries on cards that don't render them). Same principle applied to Blog: listing projection excludes `blocks[]` entirely (README: "Do not send `blocks` to `/api/blogs`").
- `compression` middleware (gzip/brotli) on all responses.
- Mongoose connection pool sized for expected concurrency (default 10, tune under load test).
- Read-time calculation for blog articles happens **once, at save time**, not per-request (README's explicit recommendation).

---

## 14. Deployment

- **Containerized** (Dockerfile, multi-stage build: install → build TS → slim runtime image).
- **Target:** matches the tech already referenced in the site's own blog content (AWS EC2, Nginx reverse proxy, PM2 process manager) — Nginx terminates TLS and proxies to PM2-managed Node processes in cluster mode (one process per CPU core) for zero-downtime reloads.
- **Database:** MongoDB Atlas (managed, automated backups, network-restricted to the app server's IP/VPC).
- **CI/CD:** GitHub Actions — lint → typecheck → unit tests → integration tests (against an ephemeral Mongo via `mongodb-memory-server`) → build → deploy on merge to `main`.
- **Environment config:** all secrets via `.env` (never committed), validated at boot by a Zod-checked `env.ts` that fails fast on a missing/malformed var rather than surfacing a runtime error later.
- **Health check:** `GET /health` (liveness — process is up) and `GET /health/ready` (readiness — DB + Redis reachable) for the load balancer / process manager to act on.

---

## 15. Scalability

- App servers are **stateless** (JWTs, no server-side session store) — horizontal scaling is just adding more PM2/container instances behind the load balancer.
- MongoDB Atlas read scaling (read replicas) if/when public read traffic grows past what a single primary comfortably serves — the read-heavy access pattern here makes this the first scaling lever, well before considering microservices.
- Redis cache absorbs the majority of repeat public GETs before they ever hit Mongo.
- A message queue (BullMQ + Redis) is the natural next addition **only when** a genuinely async workload appears — e.g. email delivery for contact-form notifications, or the AI embedding generation in §16 — not needed for the current synchronous CRUD workload.

---

## 16. Future AI Integration

The README flags two forward-looking hooks that the frontend already has UI copy for but no backend behind: "Ask Project AI" (Projects detail sidebar) and the Skills module's own "RAG" / "AI" tags in Currently Learning.

**[NEW — explicitly future, not part of the current implementation phases]**

- **Recommendation:** a `projectEmbeddings` collection storing chunked, embedded text from each project's `readmeMarkdown`, `architectureNotes`, `challenges`, `solutions` — generated by a background job on publish/update, using MongoDB Atlas Vector Search (keeps the AI feature inside the existing database rather than adding a second vector-store dependency).
- A future `POST /api/projects/:slug/ask` endpoint would embed the visitor's question, run a vector similarity search scoped to that project's chunks, and pass the retrieved context + question to an LLM completion call, returning a grounded answer.
- **Reason for deferring:** this has no field in any current README contract (it's explicitly listed under "Fields That Should Not Come From Backend" today — "Ask Project AI suggested questions and placeholder" is still frontend-static copy). Building it now would be speculative; the schema above is documented so Codex doesn't design around a shape that would conflict with it later.

---

## 17. CMS Design — Module by Module

| CMS Module | Purpose | Backed by | Key CMS APIs |
|---|---|---|---|
| **Dashboard** | At-a-glance counts (draft/published projects & posts, unread messages, pending meeting requests) | Aggregation queries across `projects`, `blogArticles`, `contactMessages`, `meetingRequests` | `GET /api/cms/dashboard/summary` |
| **Home** | Edit hero copy + CTA labels; feature/unfeature/reorder projects for Home | `homeContent`, `projects.isFeatured` | `GET/PUT /api/cms/home` |
| **Projects** | Full CRUD, publish/unpublish, reorder, tech tags, gallery, README markdown, case study fields | `projects` | `GET/POST/PUT/DELETE /api/cms/projects`, `PATCH /api/cms/projects/reorder` |
| **Blogs** | Full CRUD, block editor (ordered `blocks[]`), publish/unpublish, tags, cover image | `blogArticles` | `GET/POST/PUT/DELETE /api/cms/blogs` |
| **Skills** | Edit categories + items, reorder; edit Currently Learning items + progress | `skillsContent` | `GET/PUT /api/cms/skills` |
| **Experience** [NEW] | CRUD timeline entries, reorder | `experience` | `GET/POST/PUT/DELETE /api/cms/experience` |
| **About** [NEW] | Edit bio blocks, profile image, resume URL | `aboutContent` | `GET/PUT /api/cms/about` |
| **Contact** | Edit contact info, availability, business hours, social links, communication methods | `contactContent` | `GET/PUT /api/cms/contact` |
| **Meeting Requests** | Inbox: view/filter by status/date, mark reviewed/scheduled/declined | `meetingRequests` | `GET /api/cms/meeting-requests`, `PATCH /api/cms/meeting-requests/:id/status` |
| **Media Library** | Browse/search/delete Cloudinary assets, see "used in" references | `mediaAssets` | `GET/DELETE /api/cms/media`, `POST /api/cms/media/sign-upload` |
| **SEO** [NEW] | Per-page meta title/description/OG image overrides | `seoOverrides` | `GET/POST/PUT/DELETE /api/cms/seo` |
| **Settings** | Site-wide SEO defaults, form/spam settings, scheduling settings | `settings` | `GET/PUT /api/cms/settings` |
| **Users** | Create/deactivate CMS users, assign role | `users` | `GET/POST/PATCH /api/cms/users` |
| **Roles/Permissions** | Edit the permission matrix per role (SUPER_ADMIN only) | `roles` | `GET/PUT /api/cms/roles` |
| **Media Upload** | (shared component used inside every module's editor, not a standalone page) | `mediaAssets` | Same as Media Library's sign-upload endpoint |

---

## 18. Codex Implementation Roadmap

> Each phase is meant to be handed to Codex as its own working session, building strictly on top of the previous phase. Do not start a phase until the previous phase's testing requirements pass.

### Phase 0 — Project Initialization
- **Objective:** bootstrap the repository, tooling, and base config so every later phase drops code into a working skeleton.
- **Modules to build:** `config/`, `common/` (AppError, asyncHandler, apiResponse), `app.ts`, `server.ts`, health check routes.
- **Dependencies:** none.
- **Order:** (1) package.json + TypeScript config, (2) env validation, (3) DB connection module, (4) Express app skeleton with helmet/cors/compression wired but no routes yet, (5) health check.
- **Expected outcome:** `npm run dev` boots a server that responds `200` on `/health` and `/health/ready` (with a real Mongo connection).
- **Testing requirements:** one integration test hitting `/health` and `/health/ready`.

### Phase 1 — Core Infrastructure
- **Objective:** the shared plumbing every module will reuse — error handling, logging, validation runner, pagination helper.
- **Modules to build:** `middlewares/errorHandler.middleware.ts`, `requestId.middleware.ts`, `notFound.middleware.ts`, `validate.middleware.ts`, `common/pagination.ts`, `common/slugify.ts`, Pino logger setup.
- **Dependencies:** Phase 0.
- **Order:** requestId → logger → errorHandler → validate middleware → pagination helper.
- **Expected outcome:** a deliberately-thrown test error returns the standardized `{ error: {...}, meta: {...} }` envelope with correct status code and a `requestId` that also appears in the log line.
- **Testing requirements:** unit tests for `AppError` → HTTP status mapping; integration test for a 404 route and a validation failure.

### Phase 2 — Authentication & Authorization
- **Objective:** stand up CMS login and RBAC before any content module needs to be protected.
- **Modules to build:** `modules/users/` (Users, Roles), `modules/auth/`.
- **Dependencies:** Phase 1.
- **Order:** `roles` schema + seed script (SUPER_ADMIN/EDITOR/VIEWER) → `users` schema + password hashing → login/refresh/logout → `auth.middleware` (JWT verify) → `rbac.middleware` (permission check) → seed one SUPER_ADMIN user via a one-time CLI script (never a public signup endpoint).
- **Expected outcome:** logging in returns a valid access+refresh token pair; a protected test route rejects missing/expired/insufficiently-privileged tokens with the correct 401/403.
- **Testing requirements:** integration tests for login success/failure, token refresh, lockout after repeated failures, and RBAC allow/deny per role.

### Phase 3 — Media Management
- **Objective:** Cloudinary integration and the Media Library, since every content module after this needs image upload.
- **Modules to build:** `config/cloudinary.ts`, `modules/media/`.
- **Dependencies:** Phase 2 (CMS auth protects media routes).
- **Order:** signed-upload-signature endpoint → `mediaAssets` schema → create/list/delete endpoints → `usedIn` tracking hook (stubbed until content modules exist to call it) → `orphanedMediaSweeper` job (implemented, scheduled but low-priority to run until later phases populate real usage data).
- **Expected outcome:** CMS can request a signed signature, upload directly to Cloudinary, and persist/browse/delete asset records.
- **Testing requirements:** unit test for signature generation; integration tests for CRUD on `mediaAssets` (mock Cloudinary SDK calls in tests).

### Phase 4 — Home Module
- **Objective:** first real public-facing content endpoint, and first CMS content editor.
- **Modules to build:** `modules/home/`.
- **Dependencies:** Phases 1–3.
- **Order:** `homeContent` singleton schema + seed → public `GET /api/home` (aggregates hero + featured projects placeholder + skills placeholder + latest articles placeholder — some sub-pieces will be empty until Phases 5–7 exist, that's expected) → CMS `GET/PUT /api/cms/home`.
- **Expected outcome:** `GET /api/home` returns the exact JSON shape in the README's "Complete Recommended JSON Response" for Home (with empty arrays for pieces not yet built).
- **Testing requirements:** contract test asserting the response shape matches the README field-by-field, including validation limits (headline 10–60 chars, etc.).

### Phase 5 — Skills Module
- **Objective:** categories + Currently Learning, feeding into the Home aggregation.
- **Modules to build:** `modules/skills/`.
- **Dependencies:** Phase 4 (Home service will call this module's service).
- **Order:** `skillsContent` schema + seed → CMS `GET/PUT /api/cms/skills` (with reorder) → wire into Home aggregation (replace the placeholder from Phase 4).
- **Expected outcome:** `GET /api/home` now returns real `skills` and `currentlyLearning` data.
- **Testing requirements:** integration test on CMS update reflecting immediately in the Home response (cache invalidation, once Phase 11 exists — until then, direct read is fine).

### Phase 6 — Projects Module
- **Objective:** the most complex content module — list, detail, related, previous/next, plus CMS CRUD with ordering and publish workflow.
- **Modules to build:** `modules/projects/`.
- **Dependencies:** Phase 3 (media for thumbnails/gallery), Phase 4 (Home featured integration).
- **Order:** schema (full detail fields) → repository with **separate list vs. detail projections** → public `GET /api/projects` (query contract: category/search/sort/page/pageSize/featured/limit) → public `GET /api/projects/:slug` → public `GET /api/projects/:slug/related` (computed by category overlap) → previous/next computed from `orderIndex` → CMS CRUD + reorder + publish/unpublish → wire `isFeatured` projects into Home aggregation.
- **Expected outcome:** all three "Complete Recommended ... Response" shapes for Projects in the README match exactly, including `hasNextPage`/`nextPage` pagination behavior.
- **Testing requirements:** integration tests per query param combination (category filter, search, each sort mode, pagination boundary at `hasNextPage: false`), plus a contract test against the README's JSON examples.

### Phase 7 — Blog Module
- **Objective:** listing/detail/related/prev-next with the block-based content editor, and the read-time calculation job.
- **Modules to build:** `modules/blog/`, `jobs/readTimeCalculator.ts`.
- **Dependencies:** Phase 3 (media for covers/block images), Phase 4 (Home latest-articles integration).
- **Order:** schema (with `blocks[]` discriminated union, exactly the type enum from the README) → repository with listing projection **excluding `blocks[]`** → public `GET /api/blogs` (featured + articles + total) → public `GET /api/blogs/:slug` (full article incl. blocks, related, prev/next) → `readTimeCalculator` triggered on save/publish → CMS CRUD with block editor endpoints (add/update/reorder/remove a block) → wire latest articles into Home aggregation.
- **Expected outcome:** blog detail response matches the README's block examples exactly for at least the block types demonstrated (`markdown`, `numbered-list`); the full type enum is supported by schema even if not all are demoed to the frontend yet.
- **Testing requirements:** integration tests per block type's field contract; test that `blocks[]` is absent from the listing response payload; test that `readTimeMinutes` is stored, not recomputed per request (assert it doesn't change between two reads without a save).

### Phase 8 — Experience & About Modules [NEW]
- **Objective:** fill out the remaining CMS-only modules the brief lists that the frontend doesn't consume yet.
- **Modules to build:** `modules/experience/`, `modules/about/`.
- **Dependencies:** Phase 3 (media), Phase 7 (About reuses the blog block schema for its bio content).
- **Order:** `experience` schema + CRUD + reorder → `aboutContent` singleton + CRUD (reusing block editor endpoints from Blog where possible).
- **Expected outcome:** CMS can fully manage both modules even with no public consumer yet; document clearly that no public route exists for these until the frontend adds pages for them.
- **Testing requirements:** CRUD integration tests only (no contract test possible — no frontend contract exists yet).

### Phase 9 — Contact Module
- **Objective:** contact info display, contact form, and meeting request submission with spam protection.
- **Modules to build:** `modules/contact/`.
- **Dependencies:** Phases 1–3.
- **Order:** `contactContent` singleton + seed → public `GET /api/contact` → `contactMessages` schema + public `POST /api/contact/messages` (honeypot + rate limit + validation) → `meetingRequests` schema + public `POST /api/contact/meeting-requests` (same protections) → CMS `GET/PUT /api/cms/contact` + CMS inbox endpoints for messages/meeting requests with status updates.
- **Expected outcome:** all four request/response shapes in the README's Contact section match exactly, including the short, non-echoing success responses (`{ id, status, message }`).
- **Testing requirements:** integration tests for honeypot rejection, rate-limit triggering on rapid submission, and validation boundaries (message 20–2000 chars, etc.).

### Phase 10 — SEO & Settings [NEW]
- **Objective:** site-wide settings and per-page SEO overrides.
- **Modules to build:** `modules/seo/`, `modules/settings/`.
- **Dependencies:** Phase 2 (CMS auth).
- **Order:** `settings` singleton + seed defaults → CMS `GET/PUT /api/cms/settings` → `seoOverrides` CRUD → wire `settings.seo` defaults as fallback wherever a page-level SEO override is missing (relevant once the frontend starts rendering `<head>` meta from these — flagged as forward-looking, same as §16).
- **Expected outcome:** CMS can manage both without breaking any existing public contract (neither is currently consumed by the frontend).
- **Testing requirements:** CRUD integration tests.

### Phase 11 — Caching & Performance
- **Objective:** add the Redis caching layer and invalidation hooks across all public GET endpoints built so far.
- **Modules to build:** `config/redis.ts`, `jobs/cacheInvalidator.ts`, caching middleware applied to Home/Projects/Blog/Contact public routes.
- **Dependencies:** Phases 4, 6, 7, 9 (all public content endpoints must exist first).
- **Order:** Redis connection → generic cache-read/cache-write middleware → apply to each public GET route → hook `cacheInvalidator` into every CMS publish/update/delete action across Home/Projects/Blog/Skills/Contact.
- **Expected outcome:** repeat identical public GET requests are served from Redis (verifiable via a response header like `X-Cache: HIT`); a CMS update is reflected on the public endpoint within the same request cycle (no stale-cache window).
- **Testing requirements:** integration test asserting cache hit on 2nd identical request and cache bust immediately after a CMS write.

### Phase 12 — Security Hardening & Observability
- **Objective:** close the loop on production-readiness — apply rate limits everywhere per §10, finalize structured logging, add audit logging.
- **Modules to build:** `middlewares/rateLimit.middleware.ts` (applied per §10's table), `modules/auditLogs` (or embedded into the common layer), input sanitization middleware.
- **Dependencies:** all prior phases (rate limits and audit logs apply across every module).
- **Order:** sanitize-input middleware globally → rate-limit middleware applied per-route per §10 → audit log write on every CMS mutating action → helmet/CORS review pass across all routes.
- **Expected outcome:** hitting the contact/meeting-request/login endpoints past their limits returns `429`; every CMS write produces an `auditLogs` entry.
- **Testing requirements:** integration tests for each rate limit threshold; test that an audit log entry exists after a sample CMS mutation.

### Phase 13 — Testing Pass
- **Objective:** consolidate test coverage across all modules before deployment work begins.
- **Modules to build:** none new — fills gaps in `tests/unit` and `tests/integration`.
- **Dependencies:** all prior phases.
- **Order:** audit existing test coverage per module → fill gaps, prioritizing the public contract endpoints (Home/Projects/Blog/Contact) since those are the ones an external frontend depends on exactly matching.
- **Expected outcome:** CI pipeline (to be built in Phase 14) has a real test suite to run.
- **Testing requirements:** this phase *is* the testing requirement — target meaningful coverage on services and repositories, not just controllers.

### Phase 14 — Deployment & CI/CD
- **Objective:** ship it.
- **Modules to build:** `Dockerfile`, `.github/workflows/ci.yml`, deployment scripts/docs for the AWS EC2 + Nginx + PM2 target described in §14.
- **Dependencies:** Phase 13 (need a passing test suite for CI to gate on).
- **Order:** Dockerfile → GitHub Actions pipeline (lint/typecheck/test/build) → Nginx config + PM2 ecosystem file → deployment runbook (environment variables, Atlas connection, Cloudinary keys, first-deploy seed script for roles/settings/homeContent/contactContent singletons).
- **Expected outcome:** a merge to `main` runs the full pipeline and deploys automatically (or produces a ready-to-run deploy artifact, depending on infra access at the time).
- **Testing requirements:** a successful CI run end-to-end; a manual smoke test against the deployed `/health/ready` and one real public endpoint.

### Phase 15 — AI Integration (Future, not scheduled)
- **Objective:** deferred; see §16. Not to be started until explicitly requested — documented here only so earlier phases don't design against it by accident.

---

## 19. Codex Implementation Prompts

Each prompt below is meant to be pasted to Codex as the opening instruction for that phase's session. Every prompt explicitly anchors Codex back to this document and forbids re-deriving the API contract from scratch.

---

**Prompt — Phase 0: Project Initialization**

> You are implementing Phase 0 of the backend described in `Backend-Architecture-Specification.md`. Build only what Phase 0 in §18 specifies: repo scaffolding, TypeScript config, the folder structure in §3, env validation (`config/env.ts`, Zod-checked, fail-fast on boot), MongoDB connection (`config/db.ts`), and a minimal Express app (`app.ts`/`server.ts`) with helmet/cors/compression wired but zero business routes. Add `GET /health` (liveness) and `GET /health/ready` (checks Mongo connectivity). Do not implement any content module, auth, or media logic yet — those are later phases. Write one integration test per health endpoint. Do not deviate from the folder structure in §3 of the architecture document.

---

**Prompt — Phase 1: Core Infrastructure**

> Building on Phase 0 (do not modify what already exists except where necessary to wire in new middleware), implement Phase 1 from §18: `requestId.middleware.ts`, Pino logger, `errorHandler.middleware.ts` (using the `AppError` class and response envelope defined in §8), `notFound.middleware.ts`, `validate.middleware.ts` (runs a Zod schema against `req.body`/`query`/`params`), and shared helpers `common/pagination.ts` and `common/slugify.ts`. The error envelope must exactly match §8's JSON shape. Add a temporary test-only route that throws a sample `AppError` to prove the error handler produces the correct envelope and status code, then remove it once the test asserting this behavior is in place. Add unit tests for `AppError`→status mapping and integration tests for a 404 and a validation failure.

---

**Prompt — Phase 2: Authentication & Authorization**

> Building on Phases 0–1, implement Phase 2 from §18: the `roles` and `users` collections, RBAC permission matrix per §4.3 (seed `SUPER_ADMIN`, `EDITOR`, `VIEWER`), bcrypt password hashing (cost 12), and the `modules/auth/` login/refresh/logout endpoints under `/api/cms/auth/*` exactly as described in §4.2 (15-min access token, 30-day httpOnly refresh cookie, refresh-token rotation with reuse detection, Redis-backed lockout after 5 failed attempts/15 min). Implement `auth.middleware.ts` (JWT verify) and `rbac.middleware.ts` (permission check against `(module, action)`). Provide a one-time CLI seed script that creates a single `SUPER_ADMIN` user from env vars — there is no public signup endpoint, per §4.1. Write integration tests for login success/failure, lockout, refresh rotation, and RBAC allow/deny per role.

---

**Prompt — Phase 3: Media Management**

> Building on Phases 0–2, implement Phase 3 from §18: Cloudinary config (`config/cloudinary.ts`), the `mediaAssets` schema from §5.2, a signed-upload-signature endpoint (`POST /api/cms/media/sign-upload`, protected by auth+RBAC), and CRUD/list endpoints for the Media Library (`GET/DELETE /api/cms/media`) following the folder convention and transformation presets in §6. Implement the `usedIn[]` tracking field on the schema (the hook that populates it will be wired by later content-module phases — for now, expose it as a queryable field). Implement `jobs/orphanedMediaSweeper.ts` as a schedulable function (don't worry about the actual cron scheduler yet if none exists — stub the trigger). Mock the Cloudinary SDK in tests; write unit tests for signature generation and integration tests for the CRUD endpoints.

---

**Prompt — Phase 4: Home Module**

> Building on Phases 0–3, implement Phase 4 from §18: the `homeContent` singleton schema (fixed `_id`), seeded with the example data from the README's "Complete Recommended JSON Response" for Home. Implement public `GET /api/home` that aggregates: `hero` (from `homeContent`), `featuredProjects` (empty array placeholder — Phase 6 wires this), `skills`/`currentlyLearning` (empty placeholder — Phase 5 wires this), `latestArticles` (empty placeholder — Phase 7 wires this). Implement CMS `GET/PUT /api/cms/home` for hero + CTA labels. The response shape, field names, and validation ranges (headline 10–60 chars, highlightedHeadline 5–32, subheadline 40–220, CTA labels 2–20 chars) must match the README's Hero field-by-field contract exactly — do not invent different limits. Write a contract test asserting the full response shape against the README's JSON example (with empty arrays where noted).

---

**Prompt — Phase 5: Skills Module**

> Building on Phases 0–4, implement Phase 5 from §18: the `skillsContent` singleton schema (`categories[]`, `learningItems[]`, each with `orderIndex`) per §5.2, seeded from the README's example data. Implement CMS `GET/PUT /api/cms/skills` including a reorder capability for both `categories` and `learningItems`. Replace the empty `skills`/`currentlyLearning` placeholders in the Phase 4 Home aggregation service with real calls into this module's service (import only `skills.service.ts`, never its repository, per the module-boundary rule in §3). Write an integration test proving a CMS update to skills is reflected in a subsequent `GET /api/home` call.

---

**Prompt — Phase 6: Projects Module**

> Building on Phases 0–5, implement Phase 6 from §18 — this is the most involved content module. Build the `projects` schema per §5.2 with every field from the README's "Project List Item Fields" and "Complete Recommended Project Detail Response" sections, plus `isFeatured`, `publishStatus`, `createdBy`/`updatedBy`. Implement the repository with **two separate projections**: a list projection (excludes `readmeMarkdown`, `projectStructure`, `gallery`, `architectureNotes`, `challenges`, `solutions`, `learningOutcomes`, `architectureDiagramUrl`) and a detail projection (everything). Implement public routes: `GET /api/projects` (query params `category`, `search`, `sort`, `page`, `pageSize`, `featured`, `limit` — validated exactly per the README's Project Listing Query Contract, note that `pageSize` — max 20 — and `limit` — max 12 — are different parameters for different call sites and must use different Zod schemas), `GET /api/projects/:slug` (detail, plus computed `previousProject`/`nextProject` from `orderIndex`), `GET /api/projects/:slug/related` (computed by `category` overlap, excluding current, limited to 2–3). Implement CMS CRUD, reorder (`PATCH /api/cms/projects/reorder`), and publish/unpublish. Wire `isFeatured` projects into the Phase 4 Home aggregation, replacing that placeholder. Add the indexes listed in §5.4 for `projects`. Write integration tests for every query parameter combination and a contract test against all three "Complete Recommended ... Response" JSON examples in the README's Projects section.

---

**Prompt — Phase 7: Blog Module**

> Building on Phases 0–6, implement Phase 7 from §18. Build the `blogArticles` schema per §5.2, with the `blocks[]` embedded discriminated-union array supporting every `type` enumerated in the README (`heading`, `paragraph`, `image`, `gallery`, `video`, `code`, `quote`, `divider`, `callout`, `table`, `bullet-list`, `numbered-list`, `checklist`, `pdf`, `docx`, `ppt`, `zip`, `github-link`, `live-demo`, `documentation`, `research-paper`, `youtube`, `google-drive`, `button`, `markdown`) — implement the field contract for each block type exactly as specified in the README's "Block-Specific Field Contract" section. Implement `jobs/readTimeCalculator.ts`, triggered on save/publish, storing `readTimeMinutes` (never computed per-request). Implement the repository with a listing projection that **excludes `blocks[]` entirely** (per the README's explicit performance recommendation) and a detail projection that includes it. Implement public routes: `GET /api/blogs` (featured + articles + total), `GET /api/blogs/:slug` (full article, related articles by category/tag overlap limited to 2, previous/next computed from `publishedAt` order). Implement CMS CRUD including block-level add/update/reorder/remove endpoints. Wire latest articles into the Phase 4 Home aggregation. Add the indexes in §5.4. Write integration tests per block type and a test proving `blocks[]` is absent from the listing payload and that `readTimeMinutes` doesn't change between reads without a save.

---

**Prompt — Phase 8: Experience & About Modules**

> Building on Phases 0–7, implement Phase 8 from §18. Build the `experience` schema (`role`, `company`, `location`, `startDate`, `endDate | null`, `description`, `techTags[]`, `orderIndex`, `publishStatus`) with full CMS CRUD and reorder. Build the `aboutContent` singleton (`bio` as a `blocks[]` array reusing the exact block schema/types from the Blog module in Phase 7 — import the shared block validation, don't duplicate it), `profileImage`, `resumeUrl`, `highlights[]`, with CMS `GET/PUT /api/cms/about`. Neither module has a public consumer yet — do not invent a public route for them; build CMS-only CRUD and note clearly in code comments that these await a future frontend contract. Write CRUD integration tests only.

---

**Prompt — Phase 9: Contact Module**

> Building on Phases 0–8, implement Phase 9 from §18. Build the `contactContent` singleton per the README's "Complete Recommended Contact Information Response" shape exactly, seeded from that example. Implement public `GET /api/contact`. Build `contactMessages` and `meetingRequests` schemas per the README's respective payload contracts, plus `status`, `ipAddress`, `userAgent`. Implement public `POST /api/contact/messages` and `POST /api/contact/meeting-requests` with: server-side validation matching the README's field limits exactly, a honeypot field that silently no-ops on a filled value, and rate limiting per §10 (5 req/15 min/IP). Both success responses must match the README's short, non-echoing shape (`{ id, status, message }`) — never echo the submitted message content back. Implement CMS `GET/PUT /api/cms/contact` and CMS inbox endpoints (`GET /api/cms/messages`, `GET /api/cms/meeting-requests`, status-update PATCH endpoints for both). Write integration tests for honeypot rejection, rate-limit triggering, and field validation boundaries.

---

**Prompt — Phase 10: SEO & Settings**

> Building on Phases 0–9, implement Phase 10 from §18. Build the `settings` singleton (SEO defaults, form/spam settings, scheduling settings, per the groupings in §5.2 and the README's own "Contact CMS Structure"/"Blog CMS Structure" sections) with CMS `GET/PUT /api/cms/settings` (RBAC: `SUPER_ADMIN` only, per §4.3). Build `seoOverrides` CRUD (`GET/POST/PUT/DELETE /api/cms/seo`), one document per page path. Neither has a public consumer yet. Write CRUD integration tests.

---

**Prompt — Phase 11: Caching & Performance**

> Building on Phases 0–10, implement Phase 11 from §18. Add Redis (`config/redis.ts`). Build a generic cache-read/cache-write middleware and apply it to the public GET routes built in Phases 4, 6, 7, 9 (`/api/home`, `/api/projects*`, `/api/blogs*`, `/api/contact`), using the key pattern and TTL from §11. Build `jobs/cacheInvalidator.ts` and hook it into every CMS publish/update/delete action across Home, Projects, Blog, Skills, and Contact modules built in prior phases — do not touch the modules from Phase 8/10 since they have no public cache to invalidate. Add `ETag` and `Cache-Control` headers per §11. Write an integration test proving a cache hit on a repeated identical request (assert a response header like `X-Cache: HIT`) and immediate invalidation after a CMS write to the same content.

---

**Prompt — Phase 12: Security Hardening & Observability**

> Building on Phases 0–11, implement Phase 12 from §18. Add global input sanitization (strip `$`/`.` keys from `req.body`/`query`/`params`). Add `rateLimit.middleware.ts` applied per the exact thresholds in §10's table across every route built so far (general public API, contact/meeting endpoints, login). Add `auditLogs` writes on every CMS create/update/delete/publish action across all modules from Phases 4–10 (actor, action, collection, documentId, diff, timestamp). Do a full review pass of helmet/CORS config against §10. Write integration tests asserting `429` past each rate-limit threshold and an `auditLogs` entry existing after a sample CMS mutation in at least two different modules.

---

**Prompt — Phase 13: Testing Pass**

> Building on Phases 0–12, implement Phase 13 from §18. Audit existing test coverage across `tests/unit` and `tests/integration` for every module built so far. Prioritize filling gaps on the public contract endpoints (Home, Projects, Blog, Contact) since an external frontend depends on their response shapes matching the README exactly — for each, write or verify a contract test that diffs the actual response against the README's "Complete Recommended ... Response" JSON example field-for-field. Do not add new features in this phase; this phase is test coverage only.

---

**Prompt — Phase 14: Deployment & CI/CD**

> Building on Phases 0–13, implement Phase 14 from §18. Write a multi-stage `Dockerfile` (install → build TS → slim runtime). Write a GitHub Actions workflow (`.github/workflows/ci.yml`) running lint → typecheck → unit tests → integration tests (against `mongodb-memory-server`) → build, gating merges to `main`. Write an Nginx reverse-proxy config and a PM2 `ecosystem.config.js` (cluster mode, one worker per core) matching the AWS EC2 deployment target in §14. Write a deployment runbook documenting required environment variables, MongoDB Atlas setup, Cloudinary credentials, and the first-deploy seed sequence (roles → `SUPER_ADMIN` user → `homeContent`/`contactContent`/`skillsContent`/`settings` singletons). Do not add new application features in this phase.

---

## 20. Summary

This document specifies a **modular monolith** — Node.js/Express/MongoDB/Mongoose/JWT/Cloudinary, layered Route→Controller→Service→Repository→Model per module — that serves the exact public API contract already defined in the attached README (Home, Projects, Blog, Contact) plus the CMS modules the brief requires beyond what the frontend currently consumes (Experience, About, Users/Roles/Permissions, Media Library, SEO, Settings). No frontend redesign is proposed anywhere in this document; every deviation from the README is explicitly flagged **[NEW]** and justified. Codex should treat §18–19 as the literal execution order and should not skip, reorder, or merge phases without updating this document first.
