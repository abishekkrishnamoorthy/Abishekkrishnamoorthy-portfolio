# SEO Module — Architecture Plan & Codex Implementation Specification

**Project:** Abishek Portfolio (`portfolio-backend`, `next-portfolio-scaffold` / `frontend`, `portfolio-cms-frontend` / `cms-frontend`)
**Author role:** Senior Software Architect
**Source of truth:** `ABOUT_PROJECT.md` (uploaded, 1447 lines, code-inspection-derived)
**Deliverable type:** Architecture plan (Part B) + Codex-ready implementation specification (Part C)
**Explicit non-goal:** This document does not contain implementation code. Section-level "spec blocks" describe field names, types, endpoints, and file responsibilities so that a code-generation agent (Codex) can implement them — they are not runnable source.

---

## Document Control

| Field | Value |
|---|---|
| Status | Ready for Codex handoff |
| Scope | SEO module only (Global SEO, Page SEO, previews, sitemap, robots.txt, structured data, Open Graph, Twitter Cards, canonical URLs) |
| Out of scope | Auth, RBAC redesign, new CMS modules unrelated to SEO, redesign of unrelated pages, the pending "portfolio assistant" and "public experience" features, Nginx/SSL/PM2/infra work |
| Governing constraint | Reuse existing architecture exactly. Do not introduce new patterns where an existing one already fits. |
| Existing SEO surface found in codebase | `backend/src/modules/seo/` (model, service, controller implied by `seo.controller.ts`), `SeoOverride` Mongoose model, CMS "SEO" page under the Library navigation group, `/api/cms/seo` CRUD endpoints, RBAC permissions `seo:read` / `seo:create` / `seo:update` / `seo:delete` |
| Adjacent existing surface to extend | `Settings` singleton (already has a `seo` field), `settings.service.ts`, `settings.controller.ts`, `/api/cms/settings` endpoints, RBAC `settings:read` / `settings:update` |

---

# PART A — Understanding of the Existing Project

This section restates, in the architect's own words, what `ABOUT_PROJECT.md` establishes as ground truth. Every design decision in Part B and Part C is required to trace back to a fact in this section. Anything not confirmed by `ABOUT_PROJECT.md` is marked **Unknown** and treated as a risk, not an assumption.

## A.1 System shape

The product is three independently deployed applications sharing one MongoDB database through a single Express API:

- `backend/` — Express 4 + TypeScript (ESM) API. Mongoose 8 ODM. Zod validation. JWT auth with refresh-token rotation. RBAC via `cmsGuard(module, action)`. Optional Redis-backed public GET cache via `publicCache(ttlSeconds)`. Cloudinary media via signed uploads. Deployed to EC2 behind PM2.
- `frontend/` — Next.js 15.5 App Router, React 19, TypeScript, Tailwind CSS 4, TanStack React Query 5, Axios. Public-facing portfolio site. Deployed to EC2 behind PM2 (process `portfolio-frontend`).
- `cms-frontend/` — Vite 5 + React 18 SPA. React Router 6, TanStack React Query 5, Zustand, Axios, Radix UI primitives, React Hook Form + Zod, `@mdxeditor/editor` for rich content, `@dnd-kit` for drag/drop, Tailwind CSS 3 with `src/theme/tokens.css`. Deployed to S3 + CloudFront.

All three communicate only through the versioned REST surface `/api` (public) and `/api/cms` (protected). No GraphQL, no BFF layer, no `shared/` package exists.

## A.2 Backend module convention (must be followed exactly)

```text
src/modules/<module>/
├── <module>.model.ts        # Mongoose schema + model
├── <module>.repository.ts   # DB access functions
├── <module>.service.ts      # domain behavior, cache, media side effects
├── <module>.validation.ts   # Zod request schemas
└── <module>.controller.ts   # present for some modules (seo, settings, about, experience, auth, audit-log, dashboard)
```

A `seo` module folder **already exists** (`backend/src/modules/seo`) and a `settings` module folder **already exists** (`backend/src/modules/settings`). This SEO initiative is therefore an **extension of two existing modules**, not a new module.

## A.3 Existing SEO-relevant data model

### `SeoOverride` (existing)

- Purpose: page-specific SEO metadata override.
- Confirmed fields: `pagePath`, `metaTitle`, `metaDescription`, `ogImageUrl`, `canonicalUrl`.
- Confirmed consumer: CMS SEO module (`/api/cms/seo` list/create/update/delete).
- Confirmed gap: **"Public frontend runtime use: Unknown."** — i.e., nothing on the public site currently reads `SeoOverride` records. This is independently listed under Pending Features ("Public use of SEO override records is Unknown"), Technical Debt ("Decide whether SEO overrides should be consumed by public Next.js metadata"), and Future Roadmap ("Add public SEO override lookup and integrate it into Next.js metadata generation"). **This SEO initiative directly closes that gap** — it is not a speculative feature, it is a documented, prioritized backlog item.

### `Settings` (existing)

- Purpose: singleton settings container.
- Confirmed fields: `_id`, `seo`, `forms`, `scheduling`.
- The presence of an existing `seo` sub-field on the `Settings` singleton is the strongest signal in the codebase for where Global SEO belongs: **it already exists as a stub**, it is already reachable through `GET/PUT /api/cms/settings` (RBAC `settings:read` / `settings:update`), and it is already editable through an existing CMS "Settings" page. Its current shape (which fields, if any, are populated inside `seo`) is **Unknown** from the inspected output — Part C treats this as a schema-extension task, not a greenfield task.

### Public SEO surface today

- `frontend/src/app/layout.tsx` defines global metadata.
- Home, projects, blog, and contact pages have page-level metadata.
- Dynamic metadata for `/projects/[slug]` and `/blog/[slug]`: **Unknown**.
- No sitemap, no `robots.txt`, no structured data, no Open Graph/Twitter automation, no CMS-driven metadata on the public site were observed.

## A.4 Existing CMS conventions to reuse (mandatory reuse list)

| Concern | Existing asset | Location |
|---|---|---|
| Navigation | "Library" group already contains **Media** and **SEO** entries | `cms-frontend/src/components/layout/navigation.ts` |
| Forms | `FormField`, `FormSection`, `SaveButton`, `SlugInput`, `TagInput`, `DatePickerField` | `cms-frontend/src/components/form/` |
| Tables | existing table primitives | `cms-frontend/src/components/table/` |
| Media upload | `UploadDropzone`, `ImagePreview`, `MediaGrid`, signed-upload flow via `/api/cms/media/sign-upload` → direct Cloudinary upload → `POST /api/cms/media` | `cms-frontend/src/components/media/`, `backend/src/modules/media/` |
| Feedback | toast/confirm/skeleton primitives | `cms-frontend/src/components/feedback/` |
| Feature layering | `src/features/<module>/<module>.schema.ts` + `.service.ts` | `cms-frontend/src/features/seo/`, `cms-frontend/src/features/settings/` |
| API endpoint registry | single source of truth for all CMS calls | `cms-frontend/src/lib/api/endpoints.ts` |
| Response envelope handling | Axios interceptor unwrap + `ApiError` | `cms-frontend/src/lib/api/` |
| Route/permission guards | `RequireAuth`, `RequirePermission` | `cms-frontend/src/app/guards.tsx` |
| Public API layer | `src/services/*.service.ts`, `src/services/response.ts`, `src/services/mappers.ts` | `frontend/src/services/` |
| Typed env | `src/lib/env.ts` (reads only `NEXT_PUBLIC_*`) | `frontend/src/lib/env.ts` |
| Axios client | `src/lib/axios.ts` | `frontend/src/lib/axios.ts` |
| Public cache | `publicCache(ttlSeconds = 300)` middleware, Redis via `ioredis`, optional by `REDIS_URL` | `backend/src/middlewares/` |
| Cache invalidation pattern | services invalidate cache and sync media usage on write (e.g. `projectsService`, `mediaService`) | `backend/src/modules/*/**.service.ts` |
| Audit logging | `saveAndAudit` pattern used by CMS write routes | `backend/src/modules/auditLogs/` |
| Shared validators | slug, URL, HTTPS URL, date, email, phone | `backend/src/common/validation.ts` |
| Error handling | `AppError(statusCode, code, message, details?)`, Zod → 400 `VALIDATION_ERROR` | `backend/src/common/` |
| RBAC | `cmsGuard(module, action)`, permissions already include `seo:read/create/update/delete` and `settings:read/update` | `backend/src/middlewares/`, `Role` model |

**Design rule for this initiative:** every UI element, endpoint, and data-access pattern listed above must be reused as-is. No new generic UI primitive, no new Axios client, no new auth pattern, no new RBAC permission key is introduced unless Part A shows no existing equivalent.

## A.5 Known gaps this initiative is allowed to close (explicitly listed in `ABOUT_PROJECT.md`)

1. "Decide whether SEO overrides should be consumed by public Next.js metadata." (Technical Debt)
2. "Add public SEO override lookup and integrate it into Next.js metadata generation." (Future Roadmap)
3. No sitemap, robots.txt, or structured data exist yet (System/Frontend sections — absence, not explicit debt, but implied by "Better Google indexing" objective).

## A.6 Explicit "Unknown" items carried forward as risks

- Exact current shape of `Settings.seo` (may be empty object, may have partial fields).
- Whether `SeoOverride.pagePath` currently has a uniqueness constraint or contains duplicates.
- Exact React Query stale-time/cache defaults in `frontend/src/lib/query-client.ts`.
- Whether Next.js image optimization/remote patterns are configured for Cloudinary domains.
- Current dynamic metadata behavior (if any) on `/projects/[slug]` and `/blog/[slug]`.

