# Premium Software Engineer Portfolio — Codex Implementation Specification

**Status:** APPROVED FOR IMPLEMENTATION
**Scope:** Home Page, Projects Page, Project Details Page — ONLY.
**Out of scope:** About, Blog (standalone page), Contact (standalone page), Admin/CMS UI, Auth, any page not named above.
**Rule for Codex:** This document is the single source of truth. Do not invent layout, do not redesign, do not add sections not listed here. Where a decision point exists, it has already been made below — implement it as written.

---

## 0. Reference Materials

### 0.1 UI Reference Images (source of truth for visuals)
Located conceptually in `/ui` (reference-only, not shipped in the repo):

| File | Maps to |
|---|---|
| `desktop_homepage.png` | Home Page — desktop |
| `MBL_homepage.png` | Home Page — mobile |
| `project_page.png` | Projects Page — desktop |
| `specific_project.png` | Project Details Page — desktop |

Every layout decision below is a direct reconstruction of these four images. Where mobile-specific behavior is not visible in the desktop shots, the mobile reference and standard responsive collapse rules (below) govern.

### 0.2 Existing Assets (already in repo, do not replace, do not regenerate)

```
public/assets/
  hero/
    portrait.png      -> subject portrait, transparent background, used in Home Hero
    skyline.png        -> dark city skyline, used as Home Hero background layer
  branding/
    logo.png            -> "AK" wordmark/monogram, used in Navbar + Footer
  graphics/
    mesh-glow.png        -> soft warm blurred glow blobs, used as ambient background accent
    grid.svg              -> subtle background grid pattern
    dots.svg               -> decorative dot/orbit accents (used around hero portrait)
```

### 0.3 Design Tokens (derived from reference images)

```
Theme: Dark only. No light mode toggle in this scope.

Colors:
  --bg-base:        #0A0A0A   (page background)
  --bg-surface:      #121212   (card/panel background)
  --bg-surface-alt:   #16161A   (nested surface, table headers)
  --border-subtle:     #232323   (1px hairline borders on cards/dividers)
  --text-primary:       #FFFFFF
  --text-secondary:      #A0A0A0
  --text-muted:           #6B6B6B
  --accent-gold:           #E8A33D  (primary CTA, links, active nav underline, tags)
  --accent-gold-hover:      #F0B458
  --status-success:          #4ADE80  (Production / Completed badges)
  --status-progress:          #60A5FA  (In Progress badges)
  --status-info:              #C084FC  (secondary accent, used sparingly)

Typography:
  Font family: Inter (or system sans fallback) for body + headings.
  Monospace (project structure / code blocks): 'JetBrains Mono' or 'Fira Code'.

  H1 (Hero headline):        40px / 56px desktop, 28px / 36px mobile, font-weight 700, tight tracking
  H2 (Section titles):        28px / 36px desktop, 22px / 28px mobile, font-weight 700
  H3 (Card titles):             18-20px, font-weight 600
  Body:                           15-16px, font-weight 400, color text-secondary
  Small/meta (dates, tags):         12-13px, font-weight 500, uppercase tracking for eyebrows

Spacing:
  Section vertical padding: 96px desktop / 56px mobile
  Container max-width: 1280px, centered, 24px horizontal gutter mobile / 64px desktop
  Card padding: 24px desktop / 16px mobile
  Card border-radius: 16px (large cards), 12px (small cards/badges), 999px (pills/tags/buttons)

Elevation:
  Cards: 1px solid var(--border-subtle), no heavy shadow — this is a flat, bordered-card aesthetic (Linear/Vercel style), not a drop-shadow-heavy aesthetic.
  Hover: border color shifts toward --accent-gold at 40% opacity, subtle background lighten, no scale jump above 1.02.
```

### 0.4 Global Interaction & Motion Principles
- Motion library: Framer Motion.
- All entrance animations: opacity 0→1 + translateY(16px→0), duration 0.4-0.5s, ease `[0.22, 1, 0.36, 1]`.
- Stagger children in grids/lists by 0.06-0.08s.
- Use `viewport={{ once: true, margin: "-80px" }}` for scroll-triggered reveals — animations must not replay on scroll-up.
- Respect `prefers-reduced-motion`: all transform/opacity entrance animations collapse to instant/no-op; hover scale/translate effects disabled.
- No parallax scroll-jacking. No autoplay carousels with motion the user cannot pause.

---

## 1. Architecture Overview

### 1.1 System Architecture (frontend as pure consumer)

```
                 ┌────────────────────────┐
                 │   Next.js 15 Frontend   │  (this repo — App Router, RSC + client islands)
                 └───────────┬─────────────┘
                             │  HTTPS / REST
                 ┌───────────▼─────────────┐
                 │  Axios Instance (lib/)   │  base URL, interceptors, timeout, error normalization
                 └───────────┬─────────────┘
                             │
                 ┌───────────▼─────────────┐
                 │  Service Layer (services/)│  one file per domain entity
                 └───────────┬─────────────┘
                             │
                 ┌───────────▼─────────────┐
                 │  Node.js + Express CMS   │  (separate repo — out of scope)
                 └───────────┬─────────────┘
                             │
                 ┌───────────▼─────────────┐
                 │       MongoDB             │
                 └───────────┬─────────────┘
                             │
                 ┌───────────▼─────────────┐
                 │       Cloudinary           │  (all project/blog media, resume PDF)
                 └────────────────────────┘
```

**Hard rule:** The frontend never writes data. Every request from this repo to the CMS is a `GET`. No POST/PUT/DELETE flows are in scope (no contact form submission handler is being built in this phase — the Contact CTA links to `mailto:` / `tel:` / external scheduling link only, sourced from CMS-provided profile data).

### 1.2 Frontend Data Flow (every single dynamic value on these 3 pages follows this chain)

```
CMS REST Endpoint
       ↓
Axios Instance          (lib/axios.ts)
       ↓
Service Function        (services/*.service.ts)
       ↓
Custom Hook              (hooks/use*.ts — wraps React Query)
       ↓
Page (Server or Client Component)
       ↓
Reusable Presentational Component
       ↓
Rendered UI
```

- **Axios Instance (`lib/axios.ts`)**: single configured instance. Responsibilities: base URL from env, default headers, request/response interceptors, timeout (10s default), normalized error shape (`{ message, status, code }`) thrown for all failures so hooks/components never touch raw Axios errors.
- **Service Layer (`services/`)**: one function per CMS operation. Responsibilities: build the endpoint path, call axios, validate/shape the response into the domain TypeScript type, return typed data or throw the normalized error. Services know nothing about React — pure async functions, testable in isolation.
- **Custom Hooks (`hooks/`)**: wrap a service call in TanStack React Query (`useQuery`). Responsibilities: cache key, stale time, retry policy, exposing `{ data, isLoading, isError, error, refetch }` to components. This is the only layer allowed to know about React Query.
- **Components**: presentation only. Receive data as props or call a hook directly (Client Components only — Server Components fetch via the service layer directly during render, no hook needed, see 1.4). Never import Axios or the service layer's raw fetch logic directly bypassing hooks in client contexts.

### 1.3 Data Fetching Strategy: Server vs Client Components (Next.js 15 / React 19)

To get both SEO and interactivity right, this spec splits fetching responsibility as follows:

