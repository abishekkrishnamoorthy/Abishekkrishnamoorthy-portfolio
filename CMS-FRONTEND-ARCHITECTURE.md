# Portfolio Admin CMS — Frontend Architecture Specification

**Prepared by:** Principal Frontend Architect
**Audience:** Codex (implementation agent) — build against this document only
**Backend source of truth:** `Backend-Architecture-Specification.md` + `CMS-CONSTRUCTION-README.md` (live endpoint inventory)
**Status:** Architecture is final. Codex must not invent endpoints, field names, validation rules, folder structures, or design tokens not defined here. If a decision is genuinely missing, stop and flag it — do not improvise.

---

## 0. How To Read This Document

Every architectural decision required to build this application already exists below. Codex's job is implementation, not design. Where the backend's endpoint inventory (`CMS-CONSTRUCTION-README.md`) and the field contracts (`README.md`) define exact shapes, this document does not repeat every field — it references the section and defines how the **frontend** consumes it. This document is the single source of truth for anything not already pinned by the backend contract (component boundaries, state management, theming, editor UX, routing, responsive behavior).

This CMS **must be fully responsive** — usable end-to-end on mobile, tablet, and desktop, not "desktop with a mobile fallback." Section 8 (Responsive & Mobile Architecture) is load-bearing, not a footnote, and its rules apply to every component described later in this document.

---

## 1. Project Overview

### 1.1 Purpose

A premium, production-grade Admin CMS for a single-owner developer portfolio. Every screen edits content served by the existing backend (`localhost:4000` in dev) documented in `CMS-CONSTRUCTION-README.md`. No mock data, no fake implementations — every screen is wired to a real REST endpoint from day one.

### 1.2 Goals

- Feel like Notion / Payload / Sanity / Linear / Vercel Dashboard / Clerk — not a generic admin template.
- Fully responsive: every screen (including the block-based blog editor) must be usable on a phone.
- Draft → Preview → Publish as a first-class pattern across all content modules.
- Zero architectural decisions left to the implementer at code time.

### 1.3 Architecture Philosophy

| Principle | Decision |
|---|---|
| Rendering strategy | Client-rendered SPA (Vite + React) — this is an authenticated internal tool, not an SEO surface. No SSR needed. |
| State philosophy | Server state and client state are never mixed in the same store. Server state → React Query. Client/UI state → local component state or small Zustand slices. No Redux. |
| Data fetching | One thin Axios client, one service layer per backend module, one React Query hook layer per service. Components never call Axios directly. |
| Styling | Tailwind CSS (utility-first) + a small set of design tokens as CSS variables, so dark mode and theming are runtime-swappable without a rebuild. |
| Component philosophy | Headless/unstyled primitives (Radix UI) wrapped in the project's own styled components. Never ship a third-party component's default visual style unmodified. |
| Responsiveness | Mobile-first Tailwind breakpoints on every component; no separate "mobile app" or conditional component tree. One component, responsive by default. |
| Forms | React Hook Form + Zod, with the **exact same Zod schemas the backend uses**, ported field-for-field from the README contract, so client and server validation never drift. |
| Reusability | Every CRUD module (Projects, Blog, Experience) is built from a shared "Resource Manager" pattern (list + editor + reorder) rather than one-off screens. |

### 1.4 Non-Goals

- No SSR/SSG (this is an internal authenticated tool).
- No offline-first / PWA sync layer.
- No multi-tenant support — one CMS, one backend, the `SUPER_ADMIN`/`EDITOR`/`VIEWER` roles from `Backend-Architecture-Specification.md §4.3`.

---

## 2. Technology Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 + Vite | Fast dev server, no SSR overhead needed for an internal tool |
| Language | TypeScript (strict mode) | Matches backend's TS discipline; catches contract drift at compile time |
| Routing | React Router v6 (data router) | Loader/action pattern maps cleanly onto the CMS's auth-gated routes |
| Styling | Tailwind CSS v3 + CSS variables for tokens | Utility-first, mobile-first breakpoints out of the box |
| Component primitives | Radix UI (Dialog, Dropdown, Popover, Tabs, Tooltip, Accordion, Toast) | Accessible, unstyled, composable |
| Icons | lucide-react | Matches icon keys already used in backend content (`Sparkles`, `Cloud`, `Network`, `Code2`, `BriefcaseBusiness`, etc.) |
| Server state | TanStack Query (React Query) v5 | Caching, retries, background refetch, optimistic updates for CMS CRUD |
| Client/UI state | Zustand (small slices only: sidebar collapsed, active theme, command palette open) | Avoid a global store for things React Query already owns |
| Forms | React Hook Form + Zod + `@hookform/resolvers` | Schema-driven validation matching backend Zod schemas |
| HTTP client | Axios | Interceptor-based auth refresh, matches backend's Bearer-token model |
| Rich text / block editor | Tiptap (ProseMirror-based) with a **custom node per block type** | Only editor with the extensibility to model 24 discriminated block types as first-class nodes |
| Drag & drop | `@dnd-kit/core` + `@dnd-kit/sortable` | Touch-friendly (required for mobile reorder), accessible, no legacy HTML5 DnD API |
| Charts | Recharts | Dashboard analytics cards |
| Date handling | `date-fns` | Lightweight, matches ISO `YYYY-MM-DD` contract fields |
| Animation | Framer Motion | Page transitions, drawer/modal motion, list reorder animation |
| File upload | Native `fetch`/Axios direct-to-Cloudinary using the signed URL from `POST /api/cms/media/sign-upload` | Matches backend's signed-upload strategy exactly |
| Testing | Vitest + React Testing Library + Playwright (E2E) | Unit/component + critical-flow E2E |
| Linting/formatting | ESLint + Prettier + `eslint-plugin-jsx-a11y` | Accessibility linting enforced at CI, not just code review |

---

## 3. Folder Structure