Each is addressed with a concrete mitigation in Part B §11 (Risks) and a pre-flight verification step in Part C §8 (Roadmap).

---

# PART B — SEO Architecture Plan

## B.1 Objectives & Non-Goals

**Objectives** (verbatim from the brief, mapped to this codebase):

- Better Google indexing → sitemap.xml, robots.txt, canonical URLs, structured data.
- Better search appearance → Global + Page SEO titles/descriptions, Google Search Preview.
- Better social sharing → Open Graph + Twitter Card automation, Social Preview.
- CMS-controlled SEO → extend existing `Settings.seo` (Global) and `SeoOverride` (Page), both already CMS-editable collections.
- Future SEO edits without touching code → no code deploy required to change any SEO field; all fields are data, not config.

**Non-goals** (explicit, per brief and per "This is NOT an enterprise CMS" framing):

- No multi-locale/hreflang management in this phase.
- No manual JSON-LD editor — structured data is always generated, never hand-authored in the CMS.
- No separate Twitter Card editor — Twitter values are always derived from Open Graph values.
- No new authentication, RBAC permission keys, or user-facing modules.
- No redesign of CMS visual language, spacing, or component library.
- No image sitemap, news sitemap, or video sitemap in this phase (listed in Future Improvements, §B.18).

## B.2 Module Hierarchy

```text
SEO Module
├── Global SEO                     (extends Settings.seo — existing singleton)
│   ├── Website Name
│   ├── Site URL
│   ├── Default Meta Title
│   ├── Title Template
│   ├── Default Meta Description
│   ├── Default Author
│   ├── Default Robots
│   ├── Google Verification Code
│   ├── Default Open Graph Image   (Cloudinary, reused upload flow)
│   └── Default Favicon            (Cloudinary, reused upload flow)
│
├── Page SEO                       (extends SeoOverride — existing collection)
│   ├── Page Path (existing: pagePath)
│   ├── Meta Title (existing)
│   ├── Meta Description (existing)
│   ├── Canonical URL (existing)
│   ├── Robots (new)
│   ├── Open Graph Image (existing: ogImageUrl)
│   ├── Open Graph Title (new)
│   ├── Open Graph Description (new)
│   ├── Search (client-side, by URL/Title)
│   └── Filter (client-side, Indexed / Non-Indexed, derived from Robots)
│
├── Derived / Generated (no CMS editor, computed at request time)
│   ├── Open Graph (auto-filled from Meta Title/Description when empty)
│   ├── Twitter Cards (summary_large_image, derived from Open Graph)
│   ├── Structured Data (Person + Website, from Global SEO + existing About/Contact/Home content)
│   ├── Sitemap (Next.js native `app/sitemap.ts`)
│   └── robots.txt (Next.js native `app/robots.ts`)
│
└── Previews (CMS-only, presentational, no persistence)
    ├── Google Search Preview
    └── Social Preview
```

## B.3 Page / Route Inventory & SEO Applicability

| Route (public frontend) | SEO applicability | Page SEO override key (`pagePath`) |
|---|---|---|
| `/` | Global + Page | `/` |
| `/projects` | Global + Page | `/projects` |
| `/projects/[slug]` | Global + Page (per-project) + per-project fallback from `Project` fields | `/projects/{slug}` |
| `/blog` | Global + Page | `/blog` |
| `/blog/[slug]` | Global + Page (per-article) + per-article fallback from `BlogArticle` fields (note: `BlogArticle` already has "SEO fields" per `ABOUT_PROJECT.md` §Database — Part C §3.2 reconciles these with `SeoOverride`, do not duplicate) | `/blog/{slug}` |
| `/contact` | Global + Page | `/contact` |

`about` and `skills` are mentioned in the brief's example page list but do not exist as public routes today (`ABOUT_PROJECT.md` §Frontend Routing lists only `/`, `/projects`, `/projects/[slug]`, `/blog`, `/blog/[slug]`, `/contact`). The Page SEO editor is **not route-restricted** — it accepts any `pagePath` string — so no code change is required to support `about`/`skills` later; this is a data-only extension, consistent with "CMS controlled SEO... without touching code."

## B.4 Component Hierarchy

### B.4.1 CMS (`cms-frontend/src/features/seo/`)

```text
features/seo/
├── seo.schema.ts            # extend: add ogTitle, ogDescription, robots to page schema;
│                             #         add global-seo schema (siteName, siteUrl, defaultMetaTitle,
│                             #         titleTemplate, defaultMetaDescription, defaultAuthor,
│                             #         defaultRobots, googleVerificationCode,
│                             #         defaultOgImageUrl, defaultFaviconUrl)
├── seo.service.ts            # extend: existing override CRUD calls unchanged;
│                             #         add getGlobalSeo()/updateGlobalSeo() calling
│                             #         existing /api/cms/settings endpoints
├── seo.types.ts              # extend: PageSeoOverride, GlobalSeo TS interfaces
└── components/
    ├── SeoOverrideTable.tsx      # extend existing SEO list: add search input + Indexed/Non-Indexed filter
    ├── PageSeoFormDialog.tsx     # extend existing create/update dialog: add Robots, OG Title, OG Description
    ├── GlobalSeoForm.tsx         # new: single form bound to Settings.seo, reuses FormField/FormSection/SaveButton
    ├── SeoFieldGroup.tsx         # new: shared meta-title/meta-description fields with character counters
    │                             #      (used by both GlobalSeoForm and PageSeoFormDialog — avoids duplication)
    ├── GoogleSearchPreview.tsx   # new: presentational, live preview of title/URL/description
    └── SocialPreview.tsx         # new: presentational, live preview of image/title/description/domain
```

`pages/SeoPage.tsx` (existing CMS SEO route) gains two tabs: **Global** (renders `GlobalSeoForm`) and **Pages** (renders `SeoOverrideTable` + `PageSeoFormDialog`). Tabs are implemented with whatever existing tab/segmented-control primitive already exists in `components/ui/`; if none exists, a two-button toggle backed by local component state is acceptable — no new dependency.

### B.4.2 Public Frontend (`frontend/src/`)

```text
lib/seo/
├── resolveSeo.service.ts    # new: calls GET /api/seo/resolve?path=..., uses existing axios client + response unwrap
├── buildMetadata.ts         # new: maps ResolvedSeo -> Next.js Metadata object (title, description,
│                             #      canonical, openGraph, twitter)
└── structuredData.ts        # new: builds Person + WebSite JSON-LD objects from Global SEO +
                              #      existing HomeContent/AboutContent/ContactContent public data

components/seo/
└── JsonLd.tsx                # new: renders a single <script type="application/ld+json"> tag, XSS-safe
                              #      (JSON.stringify + no raw HTML injection)

app/
├── sitemap.ts                 # new: Next.js MetadataRoute.Sitemap generator
├── robots.ts                  # new: Next.js MetadataRoute.Robots generator
├── layout.tsx                 # extend: generateMetadata() uses resolveSeo("/") + renders <JsonLd> for WebSite/Person
├── page.tsx                   # extend: generateMetadata() uses resolveSeo("/")
├── projects/page.tsx           # extend: generateMetadata() uses resolveSeo("/projects")
├── projects/[slug]/page.tsx    # extend: generateMetadata(params) uses resolveSeo(`/projects/${slug}`)
│                                #        with fallback to Project.title/shortDescription/thumbnailUrl
│                                #        per existing "never return empty metadata" rule
├── blog/page.tsx                # extend: generateMetadata() uses resolveSeo("/blog")
├── blog/[slug]/page.tsx         # extend: generateMetadata(params) uses resolveSeo(`/blog/${slug}`)
│                                #        with fallback to BlogArticle title/excerpt/coverImageUrl
└── contact/page.tsx             # extend: generateMetadata() uses resolveSeo("/contact")
```

## B.5 Backend Integration

```text
backend/src/modules/seo/
├── seo.model.ts            # extend SeoOverride schema: add ogTitle?, ogDescription?, robots?
├── seo.repository.ts        # extend: add findByPagePathLean(), listPublicIndexablePaths()
├── seo.service.ts           # extend: add resolve(path), getGlobalSeo(), mergeWithFallback()
├── seo.validation.ts        # extend: add fields to create/update Zod schemas
└── seo.controller.ts        # extend: existing CMS handlers unchanged; add public handlers
                              #         (getGlobalSeoPublic, resolveSeoPublic, listSeoPagesPublic)

backend/src/modules/settings/
├── settings.model.ts        # extend Settings.seo sub-schema with the 10 Global SEO fields
├── settings.validation.ts   # extend Zod schema for the new seo.* fields
├── settings.service.ts      # extend: default-object fallback so GET never returns undefined seo
└── settings.controller.ts   # unchanged (existing GET/PUT already expose the whole Settings document)

backend/src/routes.ts        # extend: mount 3 new public routes under /api/seo
                              #   GET /api/seo/global
                              #   GET /api/seo/resolve
                              #   GET /api/seo/pages
                              # existing /api/cms/seo and /api/cms/settings routes: unchanged
```

No new module folder is created. No new model file is created. This is strictly additive to two existing modules, per the "reuse everything" mandate.

## B.6 Frontend Integration

- Next.js App Router's native `generateMetadata` export (already partially used per `ABOUT_PROJECT.md` §Frontend SEO) is the integration point for every route — this is the existing pattern, extended, not replaced.
- Next.js native `app/sitemap.ts` and `app/robots.ts` file conventions are used instead of hand-rolled XML/text responses from the backend. Rationale: the public frontend is already the layer responsible for all public-facing HTML/metadata; adding two more file-convention exports keeps SEO generation in one place and avoids a second content-type (`text/xml`, `text/plain`) surface on the Express API, which currently only returns the `{ data, meta }` JSON envelope. Introducing raw XML/text responses on the backend would break the "all successful backend responses use this envelope" convention (`ABOUT_PROJECT.md` §API Documentation) for no benefit, since Next.js can generate both natively from data the backend already exposes.
- `resolveSeo.service.ts` follows the exact shape of existing `frontend/src/services/*.service.ts` files: Axios call → `services/response.ts` envelope unwrap → typed return value.