| Data | Fetched by | Why |
|---|---|---|
| Home: Profile/Hero, Featured Projects, Skills, Experience, Blog preview | Server Component (`app/page.tsx`), calling service functions directly at render time (no hook) | Needed for SEO/first paint, static-ish content, no user-driven refetching |
| Projects Page: initial project list + categories | Server Component (initial data passed to Client Component as `initialData` for React Query hydration) | SEO for project listing, but page has client-side search/filter/sort that needs live re-querying |
| Projects Page: search/filter/sort re-fetching after initial load | Client Component + `useProjects()` hook (React Query) | Interactive, debounced, must not reload the page |
| Project Details Page: single project by slug | Server Component (`generateMetadata` + page body), calling `getProjectBySlug()` service directly, for SEO + OG tags | Each project needs indexable metadata (title, description, OG image from Cloudinary) |
| Project Details Page: Related Projects | Server Component, fetched alongside main project in parallel (`Promise.all`) | Same page load, no interactivity needed |

Rule for Codex: default to Server Components for anything not requiring `useState`/`useEffect`/user interaction. Only mark a component `"use client"` when it needs interactivity (search input, filter buttons, image gallery lightbox, tabs, animated reveals via Framer Motion, mobile nav drawer).

### 1.4 API-Only Data Strategy

All portfolio content is loaded through typed services backed by the public API. Production code must not include local content datasets, development fallbacks, or fabricated responses. Missing endpoints reject with a typed `NOT_IMPLEMENTED` error and render the existing error state.

### 1.5 State Management Policy
- **Server state (all API data):** TanStack React Query exclusively. No Redux, no Zustand for this scope.
- **Client UI state:** local `useState`/`useReducer` per component (search input value, active filter, active tab, mobile drawer open/closed, gallery lightbox index).
- **Cross-cutting UI state via Context (only these two):**
  - `NavigationContext` — tracks active route highlighting + mobile drawer open state, provided in root layout.
  - No theme context needed (dark-only, no toggle in scope).
- Do not introduce global state for anything that only one component tree needs.

---

## 2. Environment Variables

Create `.env.local` (gitignored) and `.env.example` (committed, values blank/placeholder).

```bash
# --- API ---
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_API_TIMEOUT_MS=10000

# --- App metadata ---
NEXT_PUBLIC_APP_NAME=Abishek Krishnamoorthy — Portfolio
NEXT_PUBLIC_SITE_URL=https://abishekkrishnamoorthy.online

# --- Personal / CTA links (fallback if CMS profile endpoint is unavailable) ---
NEXT_PUBLIC_RESUME_URL=
NEXT_PUBLIC_GITHUB_URL=https://github.com/
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/in/
NEXT_PUBLIC_EMAIL=hello@abishekkrishnamoorthy.online
NEXT_PUBLIC_SCHEDULE_CALL_URL=

# --- Analytics (placeholder, wire later — do not hardcode in components) ---
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

**Rule:** No component, service, or hook may contain a hardcoded URL, email, or endpoint path. Everything above is read via a single typed config module: `lib/env.ts`, which validates presence at build time (throw a clear error if a required var is missing) and exports a typed `env` object. All other files import from `lib/env.ts`, never from `process.env` directly.

---

## 3. Folder Structure (only what these 3 pages need)

```
app/
  layout.tsx                     # Root layout: fonts, Navbar, Footer, NavigationContext provider, QueryClientProvider
  page.tsx                       # Home Page (Server Component)
  globals.css                    # Tailwind base + design tokens as CSS variables
  projects/
    page.tsx                     # Projects Page (Server Component, hydrates client list)
    [slug]/
      page.tsx                    # Project Details Page (Server Component, generateMetadata)

components/
  layout/
    Navbar.tsx
    MobileNavDrawer.tsx
    Footer.tsx
  common/
    Button.tsx
    SectionTitle.tsx
    Tag.tsx
    Badge.tsx                     # status pills: Production / In Progress / Completed
    IconLink.tsx                    # social icon buttons (GitHub, LinkedIn, Email)
    SkeletonBlock.tsx
    EmptyState.tsx
    ErrorState.tsx
  home/
    HeroSection.tsx
    FeaturedProjectsSection.tsx
    FeaturedProjectCard.tsx
    SkillsSection.tsx
    SkillCategoryCard.tsx
    CurrentlyLearningSection.tsx
    LearningProgressCard.tsx
    LatestBlogPreviewSection.tsx
    BlogPreviewCard.tsx
    ContactCTASection.tsx
  projects/
    ProjectsHero.tsx
    ProjectsToolbar.tsx             # search + category filter + sort, composed together
    SearchInput.tsx
    CategoryFilterPills.tsx
    SortDropdown.tsx
    ProjectListItem.tsx              # the wide row-style card seen in project_page.png
    ProjectListSkeleton.tsx
  project-details/
    ProjectHeroBanner.tsx
    ProjectQuickStats.tsx             # Status / Duration / Role / Last Updated / Technologies row
    ProjectTabs.tsx                     # README / Screenshots / Case Study
    ProjectOverviewTab.tsx
    ProjectScreenshotsTab.tsx
    ProjectCaseStudyTab.tsx
    OnThisPageNav.tsx                    # sticky right-rail anchor nav
    ProjectStructureBlock.tsx              # monospace file-tree block
    TechStackTable.tsx
    RelatedProjectsSection.tsx
    ProjectPrevNextNav.tsx

hooks/
  useProfile.ts
  useFeaturedProjects.ts
  useSkills.ts
  useExperience.ts
  useLatestBlogPosts.ts
  useProjects.ts                    # supports search/category/sort params
  useProjectBySlug.ts
  useRelatedProjects.ts

services/
  api.ts                             # re-exports axios instance for services
  profile.service.ts
  project.service.ts
  skill.service.ts
  experience.service.ts
  blog.service.ts

types/
  profile.types.ts
  project.types.ts
  skill.types.ts
  experience.types.ts
  blog.types.ts
  common.types.ts                    # ApiResponse<T>, ApiError, PaginationMeta

lib/
  axios.ts                             # configured Axios instance + interceptors
  env.ts                                 # typed, validated env accessor
  utils.ts                                 # cn() classnames helper, formatDate, slugify, etc.
  query-client.ts                            # React Query client + default options
  mock/
    profile.mock.ts
    projects.mock.ts
    skills.mock.ts
    experience.mock.ts
    blogs.mock.ts

constants/
  navigation.ts                         # nav link list (Home, Projects — only in-scope routes)
  categories.ts                           # project filter category list (All, AI, Full Stack, Cloud, Frontend, Backend, Learning)
  sort-options.ts
  site.ts                                   # site name, description, default OG image path