```
cms-frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx                       # Router + providers root
│   ├── app/
│   │   ├── routes.tsx                 # Route tree (see §4)
│   │   ├── providers/
│   │   │   ├── AppProviders.tsx       # Composes all context providers
│   │   │   ├── QueryProvider.tsx      # React Query client + devtools
│   │   │   ├── ThemeProvider.tsx      # Dark mode + design tokens
│   │   │   ├── AuthProvider.tsx       # Session, role, permissions
│   │   │   └── ToastProvider.tsx      # Radix Toast root
│   │   └── layouts/
│   │       ├── AuthLayout.tsx         # Centered card, used by /login
│   │       ├── DashboardLayout.tsx    # Sidebar + navbar + content, desktop
│   │       └── DashboardLayoutMobile.tsx  # Bottom-nav + drawer sidebar variant (see §8)
│   │
│   ├── pages/                         # One folder per route (see §12)
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── home-editor/
│   │   ├── skills-editor/
│   │   ├── projects/
│   │   │   ├── ProjectsListPage.tsx
│   │   │   └── ProjectEditorPage.tsx
│   │   ├── blogs/
│   │   │   ├── BlogsListPage.tsx
│   │   │   └── BlogEditorPage.tsx
│   │   ├── experience/
│   │   ├── about-editor/
│   │   ├── contact-editor/
│   │   ├── messages/
│   │   ├── meeting-requests/
│   │   ├── media-library/
│   │   ├── seo/
│   │   ├── settings/
│   │   ├── users/
│   │   ├── roles/
│   │   ├── audit-logs/
│   │   ├── profile/
│   │   └── errors/                    # 404 / 403 / 500 pages
│   │
│   ├── components/
│   │   ├── ui/                        # Shared primitives (§14): Button, Input, Select,
│   │   │                               # Badge, Card, Table, Tabs, Modal, Drawer, Tooltip,
│   │   │                               # Dropdown, Popover, Accordion, CommandPalette, Avatar
│   │   ├── layout/                     # Sidebar, Navbar, MobileTabBar, Breadcrumbs
│   │   ├── feedback/                   # Toast, Skeleton, EmptyState, ErrorBoundary, Spinner
│   │   ├── form/                       # FormField, FormSection, SlugInput, TagInput,
│   │   │                               # RichTextField, ImageUploadField, DatePickerField
│   │   ├── table/                      # DataTable, TablePagination, TableToolbar (search/filter/sort)
│   │   ├── media/                      # MediaPicker, MediaGrid, UploadDropzone, ImagePreview
│   │   ├── editor/                     # Blog block editor — see §21
│   │   │   ├── BlockEditor.tsx
│   │   │   ├── BlockToolbar.tsx
│   │   │   ├── nodes/                  # one file per block type (24 total)
│   │   │   ├── EditorSidebar.tsx       # SEO fields, publish controls, revision history
│   │   │   └── PreviewPane.tsx
│   │   ├── charts/                     # DashboardChart wrappers around Recharts
│   │   └── domain/                     # Feature-specific composites (ProjectCard, BlogRow, etc.)
│   │
│   ├── features/                       # Resource Manager instances (§28) per module
│   │   ├── projects/
│   │   │   ├── projects.service.ts
│   │   │   ├── projects.hooks.ts
│   │   │   ├── projects.schema.ts      # Zod schema ported from README contract
│   │   │   └── ProjectResourceManager.tsx
│   │   ├── blogs/ (same shape)
│   │   ├── experience/ (same shape)
│   │   ├── skills/
│   │   ├── home/
│   │   ├── about/
│   │   ├── contact/
│   │   ├── media/
│   │   ├── seo/
│   │   ├── settings/
│   │   ├── users/
│   │   ├── roles/
│   │   └── audit-logs/
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── axiosClient.ts          # §7.1
│   │   │   ├── envelope.ts             # unwraps { data, meta } / { error, meta }
│   │   │   └── endpoints.ts            # centralized URL constants, mirrors CMS-CONSTRUCTION-README.md
│   │   ├── auth/
│   │   │   ├── tokenStore.ts           # in-memory access token
│   │   │   └── permissions.ts          # RBAC helper (see §6)
│   │   ├── validation/
│   │   │   └── shared-schemas.ts       # slugSchema, urlSchema, etc. mirrored from backend §7
│   │   └── utils/
│   │       ├── formatDate.ts
│   │       ├── slugify.ts
│   │       └── readingTime.ts          # client-side estimate only; server value is source of truth
│   │
│   ├── hooks/                          # Cross-cutting hooks, not resource-specific (§9)
│   │   ├── useBreakpoint.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useDebouncedValue.ts
│   │   ├── useKeyboardShortcut.ts
│   │   ├── useAutosave.ts
│   │   └── usePermission.ts
│   │
│   ├── stores/                         # Zustand slices (§7.3)
│   │   ├── uiStore.ts                  # sidebar collapsed, command palette
│   │   └── editorStore.ts              # active block editor local state
│   │
│   ├── theme/                          # §15 design tokens
│   │   ├── tokens.css
│   │   └── tailwind.config.ts
│   │
│   └── types/                          # TS types mirrored from backend field contracts
│       ├── project.types.ts
│       ├── blog.types.ts
│       ├── skills.types.ts
│       └── ...
│
├── tests/
│   ├── unit/
│   ├── component/
│   └── e2e/
├── .env.example
├── tailwind.config.ts
├── vite.config.ts
├── package.json
└── tsconfig.json
```

**Naming convention (enforced):**
- Files: `PascalCase.tsx` for components, `camelCase.ts` for hooks/utils/services.
- Folders: `kebab-case`.
- One default export per component file; named exports for hooks/utils.
- Test files colocated as `ComponentName.test.tsx` next to the component, except E2E which lives in `tests/e2e`.

---

## 4. Routing Structure

React Router v6 data router. All CMS routes are nested under a `RequireAuth` layout route; each further nests under `RequirePermission(module, action)` where RBAC applies.

```
/login                                  (public)
/                                       → redirect to /dashboard

/dashboard                              dashboard:read

/home                                   home:read | home:update

/skills                                 skills:read | skills:update

/projects                               projects:read
/projects/new                           projects:create
/projects/:slug                         projects:read, projects:update

/blogs                                  blogs:read
/blogs/new                              blogs:create
/blogs/:slug                            blogs:read, blogs:update

/experience                             experience:read | experience:create/update/delete

/about                                  about:read | about:update

/contact                                contact:read | contact:update
/messages                               messages:read | messages:update
/meeting-requests                       meeting-requests:read | meeting-requests:update

/media                                  media:read | media:create/delete

/seo                                    seo:read | seo:create/update/delete

/settings                               settings:read | settings:update   (SUPER_ADMIN only per backend §4.3)

/users                                  users:read | users:create/update
/roles                                  roles:read | roles:update
/audit-logs                             settings:read

/profile                                (any authenticated user, own account only)

/403
/404
/500
```

- Route params validated against the slug regex before firing the detail fetch (`^[a-z0-9]+(?:-[a-z0-9]+)*$`), matching backend contract — an invalid slug shape short-circuits straight to `/404` without a network call.
- Every list route supports query-string-driven state (`?page=&search=&category=&sort=`) so filters are shareable/bookmarkable and survive a refresh.
- Unknown routes → `/404`. A `403` thrown by `RequirePermission` renders the `/403` page in place (no redirect, preserves the URL so the user can request access without losing context).

---

## 5. Authentication Flow

Maps directly to `Backend-Architecture-Specification.md §4.2` and the live `CMS-CONSTRUCTION-README.md` auth endpoints.

1. `POST /api/cms/auth/login` with `{ email, password }` → `{ accessToken }` in body, refresh token set as an httpOnly cookie by the backend (frontend never touches it directly).
2. Access token stored **in memory only** (`lib/auth/tokenStore.ts`, a module-level variable, not `localStorage`/`sessionStorage`) — mitigates XSS token theft. This means a hard page refresh requires a silent re-auth.
3. On app boot, `AuthProvider` calls `POST /api/cms/auth/refresh` once (cookie-based) to silently re-establish a session before rendering any protected route; show a full-screen loading state during this check, never a flash of the login page.
4. Every CMS request attaches `Authorization: Bearer <accessToken>` via an Axios request interceptor.
5. Axios response interceptor: on `401`, call refresh once, retry the original request once; if refresh also fails, clear session and redirect to `/login` with the originally-requested path preserved (`?redirect=/projects/foo`) so login returns the user to where they were.
6. On `403`, do **not** log the user out — render the `/403` state (see §35) since this is a permissions issue, not an auth issue.
7. `POST /api/cms/auth/logout` on explicit logout, clears in-memory token and lets the backend invalidate the refresh cookie.
8. Account lockout (5 failed attempts / 15 min, per backend §4.2) surfaces as a specific error message on the login form, not a generic "invalid credentials."