## B.7 Database Impact

Two existing collections are extended. No new collections.

### `Settings.seo` (extend existing sub-document)

| Field | Type | Required | Notes |
|---|---|---|---|
| `siteName` | `string` | yes | e.g. "Abishek Krishnamoorthy" |
| `siteUrl` | `string` (https URL, reuse `httpsUrl` validator) | yes | e.g. `https://abishekkrishnamoorthy.online` — should default from `PUBLIC_SITE_ORIGIN`/`NEXT_PUBLIC_SITE_URL` at seed time, editable after |
| `defaultMetaTitle` | `string` | yes | fallback title when no page override and no template match |
| `titleTemplate` | `string` | yes | contains literal token `%page%`, e.g. `"%page% \| Abishek Krishnamoorthy"` |
| `defaultMetaDescription` | `string` | yes | |
| `defaultAuthor` | `string` | yes | used in structured data `Person.name` and `<meta name="author">` |
| `defaultRobots` | `string` (enum: `index,follow` \| `noindex,follow` \| `index,nofollow` \| `noindex,nofollow`) | yes | default `index,follow` |
| `googleVerificationCode` | `string` | no | rendered as `<meta name="google-site-verification">` when present |
| `defaultOgImageUrl` | `string` (Cloudinary secure URL) | no | set via reused upload flow |
| `defaultFaviconUrl` | `string` (Cloudinary secure URL) | no | set via reused upload flow; see B.16 caveat |

### `SeoOverride` (extend existing collection)

| Field | Type | Required | Status |
|---|---|---|---|
| `pagePath` | `string` | yes | existing — becomes the uniqueness/search key |
| `metaTitle` | `string` | no | existing |
| `metaDescription` | `string` | no | existing |
| `ogImageUrl` | `string` | no | existing |
| `canonicalUrl` | `string` | no | existing |
| `ogTitle` | `string` | no | **new** |
| `ogDescription` | `string` | no | **new** |
| `robots` | `string` (same enum as above) | no | **new** — empty means "inherit Global default"; doubles as the Indexed/Non-Indexed filter value, so no separate `status` field is introduced |

No `status` field is added because `robots` already encodes indexability, and adding a second field for the same concept would violate "Avoid unnecessary complexity."

## B.8 API Impact

All additions are additive and backward compatible. No existing endpoint's request or response shape changes in a breaking way.

### New public endpoints (mounted under `/api/seo`, unauthenticated, `publicCache`-eligible)

| Method | URL | Purpose | Response |
|---|---|---|---|
| GET | `/api/seo/global` | Return the merged/defaulted Global SEO object | Envelope with `GlobalSeo` |
| GET | `/api/seo/resolve?path=/projects/my-app` | Return merged Page + Global SEO for one path, with fallback applied server-side | Envelope with `ResolvedSeo` |
| GET | `/api/seo/pages` | Lightweight list of `{ pagePath, robots, updatedAt }` for all overrides, used by `sitemap.ts` | Envelope with `SeoPageSummary[]` |

### Existing endpoints — field-level extension only

| Method | URL | Change |
|---|---|---|
| POST/PUT `/api/cms/seo`, `/api/cms/seo/:id` | Accept optional `ogTitle`, `ogDescription`, `robots` in request body; RBAC unchanged (`seo:create`/`seo:update`) |
| GET/PUT `/api/cms/settings` | `seo` object in request/response gains the 10 Global SEO fields; RBAC unchanged (`settings:read`/`settings:update`) |

No RBAC permission keys are added. No new roles are added.

## B.9 UI Flow

### B.9.1 Editing Global SEO

1. Admin opens CMS → Library → SEO → **Global** tab.
2. `GlobalSeoForm` loads via `GET /api/cms/settings` (existing call, existing React Query key).
3. Admin edits fields; character counters (via `SeoFieldGroup`) show recommended-length guidance for Default Meta Title (≈50–60 chars) and Default Meta Description (≈150–160 chars) as non-blocking hints.
4. Admin uploads/replaces Default OG Image / Default Favicon via the existing `UploadDropzone` → Cloudinary signed upload → `POST /api/cms/media` flow (no URL text box, per brief).
5. `GoogleSearchPreview` and `SocialPreview` update live from form state (no network call).
6. Admin clicks the existing `SaveButton` → `PUT /api/cms/settings` (existing endpoint, extended payload).
7. On success: existing toast pattern fires; backend invalidates the `seo:global` and `seo:resolve:*` cache TTL (see B.15); CMS query cache is invalidated for the settings query key (existing pattern already used elsewhere, e.g. after project/blog writes).

### B.9.2 Editing Page SEO

1. Admin opens CMS → Library → SEO → **Pages** tab.
2. `SeoOverrideTable` loads via existing `GET /api/cms/seo`.
3. Admin searches by URL/Title (client-side filter over the already-fetched array) and/or filters Indexed/Non-Indexed (client-side, based on `robots` containing `noindex` or not).
4. Admin clicks "New" or a row's edit action → `PageSeoFormDialog` opens (reuses existing Modal/Drawer primitive).
5. Same character-counter fields (`SeoFieldGroup`) plus Robots select, Canonical URL, and OG image upload (reused Cloudinary flow).
6. `GoogleSearchPreview` + `SocialPreview` render live from dialog form state.
7. Duplicate-URL check: on submit, service checks `pagePath` uniqueness (see B.12) and duplicate-Meta-Title warning is shown client-side by comparing against the already-fetched list (soft warning, does not block submit).
8. Save → `POST` or `PUT /api/cms/seo` (existing endpoints, extended payload) → existing audit log entry is created (existing `saveAndAudit` pattern) → cache for that specific `pagePath`'s resolve entry is invalidated.

## B.10 Data Flow

```text
CMS admin edits Global SEO
  -> GlobalSeoForm (RHF + Zod)
  -> seo.service.updateGlobalSeo()
  -> PUT /api/cms/settings   (existing endpoint, extended validation)
  -> settings.controller -> settings.service.update()
  -> Settings.seo saved in MongoDB
  -> settings.service invalidates Redis keys: "seo:global"
     (TTL-based public cache is not scanned/pattern-deleted — see B.15 rationale)
  -> saveAndAudit() records the change (existing pattern)
  -> 200 { data: Settings, meta }

CMS admin edits Page SEO
  -> PageSeoFormDialog (RHF + Zod)
  -> seo.service.upsertOverride()
  -> POST/PUT /api/cms/seo (existing endpoints, extended validation)
  -> seo.controller -> seo.service.upsert()
  -> SeoOverride saved in MongoDB
  -> seo.service invalidates Redis key: `seo:resolve:${pagePath}`
  -> saveAndAudit() records the change
  -> 200 { data: SeoOverride, meta }

Public page request (Next.js server render)
  -> generateMetadata(path) in page.tsx/layout.tsx
  -> resolveSeo.service.ts -> GET /api/seo/resolve?path=<path>
  -> publicCache middleware checks Redis key `seo:resolve:<path>`
     - HIT  -> return cached ResolvedSeo
     - MISS -> seo.service.resolve(path):
         1. load SeoOverride by pagePath (may be null)
         2. load Settings.seo (Global, always present due to default object)
         3. merge with fallback rules (B.11)
         4. write to Redis with ttlSeconds
         5. return ResolvedSeo
  -> buildMetadata.ts maps ResolvedSeo -> Next.js Metadata
  -> Next.js renders <title>, <meta>, <link rel="canonical">, OG/Twitter tags
  -> JsonLd.tsx renders Person + WebSite structured data using Global SEO + existing
     HomeContent/AboutContent/ContactContent public payloads (already-fetched, no new call)

sitemap.ts / robots.ts (build-time or on-demand, Next.js native)
  -> fetch existing /api/projects, /api/blogs (published only, already public)
  -> fetch new /api/seo/pages (pagePath + robots only)
  -> compose MetadataRoute.Sitemap / MetadataRoute.Robots
  -> Next.js serves /sitemap.xml and /robots.txt natively
```

## B.11 Fallback Strategy

Per-field fallback, evaluated server-side in `seo.service.resolve(path)` so the frontend never has to re-implement merge logic and can never emit empty metadata:

```text
finalMetaTitle:
  Page SEO metaTitle present?
    -> apply Global titleTemplate, substituting "%page%" with Page SEO metaTitle
  else
    -> Global defaultMetaTitle (already a complete, human-authored title)

finalMetaDescription:
  Page SEO metaDescription present? -> use it
  else                              -> Global defaultMetaDescription

finalCanonicalUrl:
  Page SEO canonicalUrl present? -> use it
  else                           -> `${Global siteUrl}${path}`

finalRobots:
  Page SEO robots present? -> use it
  else                     -> Global defaultRobots
  else (Global default also unset, first-run safety net) -> "index,follow"

finalOgTitle:
  Page SEO ogTitle present? -> use it
  else                      -> finalMetaTitle

finalOgDescription:
  Page SEO ogDescription present? -> use it
  else                            -> finalMetaDescription

finalOgImageUrl:
  Page SEO ogImageUrl present? -> use it
  else                         -> Global defaultOgImageUrl
  else (still empty)           -> Unknown/omitted; buildMetadata.ts must render OG tags
                                   without an image rather than an empty string

finalAuthor:
  always Global defaultAuthor (no per-page author field — out of scope per brief)
```