public/assets/                              # already exists, unchanged (see 0.2)
```

---

## 4. Reusable Components — Responsibility, Props, Reuse Map

### `Button`
- **Responsibility:** single button primitive covering primary (gold-filled), secondary (dark outline), and ghost variants, with optional leading/trailing icon slot.
- **Props:** `variant: 'primary' | 'secondary' | 'ghost'`, `size: 'sm' | 'md'`, `icon?: ReactNode`, `iconPosition?: 'left' | 'right'`, `href?: string` (renders as Next `Link` when present, else `<button>`), `onClick?`, `disabled?`, `children`.
- **Reused in:** Navbar ("Download Resume"), Hero ("Explore Projects", "Contact Me"), Featured Projects ("View all projects"), Projects Toolbar, Project Card CTAs ("Live Demo", "GitHub", "Explore Project"), Contact CTA section, Project Details ("Live Demo"), Prev/Next nav.

### `SectionTitle`
- **Responsibility:** consistent eyebrow-label + heading + optional trailing action link pattern (e.g., "FEATURED PROJECTS ... View all projects →").
- **Props:** `eyebrow: string`, `title: string | ReactNode`, `action?: { label: string; href: string }`.
- **Reused in:** Featured Projects, Skills, Currently Learning, Latest Blog Posts, Projects Page toolbar area, Related Projects.

### `Tag`
- **Responsibility:** small pill for tech-stack labels (Next.js, TypeScript, MongoDB, etc.), non-interactive.
- **Props:** `label: string`, `icon?: ReactNode`.
- **Reused in:** Featured Project Cards, Project List Items, Project Details tech stack, Skills cards.

### `Badge`
- **Responsibility:** status indicator dot + label (Production=green, In Progress=blue, Completed=green).
- **Props:** `status: 'production' | 'in-progress' | 'completed'`, `label?: string` (defaults derived from status).
- **Reused in:** Project List Items, Project Details Quick Stats.

### `IconLink`
- **Responsibility:** circular/square icon button linking to an external profile (GitHub/LinkedIn/Email) or performing a copy/mail action.
- **Props:** `icon: ReactNode`, `href: string`, `label: string` (for aria-label).
- **Reused in:** Navbar (implicit via mobile drawer), Hero social row, Footer, Contact CTA.

### `SkeletonBlock`
- **Responsibility:** generic shimmering placeholder rectangle/card used for every loading state.
- **Props:** `variant: 'card' | 'text' | 'avatar' | 'row'`, `count?: number`.
- **Reused in:** every section that fetches data (Featured Projects, Skills, Blog Preview, Projects Grid, Project Details).

### `EmptyState`
- **Responsibility:** centered icon + message + optional action, shown when an API returns zero items.
- **Props:** `icon?: ReactNode`, `title: string`, `description?: string`, `action?: { label: string; onClick: () => void }`.
- **Reused in:** Projects Page (no search results), Related Projects (if none returned), Blog Preview (if no posts yet).

### `ErrorState`
- **Responsibility:** centered error icon + message + Retry button, shown when a query's `isError` is true.
- **Props:** `message?: string`, `onRetry: () => void`.
- **Reused in:** every data-driven section listed under SkeletonBlock.

### `FeaturedProjectCard` (Home only) vs `ProjectListItem` (Projects Page)
These are visually distinct per the reference images (compact card grid on Home vs wide row layout on Projects Page) — implemented as **two separate components**, both consuming the same `Project` type, to avoid forcing one component to serve two very different layouts via conditional prop soup.

### `ProjectTabs`
- **Responsibility:** tab switcher (README / Screenshots / Case Study) for Project Details, underline-indicator style matching navbar's active-link underline.
- **Props:** `tabs: { id: string; label: string; icon?: ReactNode }[]`, `activeTab: string`, `onChange: (id: string) => void`.
- **Reused in:** Project Details Page only (single use, but built generically in `components/common` philosophy — kept in `project-details/` since it's not needed elsewhere in this scope).

### `OnThisPageNav`
- **Responsibility:** sticky right-rail scroll-spy navigation linking to in-page anchors (Overview, Key Features, Tech Stack, Project Structure, etc.), highlights current section on scroll.
- **Props:** `sections: { id: string; label: string }[]`.
- **Reused in:** Project Details Page only.

---

## 5. Home Page — Complete Construction Plan

Route: `app/page.tsx` (Server Component, streams via `<Suspense>` per section where fetch latency is a concern).

### Section Order (top to bottom, per `desktop_homepage.png` / `MBL_homepage.png`)
1. Navbar
2. Hero Section
3. Featured Projects
4. Skills
5. Currently Learning
6. Latest Blog Posts (preview only — links to individual posts externally/CMS-managed; no Blog listing page built in this scope)
7. Contact CTA
8. Footer

---

### 5.1 Navbar
- **Purpose:** primary site navigation, brand identity, resume download, persistent across all 3 pages.
- **Layout:** fixed/sticky top bar, `logo.png` + "AK." wordmark left; center nav links (Home, Projects, Skills, Blog, Contact — render all links per reference for visual parity, but only `Home` and `Projects` are routable in this build; other links render as disabled/anchor-to-self or point to CMS-external targets, per product decision to keep nav visually complete without building those pages yet — **Codex must not build pages for Skills/Blog/Contact routes, only the nav item styling**); right side: "About Me AI" pill button (visual only, no functionality in this scope), "Download Resume" primary button (links to `NEXT_PUBLIC_RESUME_URL`), hamburger icon on mobile only.
- **Component hierarchy:** `Navbar` → `Logo` (uses `branding/logo.png` via `next/image`) → `NavLinks` (desktop only, `hidden md:flex`) → `Button` (Resume) → `MobileNavDrawer` trigger (mobile only, `md:hidden`).
- **Assets used:** `branding/logo.png`.
- **Animation:** underline slides in under active link (layoutId shared element via Framer Motion `motion.span layoutId="nav-underline"`); navbar background gains subtle blur+opacity on scroll past 8px (`backdrop-blur-md bg-bg-base/80`).
- **Responsive:** ≥768px shows full inline nav; <768px collapses to logo + hamburger, opening `MobileNavDrawer`.
- **Mobile Nav Drawer (decision confirmed):** slide-in panel from the right, `translateX(100%→0)`, 0.3s ease-out, dark overlay behind it (`bg-black/60`) that closes drawer on click, drawer contains the same nav links stacked vertically + Resume button + social icons at the bottom. Trap focus while open; close on `Escape` and on route change.
- **CMS data required:** none (nav links are static per `constants/navigation.ts`); Resume URL comes from `NEXT_PUBLIC_RESUME_URL` env var (or `profile.resumeUrl` from Profile API as an override — env is the fallback default).

### 5.2 Hero Section
- **Purpose:** immediate identity + value proposition + primary conversion actions (Explore Projects, Contact Me) + availability signal.
- **Layout:** two-column desktop (text block left ~55%, portrait+skyline visual right ~45%); single column stacked on mobile with a shorter/cropped portrait per `MBL_homepage.png`.
- **Component hierarchy:** `HeroSection` → `HeroContent` (eyebrow badge "FULL-STACK DEVELOPER & AI ENGINEER", H1 with gold-highlighted second line "digital experiences.", paragraph, `Button` x2, availability row with pulsing green dot + "Open to opportunities" + `IconLink` x3 for Email/LinkedIn/GitHub) → `HeroVisual` (`skyline.png` as background layer, `portrait.png` layered on top, `dots.svg` scattered as decorative accents around the portrait edge, radial `mesh-glow.png` glow behind the subject's head to recreate the moon/glow effect in the reference).
- **Assets used:** `hero/portrait.png`, `hero/skyline.png`, `graphics/dots.svg`, `graphics/mesh-glow.png`.
- **CMS data required:** Profile entity — `headline`, `subheadline`, `availabilityStatus`, `socialLinks[]`, `ctaLabels` (fallback to hardcoded copy only if CMS profile absent — but structurally always sourced through `useProfile`/service, never inline text in the component).
- **API endpoint:** `GET /api/profile`.
- **Service function:** `profile.service.ts → getProfile()`.
- **Hook:** `useProfile()` (React Query, `staleTime: 5 min`, this is near-static content).
- **Loading state:** skeleton for headline bars + button placeholders + circular portrait placeholder; hero must never show a layout-shifting blank space — reserve final height via skeleton.
- **Error state:** fall back silently to static default copy (do not show a jarring error banner in the hero — this is the first thing a recruiter sees); log error to console/monitoring only.
- **Empty state:** n/a (profile is a singleton, not a list).
- **Animation:** headline + paragraph fade/slide in staggered on mount (not scroll-triggered, since it's above the fold); portrait fades in with a slight scale-from-0.96; availability dot has a soft `animate-pulse`.
- **Responsive:** portrait scales down and repositions above the text block on mobile per `MBL_homepage.png`; button row stacks or stays inline depending on width (reference shows inline on mobile too, so keep `flex-row flex-wrap` with `gap-3`).
- **User interaction:** "Explore Projects" → `/projects`; "Contact Me" → smooth-scrolls to `#contact-cta` on Home; social icons → external links in new tab (`rel="noopener noreferrer"`).