---

## 6. Role Based Access (RBAC)

Backed by `Backend-Architecture-Specification.md §4.3` — three seeded roles, permission matrix of `(module, action)`.

- On login/refresh, the access token or a companion `/api/cms/users/me`-style profile call (if the backend exposes one; otherwise decode role from JWT claims) supplies the current user's `role` and resolved permission set.
- `lib/auth/permissions.ts` exposes `can(module, action): boolean` and a `usePermission(module, action)` hook.
- `<RequirePermission module="projects" action="update">` route/element wrapper — used both at the route level (§4) and inline to hide/disable individual UI actions (e.g., a `VIEWER` sees the Projects list but no "New Project" button, no edit/delete affordances, form fields rendered `disabled`).
- Permission checks are **UI convenience only** — the backend is the real enforcement boundary. The frontend never assumes a hidden action is actually blocked; it still handles a `403` response gracefully from any request (toast: "You don't have permission to do that").
- `/settings` is gated additionally to `SUPER_ADMIN` per backend §4.3, enforced the same way.

---

## 7. API Layer Architecture

### 7.1 Axios Architecture

One shared client (`lib/api/axiosClient.ts`):

```
baseURL: import.meta.env.VITE_API_BASE_URL   (e.g. http://localhost:4000)
withCredentials: true                         (refresh cookie)
headers: { 'Content-Type': 'application/json' }

Request interceptor  → attach Authorization: Bearer <token>
Response interceptor → unwrap { data, meta } envelope on success;
                        on { error } shape, throw a typed ApiError(code, message, details[]);
                        on 401 → single refresh-and-retry (per §5);
                        on 429 → surface a rate-limit-specific toast, do not retry automatically.
```

- `lib/api/envelope.ts` centralizes unwrapping so every service function returns the inner `data`, never the raw envelope.
- `lib/api/endpoints.ts` is a flat constants file mirroring every route in `CMS-CONSTRUCTION-README.md` §"Endpoint Inventory" verbatim (e.g. `CMS_PROJECTS = '/api/cms/projects'`, `CMS_PROJECT_PUBLISH = (slug) => \`/api/cms/projects/${slug}/publish\``) — services import from here, never hardcode a URL string.
- `ApiError` carries `code`, `message`, `details: { field, message }[]` so form layers can map `details` directly onto React Hook Form's `setError`.

### 7.2 React Query Strategy

| Concern | Convention |
|---|---|
| Query keys | Hierarchical arrays: `['projects', 'list', { page, category, search }]`, `['projects', 'detail', slug]` — enables targeted invalidation |
| Invalidation | On any mutation (create/update/delete/publish/reorder), invalidate the resource's `list` key and, if applicable, the specific `detail` key |
| Stale time | List queries: 30s (CMS data changes often during editing sessions). Detail queries: 0 (always fresh on navigation, since edits happen there) |
| Optimistic updates | Used only for: reorder (drag feels broken without it), publish/unpublish toggle, status updates on Messages/Meeting Requests. Everywhere else, wait for server confirmation before updating the UI — CMS correctness matters more than perceived speed for content edits |
| Pagination | `useInfiniteQuery` for the Media Library grid (matches infinite-scroll UX); `useQuery` with page-number state for all tabular list views (Projects, Blogs, Users, Audit Logs) — CMS operators expect page numbers on data tables, not infinite scroll |
| Mutation error handling | Every mutation hook maps `ApiError.details` onto form field errors; a top-level toast fires only for errors with no field-level home (e.g. network failure, 403, 500) |
| Global query client config | `retry: 1` for queries (avoid hammering a down backend), `retry: 0` for mutations (never silently double-submit a create/update) |

### 7.3 Context Providers

| Provider | Owns | Notes |
|---|---|---|
| `QueryProvider` | React Query client instance | Devtools enabled in dev only |
| `AuthProvider` | session, current user, permission set, silent-refresh-on-boot | Wraps the entire router |
| `ThemeProvider` | dark/light mode, reads/writes a single `theme` preference | See §15 — persisted via `PUT /api/cms/users/:id` profile prefs if the backend supports it, else local-only |
| `ToastProvider` | Radix Toast viewport + imperative `toast()` API | See §17 |
| `CommandPaletteProvider` (Zustand-backed, not context) | ⌘K palette open state | See §32 |

No global "app state" context — everything else is either React Query (server state) or colocated component state.

---

## 8. Responsive & Mobile Architecture

This CMS is **mobile-first and fully responsive**, not "responsive for the marketing pages and desktop-only for the editor." Every screen in §12 must satisfy the breakpoint rules below, including the block editor.

### 8.1 Breakpoints (Tailwind defaults, used consistently)

| Token | Width | Primary use |
|---|---|---|
| `sm` | 640px | Large phones (landscape) |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops — **this is the desktop-shell threshold** |
| `xl` | 1280px | Standard desktop |
| `2xl` | 1536px | Wide monitors |

Design and build mobile-first: base styles target `<640px`, then layer `sm:` / `md:` / `lg:` overrides upward. Never build desktop-first and add a mobile override as an afterthought.

### 8.2 Shell Behavior by Breakpoint

| Breakpoint | Sidebar | Navigation | Layout component |
|---|---|---|---|
| `< lg` (phone/tablet) | Hidden by default, opens as a full-height slide-in **Drawer** (Radix Dialog + Framer Motion slide) triggered by a hamburger in the Navbar | A fixed **bottom tab bar** with the 5 most-used destinations (Dashboard, Projects, Blogs, Media, More) — "More" opens the full nav drawer | `DashboardLayoutMobile.tsx` |
| `≥ lg` | Persistent, collapsible-to-icons sidebar (§14.1) | Sidebar only, no bottom bar | `DashboardLayout.tsx` |

`useBreakpoint()` hook (backed by `useMediaQuery` on `(min-width: 1024px)`) decides which layout shell renders — this is a genuine component swap, not a CSS-only hide/show, because the interaction patterns (drawer vs. persistent sidebar, bottom-tab vs. none) are different enough to warrant it. Everything **inside** the content area is one shared component tree with responsive Tailwind classes — only the shell forks.

### 8.3 Data Tables on Mobile

Tables (Projects list, Blogs list, Messages, Users, Audit Logs) never horizontally scroll a cramped table on mobile. Below `md`, `DataTable` (§18) switches to a **stacked card list** — one card per row, primary field as the card title, secondary fields as labeled key/value pairs, row actions collapsed into a kebab menu. This is a rendering mode built into `DataTable` itself (`variant="table" | "cards"`, auto-selected by breakpoint), not a separate component per module.

### 8.4 Forms on Mobile