Rule: **`seo.service.resolve()` must never return `null`/`undefined` for `finalMetaTitle`, `finalMetaDescription`, `finalCanonicalUrl`, or `finalRobots`.** The `Settings.seo` document is guaranteed non-empty because `settings.service.ts` returns a hard-coded default object (site name, generic description, `index,follow`) on first read if the singleton has never been saved — mirroring the existing pattern already used for other singletons (`HomeContent`, `ContactContent`, etc., which are always readable even before an admin edits them).

## B.12 Validation Strategy

All validation is Zod, split the same way the rest of the codebase splits it: CMS-side (`features/seo/seo.schema.ts`) mirrors backend-side (`backend/src/modules/seo/seo.validation.ts`, `backend/src/modules/settings/settings.validation.ts`), per the existing dual-validation convention.

| Rule | Layer | Behavior |
|---|---|---|
| `pagePath` required, must start with `/` | client + server | hard validation error |
| `pagePath` uniqueness | server (repository check before insert), client (submit-time duplicate check against fetched list) | server returns `AppError(409, "SEO_PAGE_PATH_CONFLICT", ...)`; client shows inline "already exists" error before submit when possible |
| `metaTitle` recommended length ≈50–60 chars | client only | non-blocking counter/warning color |
| `metaDescription` recommended length ≈150–160 chars | client only | non-blocking counter/warning color |
| `canonicalUrl`, `ogImageUrl`, `siteUrl`, `defaultOgImageUrl`, `defaultFaviconUrl` must be valid HTTPS URLs | client + server | reuse existing shared `httpsUrl` Zod validator from `backend/src/common/validation.ts`; CMS schema mirrors the same regex/rule |
| `robots` must be one of the 4 enum values (or empty for "inherit") | client + server | hard validation error if present but invalid |
| Duplicate Meta Title across pages | client only, soft warning | non-blocking — computed against the already-fetched override list; not enforced server-side (would require a full-collection scan on every write, disproportionate for portfolio scale) |
| Empty required Global fields (`siteName`, `siteUrl`, `defaultMetaTitle`, `titleTemplate`, `defaultMetaDescription`, `defaultAuthor`, `defaultRobots`) | server | hard validation error on `PUT /api/cms/settings` when the `seo` sub-object is present in the payload |
| `titleTemplate` must contain the literal substring `%page%` | client + server | hard validation error — prevents an admin from saving a template that silently drops the page title |

## B.13 SEO Generation Strategy

- **Open Graph:** never separately authored beyond the four optional override fields (`ogTitle`, `ogDescription`, `ogImageUrl`) — Section B.11 fallback guarantees OG title/description auto-fill from Meta Title/Description when left empty, exactly as specified ("If OG Title empty → Use Meta Title").
- **Twitter Cards:** always `summary_large_image`, always derived in `buildMetadata.ts` from the already-resolved OG values — no storage, no separate CMS UI, per brief §6.
- **Sitemap:** generated per-request (or ISR-cached) by `app/sitemap.ts`, combining static routes, published `Project` slugs (from existing `GET /api/projects`), published `BlogArticle` slugs (from existing `GET /api/blogs`), and any additional `SeoOverride.pagePath` entries whose `robots` does not contain `noindex` (from new `GET /api/seo/pages`). Future page paths automatically appear once a corresponding published `Project`/`BlogArticle` exists or a `SeoOverride` row is created — no code change needed, satisfying "Future pages" in the brief.
- **robots.txt:** generated by `app/robots.ts` from `NEXT_PUBLIC_SITE_URL` (existing env var) — `User-agent: *`, `Allow: /`, `Sitemap: <siteUrl>/sitemap.xml`. If any `SeoOverride.robots` for a currently-known static path is `noindex,*`, that path is added as a `Disallow` rule; page-level `noindex` for indexed-but-crawlable pages is still additionally emitted as a `<meta name="robots">` tag by `buildMetadata.ts` (belt-and-suspenders, matches how Google actually treats the two mechanisms).
- **Structured Data:** two JSON-LD objects only, per brief §9 ("No manual JSON editing"):
  - `Person` — built from `Global.defaultAuthor`, `Global.siteUrl`, and existing `ContactContent.socialLinks` / `AboutContent` fields (all already publicly fetched by the home/about-adjacent pages — no new public endpoint required for structured data itself).
  - `WebSite` — built from `Global.siteName` and `Global.siteUrl`.
  - Rendered once, in the root `layout.tsx`, via `<JsonLd>`012, not duplicated per page.
- **Canonical URLs:** always emitted (B.11 guarantees a value); override always wins over the computed default.

## B.14 Search & Filter (CMS Page SEO table)

- **Search** — by URL (`pagePath`) or Title (`metaTitle`): client-side substring filter over the array already returned by `GET /api/cms/seo`. No new query parameters on the backend endpoint. Rationale: `ABOUT_PROJECT.md` explicitly flags "Add pagination/filtering to CMS list endpoints where lists can grow" as a *general* future roadmap item, not a current requirement — for a personal portfolio's SEO override count (realistically dozens, not thousands), client-side filtering is correct today and does not block adding server-side search later without breaking the UI contract (the table component's search box is decoupled from where filtering happens).
- **Filter** — Indexed / Non-Indexed: client-side, `robots` field does not contain `noindex` → Indexed; contains `noindex` → Non-Indexed; empty `robots` (inheriting Global default) is classified using the currently-loaded Global default's own indexability.

## B.15 Cloudinary Integration

- Default OG Image and Default Favicon (Global SEO) and per-page OG Image (Page SEO) all reuse the **existing** signed-upload flow: `POST /api/cms/media/sign-upload` → direct browser upload to Cloudinary → `POST /api/cms/media` to record the asset → the returned secure URL is stored in the relevant SEO field (`Settings.seo.defaultOgImageUrl`, `Settings.seo.defaultFaviconUrl`, or `SeoOverride.ogImageUrl`).
- Upload/preview/replace/delete UX reuses `UploadDropzone` + `ImagePreview` exactly as already used elsewhere (e.g. project header showcase images) — Preview, Replace, Delete, Drag & Drop are already built into those components; the SEO forms only need to bind them to the correct field, no new upload component is written.
- Recommended Cloudinary folder convention (extends the existing convention: `"portfolio/projects-header"` for that module): `"portfolio/seo"` for Global SEO images/favicon, `"portfolio/seo/pages"` for per-page OG images — consistent with the "specific Cloudinary folders" pattern already partially observed, and closes the "Consider stronger Cloudinary folder conventions per content module" technical-debt item for this module specifically.
- Media usage tracking: SEO image fields are added to whatever field-scanning logic `mediaService.syncUsageForDocument` already uses for other modules, so `MediaAsset.usedIn` correctly reflects SEO usage and orphan-cleanup tooling (mentioned in Future Roadmap) will see these assets too.

## B.16 Performance & Caching

- **Redis (`publicCache`)** on all three new public endpoints, TTL ~300–600 seconds, matching the existing `publicCache(ttlSeconds = 300)` default.
- **Cache invalidation is key-based, not pattern-based.** The existing Technical Debt note ("Avoid `redis.keys` in cache invalidation for large production keyspaces; consider `SCAN`") is respected by design: Global SEO invalidates exactly one key (`seo:global`), and a Page SEO write invalidates exactly one key (`seo:resolve:<pagePath>`). No wildcard delete is introduced by this module.
- **React Query** (CMS) reuses existing query keys/invalidation idioms already used for other singleton/list resources (e.g. `["settings"]`, `["seo","overrides"]`).
- **Next.js** — `generateMetadata` runs server-side per request/ISR window; `sitemap.ts`/`robots.ts` use Next's built-in route segment `revalidate` (proposed: 3600 seconds) rather than being regenerated on every crawl hit.
- **No N+1 risk:** `GET /api/seo/pages` returns a lean projection (`pagePath`, `robots`, `updatedAt` only) specifically so `sitemap.ts` doesn't have to fetch full `SeoOverride` documents.
- **Favicon caveat (documented, not solved by this module):** Next.js's static `app/favicon.ico`/`app/icon.png` file convention cannot point at a remote Cloudinary URL. The plan is: keep the existing static favicon file as the guaranteed baseline (crawlers and browsers that only understand the file convention keep working), and additionally render `<link rel="icon" href={global.defaultFaviconUrl}>` in `layout.tsx` when a CMS-managed favicon is set, so it can override the static one in modern browsers without removing the safety net. This nuance is called out explicitly so Codex does not attempt to delete the static favicon file.

## B.17 Risks

| Risk | Source | Mitigation |
|---|---|---|
| `Settings.seo` may already contain fields with different names than proposed here | A.6 Unknown | Roadmap step 1 (Part C §8) requires inspecting the live `Settings` collection/schema before writing the migration; field names are additive and can be aligned to whatever already exists |
| `SeoOverride.pagePath` may not be unique today, or may contain duplicates | A.6 Unknown | Roadmap step 2 requires a duplicate-check query before adding a unique index; if duplicates exist, resolve them manually (keep most recent) before enforcing uniqueness |
| Adding a unique index to a live, populated collection can fail if duplicates exist | derived from above | Same mitigation; index creation is a separate, explicit migration step, not bundled into the schema change |
| Backend deploy workflow does not run `npm run build` (existing known bug, unrelated to this module but affects rollout of any backend change) | `ABOUT_PROJECT.md` §Known Bugs | Out of scope to fix here, but flagged in the roadmap as a pre-deployment check for whoever ships this module |
| Structured data fields sourced from `AboutContent`/`ContactContent` may be empty/partial | existing singletons, optional fields | `structuredData.ts` must omit optional JSON-LD properties rather than emit empty strings; `Person`/`WebSite` `@type` and `name`/`url` are the only required fields and both come from Global SEO, which is guaranteed non-empty |
| Divergence between `backend/src/routes.ts` and `cms-frontend/src/lib/api/endpoints.ts` | explicit AI Development Instruction in `ABOUT_PROJECT.md` | Roadmap includes a dedicated "keep endpoint registries in sync" step; Part C lists both files' required edits side by side |
| TTL-based (not event-instant) public cache invalidation for `seo:global` in edge cases where the same key is read mid-TTL from multiple app instances | design tradeoff (B.15) | Acceptable for a portfolio site's traffic profile; documented as a tradeoff, not silently accepted |
| Google/Social preview components drifting from actual rendered `<title>`/`<meta>` output if `buildMetadata.ts` and the CMS preview components implement the merge logic differently | two independent implementations (CMS is a separate Vite app, cannot import backend/frontend code) | Both implementations must follow the exact fallback order in B.11; Part C §7 restates the fallback order inside the CMS-facing spec so both sides are built from the same written rule, not from reading each other's code |