### 5.3 Featured Projects
- **Purpose:** surface top 3 projects to recruiters immediately, drive to full Projects page.
- **Layout:** `SectionTitle` (eyebrow "FEATURED PROJECTS", action link "View all projects →" to `/projects`) then a 3-column grid desktop / 1-column stacked mobile of `FeaturedProjectCard`.
- **Component hierarchy:** `FeaturedProjectsSection` → `SectionTitle` → grid → `FeaturedProjectCard` (numbered badge "01/02/03", thumbnail image, title, tagline in gold, 2-line description, tag row (max 4 tags + overflow handled by wrapping, matching reference), footer action row: Live Demo / GitHub / Case Study links with icons).
- **Assets used:** project thumbnail images come from CMS (`project.thumbnailUrl`, Cloudinary) — no local placeholder assets other than a generic fallback image if a thumbnail is missing.
- **CMS data required:** Project entity subset — `id, slug, orderIndex, title, tagline, shortDescription, thumbnailUrl, techTags[], liveDemoUrl, githubUrl, caseStudyUrl`.
- **API endpoint:** `GET /api/projects?featured=true&limit=3`.
- **Service function:** `project.service.ts → getFeaturedProjects()`.
- **Hook:** `useFeaturedProjects()` (React Query, `staleTime: 2 min`).
- **Loading state:** 3 `SkeletonBlock` cards matching card dimensions exactly (prevents layout shift).
- **Error state:** `ErrorState` with Retry, scoped to just this section (rest of page still renders).
- **Empty state:** `EmptyState` — "No featured projects yet" when the API returns an empty list.
- **Animation:** cards stagger-fade-in on scroll into view; hover raises card border to gold-tinted + slight `translateY(-4px)`, thumbnail slight `scale-105` on hover contained via `overflow-hidden`.
- **Responsive:** 3-col → 1-col at `md` breakpoint; card thumbnail aspect ratio stays consistent (16:10) across breakpoints.

### 5.4 Skills
- **Purpose:** communicate technical breadth via 3 categorized skill groups.
- **Layout:** `SectionTitle` (eyebrow "SKILLS") + 3-column grid (Frontend / Backend / AI-Tools-Cloud) of `SkillCategoryCard`, collapsing to 1-column on mobile.
- **Component hierarchy:** `SkillsSection` → `SectionTitle` → `SkillCategoryCard` (icon, category name with gold underline, 2-row wrap of skill-name chips — plain text separated by spacing per reference, not heavy pill tags).
- **Assets used:** category icons via `lucide-react` (Monitor, Server/Layers, Cloud icons matching reference glyphs) — no custom image assets needed.
- **CMS data required:** Skill entity grouped by category — `{ category: 'frontend' | 'backend' | 'ai-tools-cloud', items: string[] }[]`.
- **API endpoint:** `GET /api/skills`.
- **Service function:** `skill.service.ts → getSkills()`.
- **Hook:** `useSkills()` (React Query, `staleTime: 10 min` — very static content).
- **Loading state:** 3 skeleton cards with placeholder chip rows.
- **Error state:** `ErrorState` scoped to section.
- **Empty state:** not realistically applicable; if a category array is empty, simply omit that card rather than showing broken empty UI.
- **Animation:** cards fade/slide in staggered on scroll; no hover-interaction needed (informational, not clickable).
- **Responsive:** 3-col desktop → 1-col mobile, full width per category.

### 5.5 Currently Learning
- **Purpose:** show growth mindset / active learning with progress bars, humanizes the recruiter-facing narrative.
- **Layout:** 4-column row on desktop (3 progress cards + 1 CTA card linking to a fuller "learning journey" — this CTA link may point externally/to CMS content since no dedicated page is in scope); collapses to stacked/2-col on mobile.
- **Component hierarchy:** `CurrentlyLearningSection` → `LearningProgressCard` (icon, label, horizontal progress bar, percentage) x N, plus a distinct `LearningJourneyCTACard` (static text + `Button` ghost/outline variant).
- **CMS data required:** `{ label: string; icon: string; progressPercent: number }[]`.
- **API endpoint:** reuse `GET /api/skills?type=learning` (or a dedicated `learningItems` field on the Skill service — Codex should model this as part of `skill.service.ts` to avoid a whole new entity for 3 items) → `getCurrentlyLearning()`.
- **Hook:** `useSkills()` can return both `categories` and `learningItems` from one query if the API shape supports it; otherwise a second lightweight hook `useCurrentlyLearning()`.
- **Loading/Error/Empty:** same skeleton/error/empty pattern as 5.4; if empty, hide the whole section gracefully (do not show 3 empty bars).
- **Animation:** progress bar fill animates from 0 to its percentage on scroll-into-view (`width: 0% → X%`, 0.8s ease-out, slightly staggered per card).
- **Responsive:** 4-col → 2-col (tablet) → 1-col (mobile).

### 5.6 Latest Blog Posts (preview strip only)
- **Purpose:** show 3 most recent posts to demonstrate thought leadership; this is a **preview section on Home only** — no `/blog` listing page is being built in this scope, per the boundaries given.
- **Layout:** `SectionTitle` (eyebrow "LATEST BLOG POSTS", action "View all posts →" — this link may point to an external/CMS-hosted blog URL rather than an internal route, since no Blog page exists in this build) + 3-column card grid, 1-column mobile.
- **Component hierarchy:** `LatestBlogPreviewSection` → `SectionTitle` → `BlogPreviewCard` (cover image, category tag e.g. "AI / RAG", title, date + read-time meta row).
- **CMS data required:** `{ slug, title, coverImageUrl, category, publishedAt, readTimeMinutes }[]`, limit 3.
- **API endpoint:** `GET /api/blogs?limit=3&sort=recent`.
- **Service function:** `blog.service.ts → getLatestBlogPosts(limit)`.
- **Hook:** `useLatestBlogPosts(3)`.
- **Loading/Error/Empty:** standard skeleton/`ErrorState`/`EmptyState` (empty message: "No posts published yet").
- **Animation:** identical staggered card fade-in pattern as Featured Projects; hover lifts card + subtle image zoom.
- **Responsive:** 3-col → 1-col.

### 5.7 Contact CTA
- **Purpose:** final conversion band before footer — direct ways to reach out.
- **Layout:** dark-bordered full-width band, left side heading "Let's build something amazing together." + supporting line, right side 3 stacked/inline contact method cards (Email Me, LinkedIn, Schedule a Call), per reference.
- **Component hierarchy:** `ContactCTASection` → text block → `IconLink`-style larger cards (icon + label + value line) x3.
- **CMS data required:** `profile.email`, `profile.linkedinUrl`, `profile.scheduleCallUrl` (same Profile entity as Hero — reuse `useProfile()`, do not re-fetch).
- **API endpoint:** same as 5.2 (`GET /api/profile`), no new call.
- **Loading/Error:** if profile hasn't resolved yet, show skeleton chips; if errored, fall back to `NEXT_PUBLIC_EMAIL` / `NEXT_PUBLIC_LINKEDIN_URL` / `NEXT_PUBLIC_SCHEDULE_CALL_URL` env values so the section is never fully broken.
- **Animation:** simple fade-in on scroll, no exotic motion — this is a conversion zone, keep it calm and readable.
- **Responsive:** 2-col (text + cards stacked) → full stack on mobile, cards go full-width.
- **Anchor:** section has `id="contact-cta"` as the scroll target for Hero's "Contact Me" button.