- Multi-column form grids (e.g. Project Editor's metadata section) collapse to a single column below `md`.
- Sticky save/publish action bar pins to the bottom of the viewport on mobile (safe-area-aware, `env(safe-area-inset-bottom)`) instead of requiring a scroll to the top/bottom of a long form.
- Date/time pickers use native `<input type="date">`/`<input type="time">` on touch devices (better mobile UX than a custom popover calendar) via a single `DatePickerField` component that branches on `useBreakpoint()`.

### 8.5 Block Editor on Mobile

The blog block editor (§21) is the highest-risk area for "desktop-only" drift. Rules:
- The block toolbar collapses from an always-visible inline toolbar (desktop) to a floating contextual toolbar that appears above the on-screen keyboard when a block is focused (mobile), using `visualViewport` resize handling to avoid keyboard-overlap.
- Drag-to-reorder blocks uses `@dnd-kit`'s pointer+touch sensors together (not mouse-only) so reordering works with a finger.
- The SEO/publish sidebar (desktop: persistent right rail) becomes a bottom **Drawer** on mobile, opened via a "Publish settings" button in the sticky action bar — never a second full page navigation.
- Image/media insertion opens the Media Picker as a full-screen mobile sheet (not a small centered modal, which is unusable on a phone).

### 8.6 Touch Targets & Gestures

- Minimum 44×44px hit area for all interactive elements at `< lg`, enforced via a Tailwind spacing utility applied through the shared `Button`/`IconButton` components — not something each screen has to remember.
- No hover-only affordances below `lg` (e.g. row actions that only appear on `:hover` on desktop must always be visible, or moved into the kebab menu, on touch devices).
- Swipe-to-dismiss supported on Drawers and Toasts on touch devices via Framer Motion drag gestures.

### 8.7 Command Palette & Keyboard Shortcuts

⌘K command palette (§32) and keyboard shortcuts are **desktop-enhancement only** — they must not be the only way to perform an action. Every shortcut has a visible, tappable UI equivalent, which is also what mobile users see by default.

---

## 9. Hooks Structure

Cross-cutting hooks live in `src/hooks/`; resource-specific data hooks live beside their service in `src/features/{module}/{module}.hooks.ts`.

| Hook | Purpose |
|---|---|
| `useBreakpoint()` | Returns current breakpoint name; drives shell/table/form responsive branching (§8) |
| `useMediaQuery(query)` | Low-level match-media hook `useBreakpoint` is built on |
| `useDebouncedValue(value, delay)` | Search inputs, autosave triggers |
| `useAutosave(value, saveFn, delay)` | Debounced save-on-change for the block editor and singleton editors (Home, About, Skills, Contact); shows a "Saving… / Saved" indicator, never blocks the UI |
| `useKeyboardShortcut(combo, handler, { enabled })` | Registers global shortcuts (§33), auto-disabled on `< lg` per §8.7 |
| `usePermission(module, action)` | Thin wrapper over `lib/auth/permissions.ts` for inline RBAC checks |
| `useConfirm()` | Imperative confirmation-dialog trigger (§17.4), returns a promise resolved/rejected by the user's choice |
| `usePagination({ page, pageSize })` | Syncs page state with the URL query string |
| `useReorder(items, onReorderMutation)` | Wraps `@dnd-kit` sortable state + optimistic list update + mutation call, shared by Projects/Experience/Skills/Blocks reordering |

Each resource's `{module}.hooks.ts` (e.g. `features/projects/projects.hooks.ts`) exports: `useProjectsList(params)`, `useProject(slug)`, `useCreateProject()`, `useUpdateProject()`, `useDeleteProject()`, `usePublishProject()`, `useReorderProjects()` — one hook per backend endpoint, thin wrappers around React Query + the service function.

---

## 10. Services Structure

One `{module}.service.ts` per backend module in `src/features/{module}/`. A service is a pure async-function layer with **zero React** — it only calls the shared Axios client against `lib/api/endpoints.ts` constants and returns typed data. Example shape (illustrative, not code to paste verbatim):

```
projects.service.ts
  listProjects(params) → GET  CMS_PROJECTS
  getProject(slug)      → GET  CMS_PROJECT(slug)
  createProject(body)   → POST CMS_PROJECTS
  updateProject(slug, body) → PUT CMS_PROJECT(slug)
  deleteProject(slug)   → DELETE CMS_PROJECT(slug)
  publishProject(slug, status) → PATCH CMS_PROJECT_PUBLISH(slug)
  reorderProjects(items) → PATCH CMS_PROJECTS_REORDER
```

Every request/response body shape matches `CMS-CONSTRUCTION-README.md`'s documented payloads exactly (e.g. the Project create body's full field list, the Skills update body's `categories[]`/`learningItems[]` shape). Services never transform field names — the DTO the backend defines is the DTO the frontend uses; any display-only transformation happens in the component layer, not the service layer.

---

## 11. Component Structure

Four tiers, strictly layered (a lower tier never imports from a higher one):

1. **`components/ui/`** — pure presentational primitives (Button, Input, Card, Table shell, Modal shell). No API calls, no business logic, fully generic, fully responsive on their own.
2. **`components/{feedback,form,table,media,editor,charts}/`** — composite building blocks that combine `ui/` primitives with a specific interaction pattern (e.g. `DataTable` combines `Table` + `TablePagination` + `TableToolbar` + responsive card-mode from §8.3). Still no direct API calls — data comes in via props.
3. **`components/domain/`** — feature-aware composites that know about a specific content shape (e.g. `ProjectCard`, `BlogRow`, `MeetingRequestListItem`) but still receive data via props, not by fetching it themselves.
4. **`features/{module}/`** — the only place that wires React Query hooks to domain components, forming the actual "Resource Manager" screens (§28).

This layering is what makes the CRUD pattern in §28 reusable: swapping `projects` for `experience` means swapping the service, the schema, and the domain components — the `ui/` and generic composite layers never change.

---

## 12. Page Structure

One folder per route under `src/pages/`, each exporting a single page component consumed by the route tree (§4). A page component's job is: read route params/query string → call the relevant `features/{module}` hooks → compose domain components → handle loading/error/empty states (§16). Pages do not contain business logic beyond orchestration.

Every list-type page (Projects, Blogs, Experience, Media, Messages, Meeting Requests, Users, Audit Logs) is built on the shared `ResourceManager` composition from §28, configured per module rather than hand-rolled.

Every singleton-type page (Home, Skills, About, Contact, Settings) is built on a shared `SingletonEditor` composition: fetch-on-mount, edit inline, autosave (§9 `useAutosave`) with a manual "Save now" fallback, no create/delete affordances.

---

## 13. Shared UI Components

Defined once in `components/ui/`, consumed everywhere: `Button`, `IconButton`, `Input`, `Textarea`, `Select`, `Combobox`, `Checkbox`, `Switch`, `RadioGroup`, `Badge`, `Avatar`, `Card`, `Tabs`, `Accordion`, `Breadcrumbs`, `Tooltip`, `Popover`, `Dropdown`, `CommandPalette`, `Table` (shell only — see `DataTable` in §18 for the full data-grid composite).

Every primitive:
- Is built on the matching Radix primitive where one exists (accessibility for free).
- Exposes a `size` prop (`sm | md | lg`) and follows the spacing scale in §15.5, not ad-hoc padding per usage site.
- Is responsive by default (e.g. `Dropdown` becomes a bottom sheet on `< sm` automatically, `Tabs` becomes a horizontally-scrollable pill row on `< md`).

---

## 14. Layout Components

### 14.1 Sidebar Architecture

Desktop (`≥ lg`, `DashboardLayout.tsx`):
- Persistent left rail, default width 260px, collapsible to a 72px icon-only rail (toggle stored in `uiStore` Zustand slice, persisted to `localStorage` since it's a pure UI preference, not user data).
- Grouped nav sections matching the module list in `CMS-CONSTRUCTION-README.md`'s "CMS Frontend Construction Notes": **Content** (Home, Skills, Projects, Blogs, Experience, About), **Engagement** (Contact, Messages, Meeting Requests), **Library** (Media, SEO), **Admin** (Settings, Users, Roles, Audit Logs).
- Active route highlighted; items the current role can't `read` are omitted entirely (not shown-disabled — RBAC hides, it doesn't tease).

Mobile (`< lg`): same nav content, rendered inside the Drawer described in §8.2, opened from the Navbar hamburger.

### 14.2 Navbar Architecture

- Left: hamburger (mobile only, `< lg`) / sidebar-collapse toggle (desktop).
- Center-left: `Breadcrumbs` reflecting the current route.
- Right: global search trigger (opens `CommandPalette`), notification bell (unread Messages/Meeting Requests count), theme toggle, user menu (Avatar → Profile / Logout).
- Sticky at the top on all breakpoints; on mobile it's paired with the bottom tab bar (§8.2), not a replacement for it.

---

## 15. Theme System

### 15.1 Dark Mode

- `ThemeProvider` toggles a `data-theme="light|dark"` attribute on `<html>`; Tailwind configured with `darkMode: 'class'` mapped to that attribute.
- Default: system preference (`prefers-color-scheme`) on first load, then explicit user choice persisted (local storage at minimum; synced to the user's backend profile if/when such a field exists).
- No component hardcodes a color — every color reference goes through the CSS variable tokens in §15.2, so dark mode requires zero per-component logic.

### 15.2 Color Tokens

Defined as CSS variables in `theme/tokens.css`, consumed via Tailwind's `theme.extend.colors` referencing `var(--token-name)`:

| Token | Role |
|---|---|
| `--bg-canvas` | App background |
| `--bg-surface` | Card/panel background |
| `--bg-surface-hover` | Hover state for interactive surfaces |
| `--border-subtle` / `--border-strong` | Two-tier border system |
| `--text-primary` / `--text-secondary` / `--text-muted` | Three-tier text hierarchy |
| `--accent` / `--accent-hover` / `--accent-contrast` | Primary brand accent (buttons, active nav, links) |
| `--success` / `--warning` / `--danger` / `--info` | Semantic states (publish status, toasts, badges) |

Each token has a light and dark value; components reference only the semantic token name, never a raw hex.

### 15.3 Typography System

- Font: a single variable font (e.g. Inter or Geist) for UI text; a monospace font (e.g. JetBrains Mono) reserved for code blocks in the blog editor.
- Type scale (rem-based, mobile-first — same scale at all breakpoints, since CMS UI text doesn't need to grow on desktop the way marketing copy does): `xs 0.75 / sm 0.875 / base 1 / lg 1.125 / xl 1.25 / 2xl 1.5 / 3xl 1.875`.
- Heading weight 600, body weight 400, one line-height pair (`1.2` tight for headings, `1.6` relaxed for body/paragraph blocks).

### 15.4 Radius & Elevation

- Radius scale: `sm 6px / md 10px / lg 14px / full 9999px` — cards use `lg`, inputs/buttons use `md`, badges/pills use `full`.
- Elevation via soft, low-opacity shadows only (no hard drop shadows) — two levels: `elevation-1` (cards at rest) and `elevation-2` (popovers/dropdowns/modals), both defined as tokens so dark mode can substitute a border-based effect instead of a shadow where shadows read poorly on dark surfaces.

### 15.5 Spacing & Grid

- 4px base unit, Tailwind default spacing scale used as-is (no custom scale) for consistency with the ecosystem's tooling.
- Page content max-width `1280px` on desktop, centered, with responsive gutters: `16px` mobile, `24px` tablet, `32px` desktop.
- List/grid views (Media Library, Project cards on a dashboard summary) use CSS grid with `auto-fill`/`minmax` rather than fixed column counts, so column count degrades naturally across breakpoints without per-breakpoint overrides.

### 15.6 Responsive Rules

Covered fully in §8. The theme system's contribution: all spacing/typography/radius tokens are breakpoint-agnostic (same value everywhere) so that responsiveness is purely a matter of layout/flow (flex-wrap, grid columns, stacking), not of tokens changing size — this keeps the design system predictable across breakpoints.

---

## 16. Loading States, Skeleton Loaders, Error Boundaries

- Every `features/{module}` list/detail hook exposes `isLoading`/`isError`/`isFetching` from React Query; pages render a **skeleton** matching the eventual content's layout (not a generic spinner) for `isLoading`, and a subtle top-of-content progress bar for background `isFetching` (refetch-on-focus, etc.) so the UI doesn't jump.
- `components/feedback/Skeleton.tsx` is a generic shimmer block; each domain component (e.g. `ProjectCard`) ships a matching `ProjectCardSkeleton` so list skeletons look like the real grid, not a blank rectangle.
- A single top-level `ErrorBoundary` (React error boundary, class component required by the API) wraps the router outlet, rendering the `/500` page content inline (not a hard redirect) for any uncaught render error, with a "Reload" action and — in dev — the actual stack trace.
- Per-query errors (a specific list/detail fetch failing) render an inline `EmptyState`-style error card with a "Retry" button calling React Query's `refetch()`, scoped to that section rather than tearing down the whole page.

---

## 17. Toast, Modal, Drawer, Confirmation Systems

### 17.1 Toast System
Radix Toast + `ToastProvider` (§7.3). Imperative API: `toast.success(msg)`, `toast.error(msg)`, `toast.info(msg)`. Auto-dismiss 4s (errors 6s), swipe-to-dismiss on touch (§8.6), stacked max 3 visible.

### 17.2 Modal System
Radix Dialog wrapped as `Modal`. Used for short, focused tasks that don't warrant a full drawer (e.g. "Rename tag", "Confirm slug change"). Centered on desktop; on `< sm`, modals render as a bottom sheet (slide-up, rounded top corners) rather than a centered box, matching native mobile conventions.

### 17.3 Drawer System
Radix Dialog + `side="right"` (desktop) / `side="bottom"` full-height (mobile) variant, used for: navigation (mobile sidebar, §8.2), the block editor's SEO/publish panel on mobile (§8.5), the Media Picker, and any "quick edit without leaving the list" pattern (e.g. editing a single Experience entry from the list without a full page nav).

### 17.4 Confirmation Dialogs
`useConfirm()` hook (§9) opens a standardized `ConfirmDialog` (built on `Modal`) for every destructive action (delete project, delete media asset, remove user) — never a native `window.confirm`. Copy always names the specific item ("Delete **QConnect**? This can't be undone.") rather than a generic "Are you sure?".

---

## 18. Table Design

`DataTable` (`components/table/DataTable.tsx`) is the single implementation backing every list screen.

- **Responsive mode**: `table` on `≥ md`, `cards` on `< md` (§8.3), same data/props, mode selected internally via `useBreakpoint()`.
- **Pagination**: page-number based (`TablePagination`), synced to the URL query string via `usePagination` (§9); page size selector where the backend supports it, otherwise a fixed page size matching the backend's documented default.
- **Search**: a single debounced search input in `TableToolbar` (`useDebouncedValue`, 300ms) mapped to the resource's `search` query param where the backend contract defines one (Projects has one; CMS list endpoints without a documented search param get client-side filtering only, clearly note this is a frontend-only convenience, not a server capability).
- **Sorting**: column headers clickable where the backend exposes a `sort` param (Projects: `newest/oldest/az`); otherwise sorting is disabled on that column, not silently client-side-only (avoids the "sorted the visible page only" trap on server-paginated data).
- **Filtering**: `TableToolbar` renders filter `Select`/`Combobox` controls per resource (category for Projects, status for Messages/Meeting Requests, role for Users) — filters map 1:1 to documented query params; undocumented filter needs are flagged, not invented.
- **Row actions**: an actions column (desktop) / kebab menu inside the card (mobile) — Edit, Publish/Unpublish, Delete, each individually RBAC-gated per §6.

---

## 19. Reusable Form System & Validation Strategy

- Every form is built on React Hook Form's `useForm` with a `zodResolver`.
- **Zod schemas are ported field-for-field from the README's field-by-field contract** (e.g. `hero.headline`: trimmed, 10–60 chars; `project.title`: trimmed, 3–48 chars; `blog.excerpt`: trimmed, 40–180 chars) and stored in `lib/validation/shared-schemas.ts` (cross-module primitives: `slugSchema`, `urlSchema`) plus one `{module}.schema.ts` per feature — this is the frontend's executable copy of the same contract the backend's Zod schemas encode, kept in sync deliberately, not derived automatically (no shared package between two separate repos), so any backend contract change requires a matching schema update here.
- `FormField` (generic wrapper: label, control, error message, character-count-remaining for length-limited text fields) is the only way form fields are rendered — no ad-hoc `<input>` + manual error `<span>` pairs anywhere in the codebase.
- Server-side validation errors (`ApiError.details[]`) are mapped onto `setError(field, { message })` after submit, so a field can show a server-only error (e.g. duplicate slug) the client schema couldn't catch.
- Long-form singleton editors (Home, About) and the block editor auto-save via `useAutosave` (§9) rather than requiring an explicit Save click for every keystroke; explicit "Save" remains available and always visible for user confidence.

---

## 20. File Upload & Image Preview Components

- `UploadDropzone` — drag-and-drop (desktop) + tap-to-browse (always, and the only option on mobile where drag-and-drop from the OS is rare) file picker.
- Upload flow strictly follows the backend's signed-upload strategy (`Backend-Architecture-Specification.md §6`): request a signature from `POST /api/cms/media/sign-upload`, upload the binary directly to Cloudinary client-side (never proxied through the CMS backend), then persist the resulting asset via `POST /api/cms/media`.
- Upload progress shown per-file (Cloudinary's XHR upload progress event), with a cancel affordance.
- `ImagePreview` renders the Cloudinary URL with the `f_auto,q_auto` delivery transform (per backend §6) and, where a named preset applies (`thumbnail`/`hero`/`gallery`), requests that preset rather than the raw original — never downloads a full-resolution image just to show a thumbnail.
- `ImageUploadField` composes `UploadDropzone` + `ImagePreview` + a "Replace" / "Remove" affordance, used everywhere a single-image field appears (Project thumbnail, Blog cover, About profile image).

---

## 21. Rich Text Blog Editor

The flagship module. Built on Tiptap with one custom node per backend block `type`, so the editor's internal document model **is** the `blocks[]` array the backend expects — no lossy conversion step between "what the editor shows" and "what gets saved."

### 21.1 Supported Block Types
One Tiptap node/extension per type enumerated in the backend contract: `heading`, `paragraph`, `image`, `gallery`, `video`, `code` (with syntax highlighting via `lowlight`), `quote`, `divider`, `callout`, `table`, `bullet-list`, `numbered-list`, `checklist`, `pdf`, `docx`, `ppt`, `zip`, `github-link`, `live-demo`, `documentation`, `research-paper`, `youtube`, `google-drive`, `button`, `markdown`.

### 21.2 Toolbar
Desktop: persistent inline toolbar (bubble menu on text selection + a slash-command `/` menu for inserting new block types, Notion-style). Mobile: slash-command menu only (space-constrained), contextual floating toolbar above the keyboard for text formatting (§8.5).

### 21.3 Editing Behaviors
- **Drag & drop images**: dropped directly into the editor triggers the same signed-upload flow as §20, inserting an `image` block on completion with a placeholder/progress state in place until the upload resolves.
- **Markdown support**: a `markdown` block type exists explicitly in the contract for raw markdown passthrough; additionally, common markdown shortcuts (`## `, `- `, `` ``` ``, `> `) auto-convert to their corresponding block while typing in any block, matching the Notion/Hashnode authoring feel.
- **Autosave**: debounced (`useAutosave`, ~2s idle) per-edit save calling the block-level endpoints (`POST .../blocks`, `PATCH .../blocks/reorder`, `DELETE .../blocks/:blockId`) rather than replacing the whole article — matches the backend's sub-resource API shape exactly (`CMS-CONSTRUCTION-README.md` "CMS Blogs"). A visible "Saving… / All changes saved" indicator lives in the sticky action bar.
- **Draft/Publish**: separate, explicit actions — "Save Draft" persists `publishStatus: draft`; "Publish" (RBAC: `blogs:publish`) calls the publish action and requires the SEO fields (see below) to be valid first.
- **Preview mode**: a toggle rendering the same block tree read-only through the public site's actual block-renderer visual style (as close a match as the CMS can achieve without importing the public repo), in a modal/full-screen overlay.
- **Revision history**: a sidebar panel listing prior saved states (if the backend exposes revision data — flagged as a dependency on backend support not yet confirmed in the endpoint inventory; build the UI, degrade gracefully — hide the panel — if the endpoint doesn't exist yet).
- **Undo/redo**: native Tiptap history (`Ctrl/Cmd+Z` / `Shift+Ctrl/Cmd+Z`), scoped to the current editing session (not persisted across reloads).

### 21.4 SEO & Metadata Panel (`EditorSidebar.tsx`)
Desktop: persistent right rail. Mobile: bottom Drawer (§8.5). Fields: meta title, meta description, canonical URL, featured image (reuses `ImageUploadField`), OG image, **slug** (auto-generated from title via `slugify`, editable, validated against `slugSchema` with live "available/taken" awareness where feasible), scheduled publish date/time, and read-only computed fields — **reading time** and **word/character count** — which are derived client-side for immediate feedback but the backend's stored `readTimeMinutes` (computed server-side at save, per backend §13) is what's ultimately authoritative and shown once persisted.

---

## 22. Media Library

- `MediaGrid` — responsive CSS grid (§15.5), infinite-scroll (`useInfiniteQuery`, §7.2) over `GET /api/cms/media`.
- Filter by folder (mirroring the backend's `portfolio/{module}/{yyyy}/{mm}/` convention, §Backend §6) and resource type.
- Each asset card shows the `usedIn[]` count/tooltip (backend-provided) so an editor can tell at a glance whether an asset is safe to delete.
- Delete flows through `useConfirm()` (§17.4) and calls `DELETE /api/cms/media/:id`.
- `MediaPicker` is the same `MediaGrid` rendered inside a `Drawer`/full-screen sheet (§8.5) when invoked from `ImageUploadField`'s "Choose existing" option, so uploads and reuse share one visual component.

---

## 23. Tag System & Category System

- Tags (Blog `tags[]`, Project `techTags[]`) use a shared `TagInput` form component (`components/form/TagInput.tsx`): type-to-add, backspace-to-remove-last, duplicate/empty rejected client-side per the field's validation rule (e.g. Blog tags: 0–8 unique, ≤20 chars each), Enter/comma to commit a tag.
- Categories (Project `category`, Blog `category`) are **not** a free-form tag — they render as a `Select`/`Combobox` populated from the backend-recommended enum values documented in the README contract (e.g. Blog: `Articles, Projects, Videos, Resources, AI, AWS, Backend, Frontend, React`), so CMS operators can't silently fragment the taxonomy the public site's filter UI depends on.

---

## 24. Blog Management

The Blogs list page (`BlogsListPage.tsx`) is a `ResourceManager` (§28) instance: `DataTable` columns — cover thumbnail, title, category, status badge (draft/published), publishedAt, readTimeMinutes, tags — with row actions Edit / Publish-Toggle / Delete. "New Article" opens a blank `BlogEditorPage` (§21). The editor page itself is the block editor plus its SEO sidebar; there is no separate "blog metadata form" distinct from the editor — title/excerpt/cover/category live in the editor's header area, blocks in the canvas, SEO/publish in the sidebar, so authoring is one continuous screen, matching Notion/Medium's model rather than a "fill a form, then edit content" two-step flow.

---

## 25. Dashboard Analytics

`/dashboard` calls `GET /api/cms/dashboard/summary`. Layout: a responsive grid (§15.5) of `StatCard`s (counts: published projects, published articles, unread messages, pending meeting requests) plus 1–2 `Recharts`-based trend charts if the summary payload includes time-series data, and a "Recent Activity" panel reading the most recent `auditLogs` entries. All cards degrade gracefully (skeleton → real data → empty-state per card if a given metric has no data yet) rather than blocking the whole dashboard on one slow query — each card is its own React Query hook, not one giant dashboard query gating the entire page.

---

## 26. Notifications

- In-app only for v1 (no push/email from the CMS itself — email notifications, if any, are a backend concern outside this document's scope).
- Navbar bell icon badge = unread count derived from `messages` with `status: received` + `meetingRequests` with `status: received`, polled via React Query's `refetchInterval` (e.g. 60s) rather than a websocket, matching the CRUD-only, non-realtime nature of this backend.
- Clicking the bell opens a `Popover` (desktop) / `Drawer` (mobile) listing the most recent unread items, linking into Messages/Meeting Requests.

---

## 27. Settings, Profile, Permission Management, Audit Logs UI

- **Settings** (`SUPER_ADMIN` only): a `SingletonEditor` instance over `GET/PUT /api/cms/settings`, grouped into tabs matching the backend's own grouping — SEO defaults, Form Settings, Scheduling Settings.
- **Profile**: the current user's own account — name/avatar, password change — scoped to self regardless of role (every authenticated user can reach `/profile`).
- **Permission Management** (`/roles`): a matrix UI (roles as rows, `(module, action)` as columns) rendering/editing the exact `permissions[]` shape from `PUT /api/cms/roles/:id`'s documented body — toggling a cell calls the update mutation with the full recomputed permissions array (backend expects the whole array per role, not a per-cell diff endpoint).
- **Users** (`/users`): `ResourceManager` instance — list, invite/create (`roleName` select constrained to the three seeded roles), activate/deactivate toggle (`PATCH .../:id { active }`) — no self-registration, matching backend §4.2.
- **Audit Logs** (`/audit-logs`, read-only): `DataTable` (no create/edit/delete actions) over `GET /api/cms/audit-logs`, columns: actor, action, module/collection, document, timestamp, with a diff viewer (expandable row) if the backend's `diff` field is populated.

---

## 28. Reusable CRUD Pattern ("Resource Manager")

Every true collection module (Projects, Blogs, Experience, Users, Media within its constraints) is an instance of one generic pattern rather than a bespoke screen:

```
ResourceManager<T>
  ├── List view      → DataTable (§18) bound to {module}.hooks.useXList()
  ├── Create action   → navigates to / opens the module's Editor in "new" mode
  ├── Edit action      → navigates to / opens the module's Editor in "edit" mode
  ├── Delete action    → useConfirm() (§17.4) + {module}.hooks.useDeleteX()
  ├── Publish action   → RBAC-gated toggle + {module}.hooks.usePublishX() (where the module has a publishStatus)
  └── Reorder (optional) → useReorder() (§9) + {module}.hooks.useReorderX() (Projects, Experience, Skills categories/items)
```

Singleton modules (Home, Skills, About, Contact, Settings) use the parallel `SingletonEditor<T>` pattern described in §12 instead — no list, no delete, fetch-and-edit-in-place with autosave.

Building a new module (should the backend add one later) means: add the service functions (§10), add the Zod schema (§19), add the hooks (§9/§10), configure a `ResourceManager` or `SingletonEditor` instance and the domain-specific form fields — the list/table/pagination/RBAC/responsive machinery is never rewritten.

---

## 29. Performance Optimizations

- **Route-based code splitting**: every page in `src/pages/` is lazy-loaded (`React.lazy` + `Suspense`) via the router's lazy route convention — the block editor (Tiptap + all 24 node extensions) in particular must never be in the initial bundle, since most sessions won't touch it every visit.
- **Component-level lazy loading**: heavy, rarely-used pieces (Recharts on the dashboard, the revision-history diff viewer) are dynamically imported.
- React Query's caching (§7.2) avoids redundant refetches on back/forward navigation within a session.
- Images: always requested through Cloudinary's `f_auto,q_auto` + named presets (§20), never the raw original, and use native `loading="lazy"` outside the first viewport.
- Virtualization (`@tanstack/react-virtual`) applied to the Media Library grid and any list expected to regularly exceed ~200 items.
- Debounce all search/autosave inputs (§9) to avoid request storms.

---

## 30–31. Folder/File Naming Convention & State Management Rules

Covered fully in §3 (naming) and summarized state rule: **if it comes from the backend, it lives in React Query — never copy server data into `useState` or Zustand "to make it easier to edit," always mutate through a React Query mutation and let cache invalidation be the source of truth.** Zustand is reserved exclusively for ephemeral UI state that has no server representation (sidebar collapsed, command palette open, theme preference before it's persisted, in-progress block-editor selection state).

---

## 32. Accessibility & Command Palette

- Built on Radix primitives throughout (§13) for correct ARIA roles/focus management/keyboard nav out of the box.
- `eslint-plugin-jsx-a11y` enforced in CI — no `<div onClick>` without a role, no image without `alt`, no form control without an associated label.
- Full keyboard operability: every action reachable via Tab/Enter/Escape, focus trapping in Modals/Drawers, focus restoration to the trigger element on close.
- Color contrast: all token pairs (§15.2) verified against WCAG AA at design-token-definition time, not per-component.
- `CommandPalette` (⌘K / Ctrl+K): fuzzy-searchable jump-to (any Project/Blog by title, any nav destination, common actions like "New Blog Post"). Desktop-only trigger per §8.7, but the palette itself, once open, is fully keyboard navigable and screen-reader announced.

---

## 33. Keyboard Shortcuts

| Shortcut | Action | Scope |
|---|---|---|
| `⌘/Ctrl + K` | Open command palette | Global |
| `⌘/Ctrl + S` | Force-save current editor | Home/About/Blog/Project editors |
| `⌘/Ctrl + Enter` | Publish (from an editor) | Blog/Project editors |
| `Esc` | Close active Modal/Drawer/Palette | Global |
| `/` (slash) | Open block-insert menu | Block editor, cursor in an empty block |

All registered via `useKeyboardShortcut` (§9), auto-disabled below `lg` per §8.7, and always documented in a "Keyboard Shortcuts" help modal reachable from the user menu.

---

## 34. Animations (Framer Motion Guidelines)

- Page-level transitions: subtle fade+slide (150–200ms), never a full-page hard cut, but also never a distracting long transition that delays perceived load.
- Drawers/Modals: spring-based slide/scale-in matching Radix's open/close state via `AnimatePresence`.
- List reordering (`@dnd-kit`): `layout` animations on list items so a drag-drop settles smoothly rather than snapping.
- Skeleton shimmer: a lightweight CSS animation, not Framer Motion (avoid JS-driven animation for something running continuously while data loads).
- Respect `prefers-reduced-motion`: all non-essential animation (page transitions, shimmer, hover micro-interactions) is disabled/reduced when the user's OS setting requests it; functional motion (drag feedback) remains but simplified.

---

## 35. Empty States, 404, 403, 500

- `EmptyState` (`components/feedback/EmptyState.tsx`): icon + message + primary action, used whenever a list/resource has zero items (e.g. "No projects yet — Create your first project") — never just a blank table.
- **404** (`pages/errors/NotFound.tsx`): unknown route or a detail page whose slug doesn't resolve (backend 404) — friendly copy + link back to Dashboard.
- **403** (`pages/errors/Forbidden.tsx`): rendered in-place (not a redirect, per §5/§6) when `RequirePermission` or a `403` API response blocks the current view — explains which permission is missing, offers a link back to a page the user *can* access.
- **500** (`pages/errors/ServerError.tsx`): rendered by the top-level `ErrorBoundary` (§16) or on an unrecoverable API failure — reload action, and in dev mode only, the raw error for debugging.

---

## 36. Testing Strategy

| Layer | Tool | Coverage target |
|---|---|---|
| Unit | Vitest | `lib/`, `hooks/`, Zod schemas, utils (slugify, formatDate, readingTime) |
| Component | React Testing Library | Every `components/ui` and `components/form` primitive; RBAC-gating behavior of `RequirePermission`/`usePermission` |
| Integration | React Testing Library + MSW (mock the Axios layer at the network boundary, matching the real envelope shape from §7.1) | Each `features/{module}` Resource/Singleton flow: list renders, create succeeds, validation errors surface, publish toggles, delete confirms |
| E2E | Playwright | Critical paths only: login → create project → publish → verify on public site is out of scope, but verify CMS state; full blog authoring flow including block insert/reorder/save; RBAC — a `VIEWER` login cannot see create/edit affordances |
| Accessibility | `@axe-core/playwright` in the E2E suite | Zero critical/serious violations on every top-level route |
| Responsive | Playwright viewport presets (`iPhone 13`, `iPad`, `Desktop 1440`) run against the E2E suite's critical paths | Confirms the shell fork (§8.2) and table card-mode (§8.3) actually render correctly at each size, not just that the code compiles |

---

## 37. Deployment Structure & Environment Variables

```
VITE_API_BASE_URL=http://localhost:4000        # or the deployed backend origin
VITE_APP_ENV=development|staging|production
```

- Static build (`vite build`) served from any static host / CDN (this is a pure SPA against the existing backend — no server-side runtime required for the frontend itself).
- `withCredentials: true` (§7.1) requires the deployed frontend origin to be present in the backend's CORS allowlist (`Backend-Architecture-Specification.md §10`) — coordinate the deployed CMS origin with backend config before go-live.
- CI: lint → typecheck → unit/component tests → build → (optional) Playwright E2E against a staging backend → deploy.

---

## 38. Production Checklist

- [ ] Every route in §4 RBAC-gated correctly and verified against all three roles.
- [ ] Every form's Zod schema matches the README's field-by-field contract exactly (lengths, regex, enums).
- [ ] Every list screen has a working empty state, loading skeleton, and error-retry state.
- [ ] Every screen verified at `sm`, `md`, `lg`, and `xl` breakpoints, including the block editor.
- [ ] Access token never persisted to `localStorage`/`sessionStorage`; refresh flow tested for expiry mid-session.
- [ ] Draft content never leaks into any preview shared outside the CMS session.
- [ ] Axe accessibility scan clean on all top-level routes.
- [ ] `prefers-reduced-motion` respected.
- [ ] Bundle-analyzed — block editor and charts confirmed code-split out of the initial load.
- [ ] CORS/env configuration confirmed against the actual deployed backend origin.

---

## 39. Design System Reference (Component Inventory)

Quick-reference inventory of every design-system component this spec requires, all defined once in `components/ui/` (§13) per the tokens in §15:

`Button · IconButton · Input · Textarea · Select · Combobox · Checkbox · Switch · RadioGroup · Badge · Avatar · Card · DataTable (+TablePagination, TableToolbar) · Tabs · Accordion · Breadcrumbs · Tooltip · Popover · Dropdown · CommandPalette · Modal · Drawer · ConfirmDialog · Toast · Skeleton · EmptyState · TagInput · SlugInput · DatePickerField · ImageUploadField · MediaGrid/MediaPicker · BlockEditor (+24 node types) · StatCard · Charts wrapper`

Every one of the above must have a mobile-first responsive implementation per §8 before it is considered "done" — a desktop-only version of any component in this list is an incomplete implementation of this specification, not a later phase.

---

## 40. Summary

This document specifies a **client-rendered, mobile-first React + TypeScript SPA** — Vite, React Router, Tailwind, Radix, TanStack Query, React Hook Form + Zod, Tiptap for the block editor — that consumes the exact, already-implemented backend contract in `CMS-CONSTRUCTION-README.md`, with client-side validation ported field-for-field from `README.md`'s contract tables. Every module (Home, Skills, Projects, Blogs, Experience, About, Contact, Media, SEO, Settings, Users/Roles, Audit Logs) is built from one of two reusable patterns — `ResourceManager` (§28) or `SingletonEditor` (§12) — layered on a shared, fully responsive component system (§8, §13–15). Responsiveness is not a separate mobile build: one component tree, mobile-first Tailwind breakpoints, a shell-level fork only where the interaction pattern genuinely differs (sidebar↔drawer, desktop toolbar↔mobile floating toolbar). Codex should treat §1–39 as final and implement in the module order that matches the backend's own phase sequence (`Backend-Architecture-Specification.md §18`): Auth shell → Home/Skills singletons → Projects → Blog (block editor) → Experience/About → Contact/Messages/Meeting Requests → Media → SEO/Settings → Users/Roles/Audit Logs — without re-deriving any decision made here.