## B.18 Testing Plan

- **Backend unit tests** (Vitest, existing pattern): `seo.service.resolve()` fallback matrix — override present/absent × global present/absent × each field; `titleTemplate` substitution; robots enum validation; `pagePath` uniqueness conflict path.
- **Backend integration tests** (Vitest + Supertest + `mongodb-memory-server`, existing pattern): `GET /api/seo/global`, `GET /api/seo/resolve`, `GET /api/seo/pages` happy paths and empty-state (first-run default) paths; extended `POST/PUT /api/cms/seo` and `PUT /api/cms/settings` request bodies; RBAC still enforced (401/403 unchanged).
- **CMS unit/component tests** (Vitest + Testing Library, existing pattern): `GlobalSeoForm` submit/validation; `SeoFieldGroup` character counters; `SeoOverrideTable` search/filter logic; `GoogleSearchPreview`/`SocialPreview` render correctly from given props (pure presentational, easy to snapshot).
- **CMS e2e** (Playwright, existing `tests/e2e/` convention): login → navigate to SEO → edit Global SEO → save → reload → verify persisted; create a Page SEO override → verify it appears in the table, is searchable, and is filterable by Indexed/Non-Indexed.
- **Frontend unit tests** (existing `src/test/`/co-located pattern): `buildMetadata.ts` fallback output for override-present and override-absent cases; `structuredData.ts` omits empty optional fields; `JsonLd.tsx` renders valid, escaped JSON.
- **Manual/deployment smoke checks** (extends existing `DEPLOYMENT.md` verification list, which already checks `/health/ready`, `/api/home`, `/api/projects`, `/api/blogs`, `/api/contact`): add `curl /api/seo/global`, `curl /api/seo/resolve?path=/`, load `https://<site>/sitemap.xml`, load `https://<site>/robots.txt`, and view-source a project detail page to confirm `<title>`, canonical, OG, Twitter, and JSON-LD tags are present.

## B.19 Future Improvements

- Image/news sitemaps once the blog/media library grows.
- hreflang support if the portfolio ever becomes multi-locale.
- Per-page-type structured data (e.g. `Article` JSON-LD on `/blog/[slug]`, `CreativeWork`/`SoftwareSourceCode` on `/projects/[slug]`) — deliberately excluded from this phase to keep scope to the brief's explicit "Person" + "Website" requirement.
- Breadcrumb JSON-LD for project/blog detail pages.
- Server-side search/pagination for the Page SEO table if the override count grows large enough to matter (ties into the existing general CMS list-pagination roadmap item).
- Automated Lighthouse/SEO score check added to CI once CI linting/testing is introduced (also an existing, separate roadmap item).
- AI-assisted meta description suggestions, once the currently-unimplemented "portfolio assistant" backend service is actually built — explicitly not bundled into this module, since that service is `notImplemented()` today and is a separate initiative.

---

# PART C — Codex-Ready Implementation Specification

This part is the literal handoff document. It is organized by application (`backend`, `cms-frontend`, `frontend`) and, within each, by file. Each entry states the file's responsibility, the fields/exports it must expose, and which existing file(s) it must follow the pattern of. Codex should treat every "Follow the pattern of" reference as mandatory prior art to open and mirror before writing anything new.

## C.1 Global Conventions Codex Must Preserve

- Backend TypeScript imports use the `@/...` alias with explicit `.js` suffixes (ESM). Follow any existing file in `backend/src/modules/settings/`.
- Every backend response passes through the existing `{ data, meta: { requestId } }` envelope helper — do not hand-construct response bodies.
- Every backend write path that currently calls `saveAndAudit` must continue to do so after these changes; do not remove or bypass audit logging.
- Every backend list/detail read path currently wrapped in `publicCache` for public routes must keep using that middleware; new public SEO routes must use it too.
- CMS feature code lives under `cms-frontend/src/features/seo/`; only presentational/shared primitives may live under `cms-frontend/src/components/`.
- CMS endpoint strings are added to `cms-frontend/src/lib/api/endpoints.ts` in the same call as the corresponding `backend/src/routes.ts` change — never edit one without the other in the same commit/PR.
- Public frontend service files live under `frontend/src/services/`; they must use `frontend/src/lib/axios.ts` and unwrap through `frontend/src/services/response.ts`, exactly like every existing service.
- Do not refactor unrelated files. Do not touch `experience`, `about` (beyond reading its public fields for structured data), `home`, `blog`, `projects`, `contact`, `media`, `users`, `auth`, `dashboard`, or `auditLogs` modules except where explicitly listed below.
- Where current behavior is ambiguous and not resolved by this document, stop and mark it `Unknown` in code comments rather than guessing, per the existing "AI Development Instructions" section of `ABOUT_PROJECT.md`.

## C.2 Backend — `backend/src/modules/settings/`

### `settings.model.ts` (extend)

Add/confirm the following sub-schema under the existing `seo` path on the `Settings` schema. If the existing `seo` path already defines any of these fields under different names, rename to match what already exists rather than introducing duplicates — verify first (Roadmap step 1).

```text
seo: {
  siteName: String (required)
  siteUrl: String (required, https URL)
  defaultMetaTitle: String (required)
  titleTemplate: String (required, must contain "%page%")
  defaultMetaDescription: String (required)
  defaultAuthor: String (required)
  defaultRobots: String (enum: ["index,follow","noindex,follow","index,nofollow","noindex,nofollow"], default "index,follow")
  googleVerificationCode: String (optional)
  defaultOgImageUrl: String (optional, https URL)
  defaultFaviconUrl: String (optional, https URL)
}
```

### `settings.validation.ts` (extend)

Add a Zod object mirroring the schema above to the existing update-settings request schema, nested under `seo`, all fields optional at the PUT-payload level (partial update) but validated with the same rules as C.2's table when present. Reuse `httpsUrl` from `backend/src/common/validation.ts` for `siteUrl`, `defaultOgImageUrl`, `defaultFaviconUrl`.

### `settings.service.ts` (extend)

- Add a `DEFAULT_GLOBAL_SEO` constant object satisfying every required field, used when the `Settings` singleton has never been saved or when `seo` is missing — guarantees `GET /api/cms/settings` and the new public `GET /api/seo/global` never return an incomplete object (Part B §B.11 rule).
- On successful update where the payload includes `seo`, after persisting, invalidate Redis key `seo:global` (only that key — no pattern scan, per B.15/B.17).
- Add exported function `getGlobalSeoForPublic()` returning only the fields needed publicly (all 10 fields are safe to expose publicly except possibly none — confirm `googleVerificationCode` is intended to be public; it must be, since it is rendered as a public `<meta>` tag).

### `settings.controller.ts`

No changes required — existing `GET/PUT /api/cms/settings` already exposes the whole document, which now includes the extended `seo` object.

## C.3 Backend — `backend/src/modules/seo/`

### `seo.model.ts` (extend)

Add to the existing `SeoOverride` schema:

```text
ogTitle: String (optional)
ogDescription: String (optional)
robots: String (optional, enum: ["index,follow","noindex,follow","index,nofollow","noindex,nofollow"])
```

Confirm (Roadmap step 2) whether `pagePath` currently has `unique: true` and/or an index. If not present and no duplicates exist, add `unique: true, index: true`. If duplicates exist, do not add the constraint in the same change — flag it and stop, per C.1's "mark Unknown" rule, and let a human resolve the duplicate data first.

### `seo.validation.ts` (extend)

Add `ogTitle`, `ogDescription`, `robots` (same enum) as optional fields to the existing create/update Zod schemas for `SeoOverride`. Add a new schema for the `path` query parameter used by `GET /api/seo/resolve` (required, must start with `/`).

### `seo.repository.ts` (extend)

Add:
- `findByPagePathLean(pagePath: string)` — lean read, used by `resolve()`.
- `listPublicIndexablePaths()` — returns `{ pagePath, robots, updatedAt }` projection for all documents, used by the `GET /api/seo/pages` handler (filtering of "indexable" happens in `sitemap.ts` on the frontend, not in the repository, so the endpoint stays a simple projection and remains reusable).

### `seo.service.ts` (extend)

Add:
- `resolve(path: string): Promise<ResolvedSeo>` — implements the exact fallback order in Part B §B.11. Checks Redis key `seo:resolve:<path>` first; on miss, loads override (via `findByPagePathLean`) and global (via `settings.service.getGlobalSeoForPublic()`), merges, writes cache with `ttlSeconds` (reuse the same default as `publicCache`), returns.
- `getGlobalSeo(): Promise<GlobalSeo>` — thin wrapper delegating to `settings.service.getGlobalSeoForPublic()`, kept in the `seo` module for API-shape locality (`/api/seo/global` route lives here) without duplicating logic.
- `listPages(): Promise<SeoPageSummary[]>` — wraps `listPublicIndexablePaths()`.
- Extend the existing create/update handlers used by `/api/cms/seo` to invalidate Redis key `seo:resolve:<pagePath>` after every write, and to run the uniqueness check described in B.12 before insert (return `AppError(409, "SEO_PAGE_PATH_CONFLICT", "A page override already exists for this path")` on conflict).