### 5.8 Footer
- **Purpose:** closing navigation, copyright, secondary link groups (Navigation / Resources / Connect).
- **Layout:** logo + tagline left, 3 link columns (Navigation, Resources, Connect) middle/right, copyright line + scroll-to-top button at the very bottom, per reference.
- **Component hierarchy:** `Footer` → `Logo` + tagline → `FooterLinkColumn` x3 → bottom bar (`© {year} Abishek Krishnamoorthy. All rights reserved.` + scroll-to-top `Button` ghost icon-only).
- **Assets used:** `branding/logo.png`.
- **CMS data required:** none — link lists are static (`constants/navigation.ts` / `constants/site.ts`); external profile links (GitHub/LinkedIn/Email under "Connect") reuse `useProfile()` data already fetched — do not re-fetch.
- **Animation:** none required (below fold, utilitarian); scroll-to-top button fades/smooth-scrolls the page to `y: 0`.
- **Responsive:** columns stack vertically on mobile in the order: logo/tagline → Navigation → Resources → Connect → copyright bar.

### 5.9 SEO Requirements (Home)
- `generateMetadata` in `app/layout.tsx` (site-wide defaults) with page-level override in `app/page.tsx`: title, description, canonical URL from `NEXT_PUBLIC_SITE_URL`, Open Graph image (a static image in `public/` or portrait-based OG card), Twitter card `summary_large_image`.
- Semantic HTML: one `<h1>` only (Hero headline), `<h2>` for each section title, `<nav>` for Navbar, `<footer>` for Footer.
- `next/image` for all raster assets with explicit `width`/`height` or `fill` + proper `alt` text (portrait: "Abishek Krishnamoorthy portrait"; skyline: `alt=""` decorative).

### 5.10 Accessibility Requirements (Home)
- Navbar links and mobile drawer fully keyboard-navigable; drawer traps focus and returns focus to the hamburger trigger on close.
- All icon-only buttons (`IconLink`, scroll-to-top) require `aria-label`.
- Color contrast: verify `--text-secondary` (#A0A0A0) on `--bg-base` (#0A0A0A) meets WCAG AA for body text (it does, ~7:1) — do not introduce lower-contrast grays.
- Progress bars (`LearningProgressCard`) use `role="progressbar"` with `aria-valuenow/min/max`.
- Reduced motion respected globally per 0.4.

---

## 6. Projects Page — Complete Construction Plan

Route: `app/projects/page.tsx`. Server Component fetches initial unfiltered project list + category list, hydrates a Client Component (`ProjectsPageClient` or the toolbar+grid together) via React Query's `HydrationBoundary`/`dehydrate` so search/filter/sort re-fetching happens client-side without a full page reload, while the very first paint is server-rendered for SEO.

### Section Order (per `project_page.png`)
1. Navbar (shared, active state = Projects)
2. Projects Hero (heading + floating decorative project-card mockups)
3. Toolbar: Category filter pills (left) + Search input (right) on one row
4. Project List (row-style cards, not a grid of squares — matches reference's wide horizontal cards)
5. Footer

*(Note: the reference image does not show a visible sort control or pagination UI element, but the task explicitly requires Sorting and Pagination/Infinite Scroll to be planned — these are specified below as an addition consistent with the reference's toolbar area, placed as a `SortDropdown` to the right of the search input, and infinite scroll appended below the list, since the reference shows a long single-scroll list of projects rather than paginated pages.)*

### 6.1 Projects Hero
- **Purpose:** page identity + browsing context, mirrors Home Hero's visual language but simpler.
- **Layout:** left text block ("MY WORK" eyebrow, H1 "Projects that solve real world problems.", supporting paragraph), right side a loosely arranged collage of 3-4 floating project-thumbnail mockup cards with small labeled callout arrows ("AI Platform", "AWS Deployment", "Daily Echo", "Portfolio") as decorative, non-interactive visual flair.
- **Component hierarchy:** `ProjectsHero` → text block → `FloatingProjectMockups` (purely decorative, can use static representative crops of real project thumbnails fetched from the featured projects data, or a fixed decorative illustration — Codex should reuse actual project thumbnail URLs from the projects query already being fetched, positioned with slight rotation/offset via CSS transforms to match the collage effect).
- **Assets used:** project thumbnails (CMS-sourced), `graphics/dots.svg` for subtle ambient accents if needed.
- **CMS data required:** same project list already fetched for the grid below (no separate call).
- **Animation:** collage cards float in with staggered fade + slight rotation settle on page load; optional very subtle idle float (`translateY` oscillation, ±4px, slow) — keep understated, respect reduced-motion.
- **Responsive:** collage hidden or simplified to a single static image on mobile (reference's mobile view was not separately provided for this page — default to hiding the decorative collage below `md` to avoid clutter, keeping only the text block).

### 6.2 Toolbar (Search + Category Filters + Sorting)
- **Purpose:** let users narrow down the project list by keyword, category, and order.
- **Layout:** single row on desktop — left-aligned horizontally-scrollable pill group (`All, AI, Full Stack, Cloud, Frontend, Backend, Learning`), right-aligned `SearchInput` (icon + placeholder "Search projects..."). `SortDropdown` (Newest, Oldest, A–Z) placed immediately adjacent to the search input, collapsing under it on smaller screens.
- **Component hierarchy:** `ProjectsToolbar` → `CategoryFilterPills` (active pill filled gold per reference's "All" active state, others outline) → `SearchInput` → `SortDropdown` (shadcn/ui `Select`).
- **CMS data required:** category list can be a static `constants/categories.ts` (matches reference exactly: All, AI, Full Stack, Cloud, Frontend, Backend, Learning) OR sourced from `GET /api/projects/categories` if the CMS provides dynamic categories — **decision: use the static constant for the pill set** (these are fixed taxonomy, unlikely to change often, and avoids an extra network waterfall before the toolbar can render), while `getProjects()` still accepts a `category` query param sent to the API.
- **API endpoint:** `GET /api/projects?category={cat}&search={query}&sort={sort}&page={n}` (or cursor param if infinite scroll uses cursors — see 6.4).
- **Service function:** `project.service.ts → getProjects(params)`.
- **Hook:** `useProjects(params)` — React Query key includes all params `['projects', { category, search, sort, page }]`, `keepPreviousData: true` to avoid flicker while a new filter loads.
- **Interaction/debounce:** `SearchInput` debounces user typing by 350ms before triggering a refetch (implemented in the hook or via a local debounced state in the component — component holds raw input value for instant visual feedback, hook receives the debounced value).
- **Loading state:** while a filter/search/sort change is in flight, dim the existing list slightly (`opacity-60 pointer-events-none`) rather than replacing it with skeletons (thanks to `keepPreviousData`), for a smoother re-filter feel; the very first load (no previous data) shows full `ProjectListSkeleton` (5-6 skeleton rows).
- **Responsive:** on mobile, category pills become a horizontally scrollable single row (`overflow-x-auto`, no wrap, scroll-snap), search input goes full-width below it, sort dropdown sits next to or under search.

### 6.3 Project List / Project List Item
- **Purpose:** primary content of the page — full browsable catalog.
- **Layout:** each `ProjectListItem` is a wide horizontal card: thumbnail image left (~30% width), middle content column (status badge, title, tagline in gold, description, tech tags row), right column stacked action buttons (Live Demo — primary gold, GitHub — outline, Explore Project — outline with chevron), exactly per `project_page.png`. On the middle column, a small bullet-point feature list (3-5 short bullets with icon) also appears per reference — include this as part of the CMS project payload (`highlights: string[]`).
- **Component hierarchy:** `ProjectListItem` → thumbnail (`next/image`) → `Badge` (status) → title/tagline/description block → `Tag` row → highlight bullet list → action `Button` column.
- **CMS data required (full Project entity for this view):** `id, slug, title, tagline, description, status: 'production'|'in-progress'|'completed', thumbnailUrl, techTags[], highlights[], liveDemoUrl, githubUrl`.
- **API/Service/Hook:** same as 6.2 (`useProjects`) — this section renders the `data.items` array from that same hook call, no separate fetch.
- **Loading state:** `ProjectListSkeleton` — same row shape, shimmering placeholders for thumbnail/text/buttons, rendered count matches a reasonable default page size (e.g., 5).
- **Error state:** section-level `ErrorState` with Retry (retries the current filter/search/sort combination via `refetch()`).
- **Empty state:** `EmptyState` — "No projects match your search" with a "Clear filters" action button that resets search/category/sort state.
- **Animation:** list items fade/slide in staggered on initial load and on filter-change (re-stagger only the newly rendered set); hover: border brightens gold, thumbnail subtle zoom, action buttons unchanged (no layout shift on hover).
- **Responsive:** collapses from horizontal row to stacked layout below `lg` — thumbnail on top (full width, fixed aspect ratio), content below, action buttons become full-width stacked buttons at the bottom of the card.

### 6.4 Pagination / Infinite Scroll
- **Decision:** infinite scroll (matches the reference's continuous single-scroll list aesthetic better than discrete pagination controls, which do not appear in the reference image at all).
- **Implementation:** `useProjects` uses React Query's `useInfiniteQuery`; an intersection-observer sentinel `<div>` at the bottom of the list triggers `fetchNextPage()` when scrolled into view (with a small root margin so it loads slightly before reaching the very bottom).
- **Loading more state:** small centered spinner/skeleton row appended below the list while fetching the next page; once `hasNextPage` is false, show a subtle "You've reached the end" text, no spinner.
- **Error on load-more:** inline retry link appended where the spinner would be, rather than disrupting the already-rendered list above.

### 6.5 Empty State (page-level, no projects exist at all)
- Distinct from the "no search results" empty state: if the CMS genuinely returns zero projects with no filters applied, show a friendlier top-level `EmptyState` ("Projects are being added — check back soon") instead of the filter-specific copy.

### 6.6 Responsive Layout Summary (Projects Page)
- **Desktop (≥1024px):** hero with collage, toolbar single row, list items horizontal.
- **Tablet (768–1023px):** hero collage hidden or shrunk, toolbar wraps to two rows if needed (pills row, then search+sort row), list items begin transitioning to stacked layout.
- **Mobile (<768px):** hero text-only, toolbar fully stacked (scrollable pills → search → sort), list items fully stacked cards, action buttons full-width.

---

## 7. Project Details Page — Complete Construction Plan

Route: `app/projects/[slug]/page.tsx`. Server Component: `generateMetadata({ params })` calls `getProjectBySlug(slug)` for SEO (title = project title, description = project short description, OG image = project thumbnail/hero image from Cloudinary). Page body fetches the project and related projects in parallel via `Promise.all`.

### Section Order (per `specific_project.png`)
1. Navbar (shared)
2. Back to Projects link
3. Project Header (title, tagline/description, status/live-link meta, primary actions)
4. Quick Stats row (Status / Duration / Role / Last Updated / Technologies)
5. Tabs: README (default) / Screenshots / Case Study
6. Tab content (left ~75%) + sticky "On this page" anchor nav + "Project Links" card (right ~25%)
7. Related Projects
8. Previous / Next Project Navigation
9. Footer

*(Note: the "Ask Project AI" floating panel visible in `specific_project.png` is treated as a static/visual-only element per the decision above — render its UI shell (header, suggested-question chips, disabled/non-functional input) without wiring any AI/chat API, hook, or backend logic. It must not block or overlap primary content on smaller viewports — collapse it to a closed floating trigger button on mobile/tablet.)*

### 7.1 Back to Projects Link
- **Purpose:** quick escape hatch back to the listing.
- **Layout:** small text link with left chevron icon, top-left above the project title.
- **Component:** simple `Link` with icon, part of the page shell, not a separate reusable component (too trivial) — but styled consistently with `Button` ghost/link variant tokens.
- **Interaction:** navigates to `/projects` (does not need to preserve prior filter state in this scope, since no explicit requirement was given for that — straightforward back link).

### 7.2 Project Header
- **Purpose:** identify the project, its one-line pitch, and give the two primary conversion actions.
- **Layout:** left block — small "PROJECT" eyebrow, H1 title, description paragraph, status dot + live-URL text link row; right block — `Button` primary "Live Demo" (external link icon) + `Button` secondary "Ask Project AI" (visual-only per 7-intro decision, sparkle icon, opens/closes the static panel described above but performs no real query).
- **CMS data required:** `title, description, liveUrl, status`.
- **API/Service/Hook:** part of the single `getProjectBySlug(slug)` payload — no separate call (`useProjectBySlug(slug)`, but on the Server Component this is called directly via the service, not the hook — see 1.3).

### 7.3 Quick Stats Row
- **Purpose:** at-a-glance scannable facts.
- **Layout:** 5 equal-width bordered stat cards in a row: Status (with colored dot text, e.g. green "Completed"), Duration (calendar icon + "3 Months"), Role (person icon + "Full Stack Developer"), Last Updated (clock icon + date), Technologies (stacked small tech icons).
- **Component:** `ProjectQuickStats` receiving the project object, rendering 5 fixed sub-cards (can be one component with an internal array map rather than 5 separate files, since they're structurally identical, just icon+label+value).
- **CMS data required:** `status, durationLabel, role, lastUpdatedAt, techIcons[]` (small subset of tech icons distinct from the full tech-stack table below — reference shows ~4 icon glyphs here).
- **Responsive:** 5-col → 2-col grid → 1-col stacked list on mobile.

### 7.4 Tabs — README / Screenshots / Case Study
- **Purpose:** organize dense project content without one overwhelming scroll.
- **Layout:** underline-style tab bar (matches Navbar's active-underline treatment for visual consistency), README active by default.
- **Component hierarchy:** `ProjectTabs` (controls active tab state, `"use client"`) wrapping `ProjectOverviewTab` | `ProjectScreenshotsTab` | `ProjectCaseStudyTab`, only the active tab's content is mounted (or all mounted but visually hidden — **decision: mount only active tab's data-fetching content, but keep the tab bar itself always visible**, to avoid unnecessary work since Screenshots/Case Study may pull additional gallery data).
- **Animation:** tab content cross-fades (0.2s) on switch; underline indicator slides via shared `layoutId` like the Navbar.
- **Responsive:** tabs remain horizontal (not converted to a dropdown) even on mobile, matching reference; allow horizontal scroll if the 3 labels don't fit smallest viewports (unlikely at 3 items, but guard for it).

#### 7.4.1 README Tab (`ProjectOverviewTab`) — default/active
Contains, in order, each as its own in-page anchor target matching the right-rail nav:
- **Overview:** paragraph description.
- **Key Features:** bulleted list with a sparkle/check icon per item.
- **Tech Stack:** a table (`TechStackTable` component) with columns Category / Technologies, rows: Frontend, Backend, Database, Authentication, Cloud & DevOps, AI Integration — matching the reference table exactly in structure.
- **Project Structure:** monospace file-tree block (`ProjectStructureBlock`) with a copy-to-clipboard button top-right, rendering the CMS-provided folder-tree string as preformatted text with a subtle syntax-style coloring (comments in muted gray, matching `# Node.js + Express API` style comments in the reference).
- **Getting Started / Environment Variables / Scripts / Deployment / Contributing / License:** additional README sections, all sourced as structured/markdown blocks from the CMS and rendered via a markdown renderer (e.g. a lightweight `react-markdown` render for these text-heavy README sub-sections) — **CMS data required:** the full README content as either one markdown blob split by known headings, or pre-split into named sections; **decision: CMS returns a single `readmeMarkdown` string, and the frontend parses/splits it by `##` headings to build the on-page anchor sections and the right-rail nav items dynamically**, so new README sections can be added CMS-side without a frontend redeploy.
- **CMS data required (this tab overall):** `readmeMarkdown: string`, `techStackTable: { category: string; technologies: string }[]`, `projectStructure: string`.
- **API endpoint:** included in the main `GET /api/projects/:slug` payload (no separate call needed — keep project detail as one payload to avoid a waterfall of tab-specific requests for content that's cheap to send together).
- **Loading/Error:** entire tab content sits under the same top-level page loading/error boundary as the rest of the project (a single skeleton covers header + stats + tab content together on first load, since it's one API call).

#### 7.4.2 Screenshots Tab (`ProjectScreenshotsTab`)
- **Purpose:** visual gallery of the project.
- **Layout:** responsive masonry/grid of screenshot thumbnails; clicking one opens a lightbox.
- **Component hierarchy:** `ProjectScreenshotsTab` → grid of `next/image` thumbnails (`"use client"` for lightbox state) → `Lightbox` (simple modal, arrow-key + swipe navigation, close on `Escape`/backdrop click).
- **CMS data required:** `gallery: { url: string; caption?: string }[]` (Cloudinary URLs).
- **API endpoint:** same project payload (`project.gallery`), no separate call.
- **Loading:** skeleton grid of square placeholders while the parent project query is in flight (again, same single fetch as the rest of the page — this tab has no independent loading state since it's not separately fetched).
- **Empty state:** `EmptyState` — "No screenshots added yet" if `gallery` is empty.
- **Animation:** grid items fade-in staggered on tab activation; lightbox open/close via scale+fade (0.2s).
- **Responsive:** 3-col grid desktop → 2-col tablet → 1-col mobile.

#### 7.4.3 Case Study Tab (`ProjectCaseStudyTab`)
- **Purpose:** narrative depth — Challenges, Solutions, Learning Outcomes, Architecture explanation.
- **Layout:** long-form article layout: Architecture (diagram image or described block), Challenges (list), Solutions (list, often paired 1:1 with challenges), Learning Outcomes (list) — sequential sections with `SectionTitle`-style sub-headings, sharing the right-rail anchor nav with the README tab's own headings (nav updates its item list based on which tab is active).
- **CMS data required:** `architectureNotes: string (markdown)`, `challenges: string[]`, `solutions: string[]`, `learningOutcomes: string[]`, optional `architectureDiagramUrl`.
- **API/Loading/Error:** same single project payload/loading boundary as 7.4.1.
- **Animation:** simple fade-in on tab switch, no special per-item stagger needed (this is dense reading content, keep motion minimal so it doesn't distract from reading).
- **Responsive:** single column at all breakpoints (this tab is prose-heavy, doesn't need the 2-col layout the README tab uses for its side table).

### 7.5 On This Page (right rail) + Project Links Card
- **Purpose:** in-page navigation for a long document, plus always-visible quick links.
- **Layout:** sticky right sidebar (desktop only, `hidden lg:block`), `OnThisPageNav` on top, `Project Links` card below it with "Live Demo" and "GitHub Repository" buttons.
- **Component:** `OnThisPageNav` (scroll-spy: uses `IntersectionObserver` on each section heading to highlight the currently-visible item, gold text + left border indicator for active item), plus a simple `ProjectLinksCard` using `Button` secondary variant twice.
- **CMS data required:** `githubUrl` (liveUrl already covered in 7.2).
- **Responsive:** hidden below `lg`; on mobile/tablet the same links are still reachable via the header's primary actions (7.2), so nothing is lost, just not duplicated as a floating rail.

### 7.6 Related Projects
- **Purpose:** keep the recruiter browsing rather than bouncing after one project.
- **Layout:** `SectionTitle` ("Related Projects" or similar) + horizontal row of 2-3 `FeaturedProjectCard`-style cards (reuse the Home page's featured card component for visual consistency, since related projects are presented similarly compactly — not the wide list-item style from the Projects page).
- **CMS data required:** `relatedProjects: Project[]` — either returned as part of the main project payload (server picks related-by-category/tag) or fetched via a small dedicated endpoint.
- **API endpoint:** `GET /api/projects/:slug/related` (decision: separate lightweight endpoint, fetched in parallel with the main project call via `Promise.all` in the Server Component, so it doesn't block or get bundled into the potentially large main payload).
- **Service function:** `project.service.ts → getRelatedProjects(slug)`.
- **Loading/Error/Empty:** skeleton row of 2-3 cards while resolving; on error, silently hide the section (non-critical, don't show a scary error box this far down the page); on empty, hide the section entirely.
- **Animation:** same card entrance pattern as Home's Featured Projects.

### 7.7 Previous / Next Project Navigation
- **Purpose:** linear browsing through the full project catalog without returning to the listing page.
- **Layout:** two-column split footer-adjacent band: left "← Previous: {title}", right "Next: {title} →", each clickable, matching the overall bordered-card aesthetic.
- **CMS data required:** `previousProject: { slug, title } | null`, `nextProject: { slug, title } | null` — determined server-side by the CMS based on project ordering.
- **API endpoint:** included in the same `GET /api/projects/:slug` payload as 7.2/7.3/7.4 (cheap metadata, no reason to split into another call).
- **Edge cases:** if there is no previous project (first in the catalog), hide the left half or render a disabled/ghosted state; same for next on the last project.
- **Animation:** simple hover state (arrow nudges 4px in the direction of travel), no entrance animation needed (bottom-of-page utility element).
- **Responsive:** stacks to full-width top/bottom on mobile instead of side-by-side.

### 7.8 Ask Project AI Panel (static/visual-only — confirmed decision)
- **Purpose (visual only):** reproduce the reference's floating assistant panel appearance for design completeness; **no backend wiring in this phase.**
- **Layout:** fixed-position floating panel bottom-right on desktop (per reference), header "✨ Ask {ProjectName} AI" with close button, greeting line, a list of 4-5 suggested-question chip buttons (non-functional — clicking them does nothing or, at most, populates the disabled input visually), a disabled text input with send icon, and a footer disclaimer line ("AI responses are based on project documentation.").
- **Component:** a single self-contained `AskProjectAIPanel` component, `"use client"` only to manage its own open/closed toggle state (no data fetching, no hook, no service).
- **Trigger:** the "Ask Project AI" button in the Project Header (7.2) toggles this panel open/closed; default state on page load is closed on mobile, and matches the reference (open) on desktop — **decision: closed by default on all breakpoints** to avoid an unsolicited overlay on first paint; user must click the header button to reveal it.
- **Responsive:** on mobile, render as a bottom-sheet-style overlay instead of a floating corner panel, to avoid overlapping content; closes on backdrop click.
- **Explicitly out of scope:** no API endpoint, no service, no hook, no streaming, no real suggested-question logic — Codex must not build any of that for this element.

### 7.9 SEO Requirements (Project Details)
- `generateMetadata` per slug: `title: "{project.title} — {siteName}"`, `description: project.shortDescription`, canonical URL, OG image = `project.thumbnailUrl` (Cloudinary), `robots` default (indexable).
- Structured data: optional `JSON-LD` `CreativeWork`/`SoftwareApplication` schema using project fields (nice-to-have, not blocking).

### 7.10 Accessibility Requirements (Project Details)
- Tabs use proper `role="tablist"`/`role="tab"`/`role="tabpanel"` with `aria-selected` and keyboard arrow-key navigation between tabs.
- Lightbox is a proper modal: focus trapped, `aria-modal="true"`, labelled, closes on `Escape`, returns focus to the triggering thumbnail.
- `OnThisPageNav` links are real anchor `<a href="#section-id">` elements, not click-handler-only spans, so they work without JS and are screen-reader/keyboard friendly.
- Prev/Next navigation uses `aria-label` describing direction and target title (e.g., `aria-label="Previous project: Daily Echo"`).

---

## 8. Loading / Error / Empty State — Cross-Page Consistency Rule

Every single data-fetching hook listed in this document must expose exactly these four states to its consuming component, and every component must handle all four without exception:

1. **Loading** → matching-shape `SkeletonBlock`/`ProjectListSkeleton` (never a generic spinner for content-shaped sections — spinners are reserved only for tiny inline actions like infinite-scroll "load more").
2. **Error** → `ErrorState` with a Retry button wired to the hook's `refetch()`, scoped as narrowly as possible (never take down the whole page for one section's failure, except the Project Details main payload, which is the page itself — if that one 404s/errors, render Next.js `notFound()` / an `error.tsx` boundary for the route).
3. **Empty** → `EmptyState`, with copy tailored per context (see each section above) — never render a bare "nothing here" with no visual treatment.
4. **Success** → the real component tree with data.

---

## 9. Animation Plan (consolidated)

| Animation | Where | Trigger | Behavior |
|---|---|---|---|
| Nav underline slide | Navbar, Project Tabs | route/tab change | shared `layoutId`, underline glides to new active item, 0.25s |
| Section entrance fade+rise | every section on Home, Projects list, Related Projects | scroll into view (`viewport once`) | opacity 0→1, y 16→0, 0.4-0.5s, staggered children |
| Card hover lift | FeaturedProjectCard, ProjectListItem, BlogPreviewCard | mouse hover / focus | border → gold-tinted, `translateY(-4px)`, thumbnail `scale-105` inside `overflow-hidden` |
| Progress bar fill | LearningProgressCard | scroll into view | width 0%→X%, 0.8s ease-out, staggered per card |
| Hero content stagger | Hero Section | page mount (not scroll) | headline → paragraph → buttons → availability row, 0.08s stagger |
| Portrait fade/scale | Hero Section | page mount | opacity 0→1, scale 0.96→1 |
| Mobile drawer slide | MobileNavDrawer | hamburger click | translateX 100%→0, 0.3s ease-out, backdrop fade |
| Tab content cross-fade | ProjectTabs | tab change | opacity cross-fade, 0.2s, no vertical movement (avoid layout jank) |
| Lightbox open/close | ProjectScreenshotsTab | thumbnail click / close | scale 0.95→1 + opacity, 0.2s |
| Infinite scroll append | Projects list | intersection observer fires | new items fade+rise in, same as section entrance but not "once" (recurs each page load) |
| Scroll-spy highlight | OnThisPageNav | scroll position change | instant class swap, no animated transition needed beyond a quick color transition (150ms) |
| Reduced motion override | global | `prefers-reduced-motion: reduce` | all of the above become instant/no-transform; opacity-only or fully disabled per Framer Motion's `useReducedMotion()` hook |

Animations exist to reinforce hierarchy and hover affordance (Linear/Vercel-style restraint), never to create suspense or delay content access — nothing blocks interactivity while animating, and nothing loops indefinitely except the availability-dot pulse and (optionally) the disabled skeleton shimmer.

---

## 10. Construction Order (Codex implementation roadmap)

Each step depends only on prior completed steps. Do not skip ahead.

1. **Project scaffolding** — confirm Next.js 15 / React 19 / TypeScript / Tailwind / shadcn/ui are initialized; verify `public/assets/` already contains the listed files; set up `globals.css` with design tokens from Section 0.3 as CSS variables.
2. **Environment & config layer** — `.env.example`, `.env.local`, `lib/env.ts` (typed, validated).
3. **Types layer** — write all interfaces in `types/` (`common.types.ts` first: `ApiResponse<T>`, `ApiError`, `PaginationMeta`; then `profile`, `project`, `skill`, `experience`, `blog`).
4. **Axios instance** — `lib/axios.ts` with interceptors and normalized error handling.
5. **API contracts** — define typed DTOs and response mappers for every public endpoint.
6. **Service layer** — `services/*.service.ts`, each function reading `env.API_URL`, calling Axios, returning typed data, and rejecting failures without content fallbacks.
7. **React Query setup** — `lib/query-client.ts`, wrap root layout in `QueryClientProvider` (+ SSR hydration boundary pattern for the two Server-fetched pages).
8. **Custom hooks** — `hooks/*.ts`, one per service function, per Section 1.2/1.3.
9. **Common/shared components** — `Button`, `SectionTitle`, `Tag`, `Badge`, `IconLink`, `SkeletonBlock`, `EmptyState`, `ErrorState` (build and visually verify these in isolation before using them in pages — they are consumed everywhere downstream).
10. **Layout shell** — `Navbar` (desktop links + scroll-blur behavior) → `MobileNavDrawer` → `Footer`. Wire into `app/layout.tsx` with `NavigationContext`.
11. **Home Page — Hero Section** (first real page content, validates the asset pipeline: portrait/skyline/mesh-glow/dots layering).
12. **Home Page — Featured Projects** (validates `FeaturedProjectCard`, the Project type, and the data-fetch-to-skeleton-to-render pipeline end to end for the first time).
13. **Home Page — Skills, Currently Learning** (reuse patterns established in step 12).
14. **Home Page — Latest Blog Posts preview, Contact CTA** (reuse `useProfile` from Hero, no new fetch pattern).
15. **Home Page — assemble & verify** full page against `desktop_homepage.png` and `MBL_homepage.png` at all breakpoints.
16. **Projects Page — Hero + Toolbar (search/filter/sort, no infinite scroll yet)** — connect filtering to the public projects API.
17. **Projects Page — `ProjectListItem` + list rendering** using the toolbar's query results.
18. **Projects Page — infinite scroll** wiring (`useInfiniteQuery` + intersection observer sentinel).
19. **Projects Page — empty/error states for both "no results" and "no projects at all"** scenarios.
20. **Projects Page — assemble & verify** against `project_page.png` at all breakpoints.
21. **Project Details Page — routing & `generateMetadata`**, `getProjectBySlug` + `getRelatedProjects` parallel fetch, `notFound()` handling for invalid slugs.
22. **Project Details Page — Header, Quick Stats, Back link**.
23. **Project Details Page — Tabs shell** (`ProjectTabs` component, empty panels wired).
24. **Project Details Page — README tab** (markdown parsing/splitting, `TechStackTable`, `ProjectStructureBlock` with copy button).
25. **Project Details Page — Screenshots tab** (gallery grid + lightbox).
26. **Project Details Page — Case Study tab**.
27. **Project Details Page — `OnThisPageNav`** (scroll-spy wired to whichever tab is active) + `ProjectLinksCard`.
28. **Project Details Page — Related Projects** + **Previous/Next Navigation**.
29. **Project Details Page — `AskProjectAIPanel`** (static shell only, per 7.8).
30. **Project Details Page — assemble & verify** against `specific_project.png` at all breakpoints.
31. **Cross-page polish pass** — animation timing consistency (Section 9), reduced-motion audit, accessibility audit (Sections 5.10/7.10), Lighthouse pass (performance/SEO/accessibility ≥ 90 target on all 3 routes).
32. **Final review** — confirm zero hardcoded endpoints/URLs remain outside `lib/env.ts`, every async section has all 4 states (Section 8), and no local content fallback exists.

---

## 11. Explicit Non-Goals (do not build, even if tempted)

- No About page, no Blog listing page, no Contact page, no Admin/CMS UI.
- No authentication, no user accounts, no write operations of any kind.
- No real "Ask Project AI" backend, streaming, or chat logic.
- No light theme / theme toggle.
- No pages or routes for nav items (Skills, Blog, Contact) beyond their static nav-link appearance.
- No new decorative image assets — reuse the 6 files already provided.
- No global state library beyond React Query + the two narrow contexts named in 1.5.

---

**End of specification. Codex should implement exactly and only what is written above, in the order given in Section 10.**