`ResolvedSeo` shape (TypeScript type, colocated in `seo.types.ts` if that file pattern exists elsewhere, else inline):

```text
ResolvedSeo {
  path: string
  metaTitle: string
  metaDescription: string
  canonicalUrl: string
  robots: string
  ogTitle: string
  ogDescription: string
  ogImageUrl?: string
  author: string
  siteName: string
  siteUrl: string
}
```

`GlobalSeo` shape mirrors the C.2 table exactly.

`SeoPageSummary` shape:

```text
SeoPageSummary {
  pagePath: string
  robots?: string
  updatedAt: string
}
```

### `seo.controller.ts` (extend)

Add three new handlers, all unauthenticated, all wrapped by `publicCache(ttlSeconds)` at the route level (not inside the controller, matching the existing middleware-based caching pattern):

- `getGlobalSeoPublic(req, res)` → `seo.service.getGlobalSeo()` → envelope response.
- `resolveSeoPublic(req, res)` → validate `req.query.path` with the new Zod schema → `seo.service.resolve(path)` → envelope response.
- `listSeoPagesPublic(req, res)` → `seo.service.listPages()` → envelope response.

Existing CMS handlers (`list`, `create`, `update`, `remove` for overrides) are extended only insofar as they now accept/return the three new optional fields — their control flow, RBAC guard usage (`cmsGuard("seo", "read"|"create"|"update"|"delete")`), and error handling remain unchanged.

## C.4 Backend — `backend/src/routes.ts` (extend)

Add, under the public `/api` mount, a new `/api/seo` sub-router (co-located import from `modules/seo`, matching how other public route groups like `/api/projects` are mounted):

```text
GET  /api/seo/global    -> publicCache(300) -> seo.controller.getGlobalSeoPublic
GET  /api/seo/resolve   -> publicCache(300) -> seo.controller.resolveSeoPublic
GET  /api/seo/pages     -> publicCache(300) -> seo.controller.listSeoPagesPublic
```

Do not modify the existing `/api/cms/seo/*` or `/api/cms/settings` route registrations beyond what their controllers already require (i.e., none — those are unchanged route definitions with extended payloads).

## C.5 CMS — `cms-frontend/src/lib/api/endpoints.ts` (extend)

Add three constants for the new public-shaped calls only if the CMS itself needs to hit them for the live preview (it does not — CMS previews are computed client-side from form state, per B.9). **No new entries are required here for the public endpoints.** The only endpoints.ts changes needed are: none beyond what already exists for `/api/cms/seo` and `/api/cms/settings`, since this module reuses both untouched. State this explicitly in the PR description so a reviewer does not go looking for endpoint changes that aren't there.

## C.6 CMS — `cms-frontend/src/features/seo/`

### `seo.types.ts` (extend)

```text
PageSeoOverride {
  id: string
  pagePath: string
  metaTitle?: string
  metaDescription?: string
  canonicalUrl?: string
  ogImageUrl?: string
  ogTitle?: string
  ogDescription?: string
  robots?: RobotsValue
  updatedAt: string
}

GlobalSeo {
  siteName: string
  siteUrl: string
  defaultMetaTitle: string
  titleTemplate: string
  defaultMetaDescription: string
  defaultAuthor: string
  defaultRobots: RobotsValue
  googleVerificationCode?: string
  defaultOgImageUrl?: string
  defaultFaviconUrl?: string
}

RobotsValue = "index,follow" | "noindex,follow" | "index,nofollow" | "noindex,nofollow"
```

### `seo.schema.ts` (extend)

- Extend the existing page-override Zod schema with `ogTitle`, `ogDescription`, `robots` (optional, enum).
- Add a new `globalSeoSchema` matching C.2's table (all required fields required, `titleTemplate` must contain `%page%`, URL fields validated as https URLs using the same regex/rule already used elsewhere in this file or in a shared CMS validators module if one exists — check before duplicating a URL regex).

### `seo.service.ts` (extend)

- Existing override CRUD functions: extend request/response types only, no behavior change.
- Add `getGlobalSeo(): Promise<GlobalSeo>` → `GET /api/cms/settings`, extract `.seo`.
- Add `updateGlobalSeo(payload: Partial<GlobalSeo>): Promise<GlobalSeo>` → `PUT /api/cms/settings` with `{ seo: payload }`, extract `.seo` from response.

### `components/SeoFieldGroup.tsx` (new)

Props: `titleValue`, `descriptionValue`, `onTitleChange`, `onDescriptionChange`, `titleLabel`, `descriptionLabel`. Renders two `FormField`-wrapped inputs (reused primitive) plus a small character-count hint (green under ~60/~160 chars, amber approaching, red over) — purely presentational, no validation logic of its own (validation stays in `seo.schema.ts`).

### `components/GoogleSearchPreview.tsx` (new)

Props: `title: string`, `url: string`, `description: string`. Pure presentational card styled to resemble a Google organic result (blue title line, green URL line, gray description line, truncated per typical SERP character limits). No data fetching.

### `components/SocialPreview.tsx` (new)

Props: `imageUrl?: string`, `title: string`, `description: string`, `domain: string`. Pure presentational card styled like a Facebook/LinkedIn/X link-unfurl card (large image on top, title, description, domain caption). No data fetching. Must render a graceful placeholder block when `imageUrl` is absent rather than a broken image tag.

### `components/GlobalSeoForm.tsx` (new)

- Loads via `seo.service.getGlobalSeo()` (React Query, key `["seo","global"]`).
- Uses React Hook Form + `globalSeoSchema` (existing form pattern).
- Renders: `FormSection` "Identity" (Website Name, Site URL, Default Author), `FormSection` "Search Appearance" (`SeoFieldGroup` bound to Default Meta Title/Description, Title Template input, Default Robots select), `FormSection` "Verification" (Google Verification Code), `FormSection` "Media" (Default OG Image via `UploadDropzone`/`ImagePreview`, Default Favicon via the same components).
- Side-by-side live `GoogleSearchPreview` and `SocialPreview` fed from current form values (watch-based, no debounce needed at this scale).
- Submits via `seo.service.updateGlobalSeo()`, existing `SaveButton` loading/disabled states, existing toast-on-success/failure pattern, invalidates `["seo","global"]` query on success.

### `components/PageSeoFormDialog.tsx` (extend existing dialog)

- Add fields: Robots (select, same 4-value enum, with an explicit "Inherit from Global" empty option), Open Graph Title, Open Graph Description (both using `FormField`, both optional, both below a divider labeled to indicate they auto-fill from Meta Title/Description when left blank — this is a UI hint, not new logic).
- Reuse `SeoFieldGroup` for Meta Title/Meta Description exactly as `GlobalSeoForm` does, so both forms visually and behaviorally match.
- Reuse existing OG Image `UploadDropzone`/`ImagePreview` binding already present in the dialog (if not already wired to Cloudinary, wire it the same way the Global form is wired in this same change).
- Add live `GoogleSearchPreview`/`SocialPreview` below the form fields, fed from current dialog form values, with the same fallback-to-Global-then-inherited-defaults preview logic as Part B §B.11 (import the Global SEO values via the already-loaded `["seo","global"]` query so the preview reflects real inheritance, not a hardcoded placeholder).
- Duplicate-`pagePath` and duplicate-`metaTitle` checks per B.12, computed against the list already loaded by `SeoOverrideTable`'s parent.

### `components/SeoOverrideTable.tsx` (extend existing table)

- Add a search input above the table bound to a local `useState<string>` filtering the already-fetched array by `pagePath` or `metaTitle` substring match (case-insensitive).
- Add an Indexed/Non-Indexed segmented filter (or existing filter-pill component if one exists in `components/table/`) applying the classification rule from B.14.
- No new query parameters, no new backend calls.

## C.7 Public Frontend — `frontend/src/lib/seo/`

### `resolveSeo.service.ts` (new)

```text
export async function resolveSeo(path: string): Promise<ResolvedSeo>
```

Follows the exact structure of an existing service file in `frontend/src/services/` (Axios GET via the shared client from `lib/axios.ts`, response unwrapped via `services/response.ts`, typed return). Placed under `lib/seo/` rather than `services/` only because it is a cross-cutting metadata concern consumed from `generateMetadata` (a server-only Next.js export) in every route file, not a typical page-data hook consumer — if the existing codebase's convention is that *all* API-calling functions must live in `services/`, move this file there instead and keep only `buildMetadata.ts`/`structuredData.ts` under `lib/seo/`; verify against actual `services/` contents during implementation (Roadmap step 3).

### `buildMetadata.ts` (new)

```text
export function buildMetadata(resolved: ResolvedSeo): Metadata
```

Maps `ResolvedSeo` to Next.js's `Metadata` type: `title`, `description`, `alternates.canonical`, `robots` (parsed from the comma-separated string into Next's `{ index, follow }` object shape), `openGraph: { title, description, url, siteName, images }`, `twitter: { card: "summary_large_image", title, description, images }`, and `other: { "google-site-verification": ... }` when present on the resolved Global data (only reachable when resolving `/`, or expose `googleVerificationCode` on every `ResolvedSeo` response — decide during implementation and document the choice, since B.11's `ResolvedSeo` shape above does not currently include it; recommended: add it to `ResolvedSeo` since it costs nothing and keeps `buildMetadata.ts` a pure function of one object).

### `structuredData.ts` (new)

```text
export function buildPersonJsonLd(globalSeo: GlobalSeo, contact: ContactContent, about?: AboutContent): object
export function buildWebSiteJsonLd(globalSeo: GlobalSeo): object
```

Omits any optional property whose source value is empty/undefined rather than emitting an empty string, per B.17's mitigation.

## C.8 Public Frontend — `frontend/src/components/seo/JsonLd.tsx` (new)

```text
export function JsonLd({ data }: { data: object }): JSX.Element
```

Renders `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />` — this is the one place `dangerouslySetInnerHTML` is acceptable, because the input is always a structured object built by `structuredData.ts` from typed, already-sanitized backend content, never raw user input.

## C.9 Public Frontend — `frontend/src/app/sitemap.ts` (new)

Next.js native `MetadataRoute.Sitemap` export. Fetches (in parallel): published projects (existing `GET /api/projects`), published blog articles (existing `GET /api/blogs`), and page summaries (new `GET /api/seo/pages`). Emits the static routes (`/`, `/projects`, `/blog`, `/contact`) plus one entry per published project/article, excluding any path whose resolved `robots` contains `noindex`. Uses `NEXT_PUBLIC_SITE_URL` (existing env var) as the base.

## C.10 Public Frontend — `frontend/src/app/robots.ts` (new)

Next.js native `MetadataRoute.Robots` export. `rules: [{ userAgent: "*", allow: "/" }]` plus any explicit `Disallow` entries derived from `noindex` `SeoOverride` rows for statically-known paths, and `sitemap: `${NEXT_PUBLIC_SITE_URL}/sitemap.xml``.

## C.11 Public Frontend — Route File Extensions

For each of `app/layout.tsx`, `app/page.tsx`, `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `app/contact/page.tsx`:

- Add/extend an exported `async function generateMetadata(...)` that calls `resolveSeo(path)` and returns `buildMetadata(resolved)`.
- For the two dynamic routes (`[slug]` under projects and blog), if `resolveSeo` returns only Global-level fallback (no page override exists) **and** the corresponding `Project`/`BlogArticle` document is already being fetched for the page body, prefer that document's own title/description/cover image over the bare Global default before falling back further — this keeps existing per-project/per-article content-derived titles working exactly as they may already work today (recall: "Dynamic page metadata details for `/projects/[slug]` and `/blog/[slug]`: Unknown" — this rule ensures the new system is never a regression versus whatever exists today, even though what exists today is unverified).
- `layout.tsx` additionally renders `<JsonLd data={buildWebSiteJsonLd(...)} />` and `<JsonLd data={buildPersonJsonLd(...)} />` once, at the root.

## C.12 Environment Variables

No new environment variables are required. This module reuses:

- Backend: `MONGODB_URI`, `REDIS_URL` (optional; if unset, `publicCache` presumably no-ops per existing behavior — verify, do not assume).
- Frontend: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`.

If `Settings.seo.siteUrl` and `NEXT_PUBLIC_SITE_URL` can drift (one is CMS-editable, one is a build-time env var), `sitemap.ts`/`robots.ts` must use `NEXT_PUBLIC_SITE_URL` for the base domain (since those are static-file-like Next.js conventions evaluated in the frontend process), while `<link rel="canonical">` and OG `url` use the resolved `siteUrl` from the backend (single source of truth for anything rendered from CMS data). Document this dual-source reality in code comments so a future editor does not "fix" it into a bug.

## C.13 Implementation Roadmap (dependency-ordered)

1. **Pre-flight:** inspect the live `Settings` document/schema to confirm current `seo` field shape; align C.2's field names if they collide with existing ones.
2. **Pre-flight:** query the `SeoOverride` collection for duplicate `pagePath` values; resolve duplicates manually if found, before any uniqueness constraint is added.
3. **Pre-flight:** open `frontend/src/services/` and confirm whether `resolveSeo.service.ts` should live there instead of `frontend/src/lib/seo/`; follow whichever convention the folder actually enforces.
4. Extend `backend/src/modules/settings/settings.model.ts` with the Global SEO sub-schema fields.
5. Extend `backend/src/modules/settings/settings.validation.ts` with the corresponding Zod rules.
6. Add `DEFAULT_GLOBAL_SEO` and cache-invalidation logic to `backend/src/modules/settings/settings.service.ts`.
7. Extend `backend/src/modules/seo/seo.model.ts` with `ogTitle`, `ogDescription`, `robots`; add uniqueness index only if step 2 confirmed it's safe.
8. Extend `backend/src/modules/seo/seo.validation.ts` with the new optional fields and the `path` query schema.
9. Extend `backend/src/modules/seo/seo.repository.ts` with `findByPagePathLean` and `listPublicIndexablePaths`.
10. Extend `backend/src/modules/seo/seo.service.ts` with `resolve`, `getGlobalSeo`, `listPages`, and the uniqueness-conflict check on existing create/update paths.
11. Extend `backend/src/modules/seo/seo.controller.ts` with the three public handlers.
12. Extend `backend/src/routes.ts` to mount `/api/seo/global`, `/api/seo/resolve`, `/api/seo/pages` behind `publicCache`.
13. Backend tests: unit tests for `resolve()` fallback matrix; integration tests for the three new public endpoints and the extended CMS endpoints.
14. CMS: extend `cms-frontend/src/features/seo/seo.types.ts` and `seo.schema.ts`.
15. CMS: extend `cms-frontend/src/features/seo/seo.service.ts` with `getGlobalSeo`/`updateGlobalSeo`.
16. CMS: build `components/SeoFieldGroup.tsx`, `components/GoogleSearchPreview.tsx`, `components/SocialPreview.tsx` (shared, no dependencies on the two forms below yet).
17. CMS: build `components/GlobalSeoForm.tsx` using steps 14–16.
18. CMS: extend `components/PageSeoFormDialog.tsx` with the new fields and preview components.
19. CMS: extend `components/SeoOverrideTable.tsx` with search + Indexed/Non-Indexed filter.
20. CMS: wire the existing SEO page route to show Global/Pages tabs.
21. CMS tests: component tests for the new/extended components; Playwright e2e for the Global-edit and Page-create/edit flows.
22. Frontend: add `lib/seo/resolveSeo.service.ts` (or `services/`, per step 3's finding).
23. Frontend: add `lib/seo/buildMetadata.ts` and `lib/seo/structuredData.ts`.
24. Frontend: add `components/seo/JsonLd.tsx`.
25. Frontend: add `app/sitemap.ts` and `app/robots.ts`, consuming `GET /api/projects`, `GET /api/blogs`, `GET /api/seo/pages`.
26. Frontend: extend `generateMetadata` in `app/layout.tsx`, `app/page.tsx`, `app/projects/page.tsx`, `app/blog/page.tsx`, `app/contact/page.tsx`.
27. Frontend: extend `generateMetadata` in `app/projects/[slug]/page.tsx` and `app/blog/[slug]/page.tsx`, including the content-derived fallback rule from C.11.
28. Frontend: add root-layout `<JsonLd>` rendering for Person + WebSite.
29. Frontend tests: unit tests for `buildMetadata.ts` and `structuredData.ts`.
30. End-to-end verification: view-source every route listed in B.3 and confirm title/description/canonical/OG/Twitter/JSON-LD tags render as expected; load `/sitemap.xml` and `/robots.txt`.
31. Update `backend/DEPLOYMENT.md`'s verification checklist to include the new public SEO endpoints and the sitemap/robots URLs (documentation-only change, keeps the existing runbook accurate).
32. Final review pass against C.1's global conventions checklist before merging.

## C.14 Acceptance Criteria Checklist

- [ ] `Settings.seo` exposes all 10 Global SEO fields through the existing `/api/cms/settings` endpoints, with a guaranteed non-empty default.
- [ ] `SeoOverride` exposes `ogTitle`, `ogDescription`, `robots` through the existing `/api/cms/seo` endpoints, fully backward compatible with any existing consumers of those four original fields.
- [ ] Three new public endpoints exist under `/api/seo`, are Redis-cached via the existing `publicCache` middleware, and never return an incomplete/empty SEO object.
- [ ] No new RBAC permission keys were introduced; existing `seo:*` and `settings:*` permissions gate all writes.
- [ ] No new MongoDB collections were introduced.
- [ ] Every public route in B.3 renders a non-empty `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph tags, and Twitter Card tags, sourced through `resolveSeo` → `buildMetadata`.
- [ ] `/sitemap.xml` and `/robots.txt` are reachable and reflect current published content plus any `SeoOverride` entries.
- [ ] Root layout renders exactly one `Person` and one `WebSite` JSON-LD block, each valid JSON, each omitting empty optional fields.
- [ ] CMS SEO page has a working Global tab and Pages tab; Pages tab supports search and Indexed/Non-Indexed filtering; both tabs show live Google Search Preview and Social Preview.
- [ ] All Cloudinary image fields in this module (Default OG Image, Default Favicon, per-page OG Image) use the existing signed-upload → direct-upload → record flow, with Preview/Replace/Delete/Drag&Drop, and no raw URL text input.
- [ ] All new/changed backend and CMS code paths have corresponding tests per B.18.
- [ ] `backend/src/routes.ts` and `cms-frontend/src/lib/api/endpoints.ts` were reviewed together and are consistent (even where the conclusion was "no CMS endpoint change needed").
- [ ] No unrelated file was modified.

---

# PART D — Reference Payloads

These are illustrative request/response examples for the new and extended endpoints. They are documentation aids for Codex and for QA — they show the envelope shape and field names, not literal values that must be hard-coded.

## D.1 `GET /api/seo/global`

Response:

```json
{
  "data": {
    "siteName": "Abishek Krishnamoorthy",
    "siteUrl": "https://abishekkrishnamoorthy.online",
    "defaultMetaTitle": "Abishek Krishnamoorthy — Full-Stack Developer",
    "titleTemplate": "%page% | Abishek Krishnamoorthy",
    "defaultMetaDescription": "Full-stack developer portfolio featuring projects, articles, and experience.",
    "defaultAuthor": "Abishek Krishnamoorthy",
    "defaultRobots": "index,follow",
    "googleVerificationCode": "abc123verificationtoken",
    "defaultOgImageUrl": "https://res.cloudinary.com/.../seo/default-og.png",
    "defaultFaviconUrl": "https://res.cloudinary.com/.../seo/favicon.png"
  },
  "meta": { "requestId": "req_01hzxyz" }
}
```

## D.2 `GET /api/seo/resolve?path=/projects/portfolio-cms`

Response, page override present:

```json
{
  "data": {
    "path": "/projects/portfolio-cms",
    "metaTitle": "Portfolio CMS | Abishek Krishnamoorthy",
    "metaDescription": "A production-grade content-managed portfolio system built with Next.js, Express, and MongoDB.",
    "canonicalUrl": "https://abishekkrishnamoorthy.online/projects/portfolio-cms",
    "robots": "index,follow",
    "ogTitle": "Portfolio CMS | Abishek Krishnamoorthy",
    "ogDescription": "A production-grade content-managed portfolio system built with Next.js, Express, and MongoDB.",
    "ogImageUrl": "https://res.cloudinary.com/.../seo/pages/portfolio-cms-og.png",
    "author": "Abishek Krishnamoorthy",
    "siteName": "Abishek Krishnamoorthy",
    "siteUrl": "https://abishekkrishnamoorthy.online"
  },
  "meta": { "requestId": "req_01hzabc" }
}
```

Response, no page override (pure Global fallback) for an unregistered path:

```json
{
  "data": {
    "path": "/blog/some-new-post",
    "metaTitle": "Abishek Krishnamoorthy — Full-Stack Developer",
    "metaDescription": "Full-stack developer portfolio featuring projects, articles, and experience.",
    "canonicalUrl": "https://abishekkrishnamoorthy.online/blog/some-new-post",
    "robots": "index,follow",
    "ogTitle": "Abishek Krishnamoorthy — Full-Stack Developer",
    "ogDescription": "Full-stack developer portfolio featuring projects, articles, and experience.",
    "ogImageUrl": "https://res.cloudinary.com/.../seo/default-og.png",
    "author": "Abishek Krishnamoorthy",
    "siteName": "Abishek Krishnamoorthy",
    "siteUrl": "https://abishekkrishnamoorthy.online"
  },
  "meta": { "requestId": "req_01hzdef" }
}
```

Note: the second example is exactly what C.11's fallback-derived-title routine would emit if the route were still resolving purely from Global data. In practice, C.11 requires the `[slug]` route handlers to prefer the fetched `BlogArticle`/`Project` document's own title/excerpt/cover image over this bare Global fallback whenever no explicit `SeoOverride` exists — so this second payload is what the *resolver* returns in isolation, not necessarily what the rendered `<title>` ends up being once the route-level merge in C.11 runs.

## D.3 `GET /api/seo/pages`

```json
{
  "data": [
    { "pagePath": "/", "robots": "index,follow", "updatedAt": "2026-05-12T10:22:00.000Z" },
    { "pagePath": "/projects/portfolio-cms", "robots": "index,follow", "updatedAt": "2026-06-01T08:10:00.000Z" },
    { "pagePath": "/blog/draft-post", "robots": "noindex,nofollow", "updatedAt": "2026-07-20T14:05:00.000Z" }
  ],
  "meta": { "requestId": "req_01hzghi" }
}
```

`sitemap.ts` must exclude the third entry (`noindex,nofollow`) from the generated sitemap while `robots.ts` may add it as an explicit `Disallow` rule.

## D.4 `PUT /api/cms/settings` (extended payload, partial)

Request body (only the `seo` slice shown; other `Settings` fields unaffected):

```json
{
  "seo": {
    "titleTemplate": "%page% | Abishek Krishnamoorthy",
    "defaultRobots": "index,follow",
    "googleVerificationCode": "abc123verificationtoken"
  }
}
```

This is a partial update — fields omitted from the request retain their current stored value; this mirrors how the rest of the `Settings` singleton (`forms`, `scheduling`) is already updated via the existing `PUT /api/cms/settings` handler.

## D.5 `POST /api/cms/seo` (extended payload)

Request body:

```json
{
  "pagePath": "/projects/portfolio-cms",
  "metaTitle": "Portfolio CMS",
  "metaDescription": "A production-grade content-managed portfolio system.",
  "canonicalUrl": "https://abishekkrishnamoorthy.online/projects/portfolio-cms",
  "ogImageUrl": "https://res.cloudinary.com/.../seo/pages/portfolio-cms-og.png",
  "ogTitle": "",
  "ogDescription": "",
  "robots": "index,follow"
}
```

`ogTitle`/`ogDescription` submitted as empty strings are treated identically to omitted fields by `seo.service.resolve()` — the CMS form may choose to send empty strings rather than `undefined`; the backend fallback check must treat both as "not set" (falsy-string check, not strict `undefined` check).

Conflict response (duplicate `pagePath`):

```json
{
  "error": {
    "code": "SEO_PAGE_PATH_CONFLICT",
    "message": "A page override already exists for this path",
    "details": [{ "field": "pagePath", "value": "/projects/portfolio-cms" }]
  },
  "meta": { "requestId": "req_01hzjkl" }
}
```

# PART E — Component Prop Reference (CMS)

Concrete prop signatures for the five new/modified presentational components, so Codex does not have to infer them from prose alone.

## E.1 `SeoFieldGroup`

| Prop | Type | Required | Notes |
|---|---|---|---|
| `titleValue` | `string` | yes | current Meta Title field value |
| `titleLabel` | `string` | yes | e.g. `"Meta Title"` or `"Default Meta Title"` |
| `onTitleChange` | `(value: string) => void` | yes | |
| `descriptionValue` | `string` | yes | current Meta Description field value |
| `descriptionLabel` | `string` | yes | e.g. `"Meta Description"` or `"Default Meta Description"` |
| `onDescriptionChange` | `(value: string) => void` | yes | |
| `titleRecommendedMax` | `number` | no, default `60` | |
| `descriptionRecommendedMax` | `number` | no, default `160` | |
| `errors` | `{ title?: string; description?: string }` | no | surfaced from RHF/Zod, rendered under each field using the existing form-error styling |

## E.2 `GoogleSearchPreview`

| Prop | Type | Required |
|---|---|---|
| `title` | `string` | yes |
| `url` | `string` | yes |
| `description` | `string` | yes |

## E.3 `SocialPreview`

| Prop | Type | Required |
|---|---|---|
| `imageUrl` | `string \| undefined` | no |
| `title` | `string` | yes |
| `description` | `string` | yes |
| `domain` | `string` | yes |

## E.4 `GlobalSeoForm`

No props — self-contained: fetches its own data via `seo.service.getGlobalSeo()`, owns its own form state, submits via `seo.service.updateGlobalSeo()`. Matches the existing pattern of other CMS singleton editors (e.g. Home editor, Contact editor, Settings editor), which are likewise self-contained page-level forms rather than prop-driven components.

## E.5 `PageSeoFormDialog` (extended)

| Prop | Type | Required | Notes |
|---|---|---|---|
| `open` | `boolean` | yes | existing prop |
| `onOpenChange` | `(open: boolean) => void` | yes | existing prop |
| `initialValue` | `PageSeoOverride \| undefined` | no | existing prop — `undefined` for create mode |
| `onSubmit` | `(value: PageSeoOverride) => Promise<void>` | yes | existing prop |
| `existingPaths` | `string[]` | yes | **new** — used for the client-side duplicate-`pagePath` check |
| `existingTitles` | `string[]` | yes | **new** — used for the client-side duplicate-`metaTitle` soft warning |
| `globalSeo` | `GlobalSeo` | yes | **new** — used to render accurate inherited-default previews when page-level fields are empty |

## E.6 `SeoOverrideTable` (extended)

| Prop | Type | Required | Notes |
|---|---|---|---|
| `items` | `PageSeoOverride[]` | yes | existing prop |
| `onEdit` | `(item: PageSeoOverride) => void` | yes | existing prop |
| `onDelete` | `(item: PageSeoOverride) => void` | yes | existing prop |
| `searchQuery` | `string` | no, default `""` | **new**, internal state unless the parent wants to control it |
| `indexFilter` | `"all" \| "indexed" \| "noindex"` | no, default `"all"` | **new**, internal state unless the parent wants to control it |

# PART F — Glossary

| Term | Meaning in this document |
|---|---|
| Global SEO | Site-wide SEO defaults stored on the existing `Settings.seo` sub-document |
| Page SEO | Per-route SEO overrides stored on the existing `SeoOverride` collection |
| Resolved SEO | The merged, fallback-applied result of Global + Page SEO for one path, as returned by `seo.service.resolve()` and `GET /api/seo/resolve` |
| Fallback | The precedence rule in which an unset Page SEO field is filled in from the corresponding Global SEO field, never left empty |
| Indexable | A path whose effective `robots` value does not contain `noindex` |
| Envelope | The existing `{ data, meta: { requestId } }` / `{ error, meta }` response wrapper used by every backend endpoint in this codebase |
| `cmsGuard` | Existing combined `authMiddleware` + `rbac(module, action)` middleware factory |
| `publicCache` | Existing Redis-backed optional caching middleware for public GET routes |

---

*End of specification.*
