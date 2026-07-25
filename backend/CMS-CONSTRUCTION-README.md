# Portfolio CMS Backend Construction Guide

This file is for building the Admin CMS frontend against the existing backend.

Base URL:

```text
http://localhost:4000
```

Public API prefix:

```text
/api
```

CMS API prefix:

```text
/api/cms
```

## Backend Structure

The backend is a modular Express + MongoDB application.

```text
backend/
├── src/
│   ├── app.ts                  # Express app setup, middleware, routes
│   ├── server.ts               # DB connection and HTTP server bootstrap
│   ├── routes.ts               # Public and CMS route registration
│   ├── common/                 # Shared errors, response envelope, pagination
│   ├── config/                 # Env, MongoDB, Redis, Cloudinary, logger
│   ├── jobs/                   # Cache invalidation, media sweeping, read time
│   ├── middlewares/            # Auth, RBAC, validation, cache, rate limits
│   └── modules/
│       ├── auth/               # CMS login, refresh, logout
│       ├── users/              # CMS users, roles, permissions
│       ├── dashboard/          # CMS summary cards
│       ├── home/               # Home hero singleton
│       ├── skills/             # Skills singleton
│       ├── projects/           # Projects CRUD + public listing/detail
│       ├── blog/               # Blog CRUD + block editor
│       ├── contact/            # Contact info, messages, meeting requests
│       ├── media/              # Cloudinary signed upload + media library
│       ├── experience/         # Experience timeline CMS module
│       ├── about/              # About page singleton
│       ├── seo/                # Per-page SEO overrides
│       ├── settings/           # Site-wide settings singleton
│       └── auditLogs/          # CMS activity log
├── API-POSTMAN-TESTING.md      # Postman URLs and sample payloads
├── .env.example
└── package.json
```

Layering per module:

```text
Route -> Controller -> Service -> Repository -> Mongoose Model
```

Some older modules still route directly to services from `routes.ts`, but database access belongs in repositories and business behavior belongs in services.

## Setup

Install and start:

```bash
cd backend
npm install
npm run dev
```

Seed CMS roles and admin:

```bash
npm run seed:admin
```

Seed default content:

```bash
npm run seed:content
```

Required `.env` values for Atlas:

```env
PORT=4000
MONGODB_URI=mongodb+srv://<DB_USERNAME>:<URL_ENCODED_PASSWORD>@<CLUSTER_HOST>/portfolio?retryWrites=true&w=majority
JWT_ACCESS_SECRET=change-this-access-secret
JWT_REFRESH_SECRET=change-this-refresh-secret
COOKIE_SECRET=change-this-cookie-secret
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=change-this-admin-password
SUPER_ADMIN_NAME=Portfolio Admin
```

Redis is optional in development:

```env
REDIS_URL=
```

## API Response Format

Success:

```json
{
  "data": {},
  "meta": {
    "requestId": "request-id"
  }
}
```

Validation or API error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": []
  },
  "meta": {
    "requestId": "request-id"
  }
}
```

## CMS Authentication

Login:

```http
POST /api/cms/auth/login
```

Body:

```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

Use the returned token on every protected CMS request:

```text
Authorization: Bearer <accessToken>
```

Refresh token is also stored as an HTTP-only cookie by the backend.

## Roles And Permissions

Seeded roles:

```text
SUPER_ADMIN
EDITOR
VIEWER
```

CMS route access is checked by `authMiddleware` and `rbac(module, action)`.

Common actions:

```text
create
read
update
delete
publish
```

## Endpoint Inventory

### Health

| Method | URL | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | No | Liveness check |
| GET | `/health/ready` | No | DB readiness check |

### Public Portfolio

| Method | URL | Auth | Purpose |
|---|---|---|---|
| GET | `/api/home` | No | Home aggregate |
| GET | `/api/projects` | No | Published project list |
| GET | `/api/projects/:slug` | No | Published project detail |
| GET | `/api/projects/:slug/related` | No | Related published projects |
| GET | `/api/blogs` | No | Published blog list |
| GET | `/api/blogs/:slug` | No | Published blog detail |
| GET | `/api/contact` | No | Contact page content |
| POST | `/api/contact/messages` | No | Submit contact form |
| POST | `/api/contact/meeting-requests` | No | Submit meeting request |

### CMS Auth

| Method | URL | Auth | Purpose |
|---|---|---|---|
| POST | `/api/cms/auth/login` | No | Login and receive access token |
| POST | `/api/cms/auth/refresh` | Cookie/body refresh token | Rotate refresh token |
| POST | `/api/cms/auth/logout` | Optional cookie/body refresh token | Logout |

### CMS Dashboard

| Method | URL | Permission |
|---|---|---|
| GET | `/api/cms/dashboard/summary` | `dashboard:read` |

### CMS Home

| Method | URL | Permission |
|---|---|---|
| GET | `/api/cms/home` | `home:read` |
| PUT | `/api/cms/home` | `home:update` |

Home update body:

```json
{
  "hero": {
    "headline": "Building scalable software and intelligent",
    "highlightedHeadline": "digital experiences.",
    "subheadline": "Full-stack developer focused on AI-powered products, cloud-native systems, and polished user experiences.",
    "cta": {
      "primaryLabel": "Explore Projects",
      "secondaryLabel": "Contact Me"
    }
  }
}
```

### CMS Skills

| Method | URL | Permission |
|---|---|---|
| GET | `/api/cms/skills` | `skills:read` |
| PUT | `/api/cms/skills` | `skills:update` |

Skills update body:

```json
{
  "categories": [
    {
      "id": "frontend",
      "title": "Frontend",
      "items": ["React", "Next.js", "TypeScript"],
      "orderIndex": 0
    },
    {
      "id": "backend",
      "title": "Backend",
      "items": ["Node.js", "Express", "MongoDB"],
      "orderIndex": 1
    }
  ],
  "learningItems": [
    {
      "id": "advanced-rag",
      "label": "Advanced RAG",
      "icon": "Sparkles",
      "progressPercent": 78,
      "orderIndex": 0
    }
  ]
}
```

### CMS Projects

| Method | URL | Permission |
|---|---|---|
| GET | `/api/cms/projects` | `projects:read` |
| POST | `/api/cms/projects` | `projects:create` |
| PUT | `/api/cms/projects/:slug` | `projects:update` |
| DELETE | `/api/cms/projects/:slug` | `projects:delete` |
| PATCH | `/api/cms/projects/reorder` | `projects:update` |
| PATCH | `/api/cms/projects/:slug/publish` | `projects:publish` |

Project create body:

```json
{
  "slug": "cms-project",
  "orderIndex": 1,
  "title": "CMS Project",
  "tagline": "Production-ready project managed through the CMS",
  "shortDescription": "A complete project entry that exercises the public and CMS contracts.",
  "description": "This project payload mirrors the portfolio contract and is long enough to satisfy validation.",
  "status": "production",
  "category": "Full Stack",
  "thumbnailUrl": "https://res.cloudinary.com/demo/image/upload/v1/portfolio/projects/cms-project.png",
  "techTags": ["Next.js", "TypeScript"],
  "highlights": ["CMS editable"],
  "liveDemoUrl": "https://example.com/demo",
  "githubUrl": "https://github.com/example/cms-project",
  "durationLabel": "4 Weeks",
  "role": "Full Stack Developer",
  "lastUpdatedAt": "2026-07-22",
  "techIcons": ["Next", "TS"],
  "readmeMarkdown": "## Overview\nThis project is documented for testing.",
  "projectStructure": "apps/web\napps/api",
  "techStackTable": [{ "category": "Frontend", "technologies": "Next.js, TypeScript" }],
  "gallery": [],
  "architectureNotes": "The implementation follows a modular backend pattern with clear API contracts and CMS-managed content.",
  "challenges": ["Keeping content editable"],
  "solutions": ["Validated REST payloads"],
  "learningOutcomes": ["Contract-first backend design"],
  "isFeatured": true,
  "publishStatus": "draft"
}
```

Publish body:

```json
{
  "publishStatus": "published"
}
```

Reorder body:

```json
{
  "items": [
    { "slug": "cms-project", "orderIndex": 0 }
  ]
}
```

### CMS Blogs

| Method | URL | Permission |
|---|---|---|
| GET | `/api/cms/blogs` | `blogs:read` |
| POST | `/api/cms/blogs` | `blogs:create` |
| PUT | `/api/cms/blogs/:slug` | `blogs:update` |
| DELETE | `/api/cms/blogs/:slug` | `blogs:delete` |
| POST | `/api/cms/blogs/:slug/blocks` | `blogs:update` |
| PATCH | `/api/cms/blogs/:slug/blocks/reorder` | `blogs:update` |
| DELETE | `/api/cms/blogs/:slug/blocks/:blockId` | `blogs:update` |

Blog create body:

```json
{
  "slug": "cms-article",
  "title": "CMS Article Testing",
  "excerpt": "A contract-valid article preview used to verify blog validation and publish filtering.",
  "category": "Backend",
  "publishedAt": "2026-07-22",
  "updatedAt": "2026-07-22",
  "author": "Abishek Krishnamoorthy",
  "tags": ["Backend", "CMS"],
  "coverImageUrl": "/assets/graphics/mesh-glow.png",
  "blocks": [
    {
      "id": "intro",
      "type": "paragraph",
      "text": "This paragraph contains enough words to satisfy the blog block validation contract."
    }
  ],
  "featured": false,
  "publishStatus": "draft"
}
```

Add heading block:

```json
{
  "id": "details",
  "type": "heading",
  "level": 2,
  "text": "Implementation Details"
}
```

Add paragraph block:

```json
{
  "id": "body-copy",
  "type": "paragraph",
  "text": "This paragraph contains enough content to pass validation and render cleanly in the blog article editor."
}
```

Reorder blocks:

```json
{
  "blockIds": ["intro", "details", "body-copy"]
}
```

### CMS Contact

| Method | URL | Permission |
|---|---|---|
| GET | `/api/cms/contact` | `contact:read` |
| PUT | `/api/cms/contact` | `contact:update` |
| GET | `/api/cms/messages` | `messages:read` |
| PATCH | `/api/cms/messages/:id/status` | `messages:update` |
| GET | `/api/cms/meeting-requests` | `meeting-requests:read` |
| PATCH | `/api/cms/meeting-requests/:id/status` | `meeting-requests:update` |

Contact content update body:

```json
{
  "hero": {
    "title": "Let's Connect",
    "description": "Whether you're hiring, collaborating, or discussing a project, I'm always happy to connect."
  },
  "contact": {
    "email": {
      "label": "Email",
      "value": "abishek@example.com",
      "href": "mailto:abishek@example.com",
      "visible": true
    },
    "location": {
      "label": "Location",
      "value": "India - Open to Remote",
      "visible": true
    }
  },
  "communicationMethods": [
    {
      "id": "meet",
      "type": "meet",
      "title": "Google Meet",
      "description": "Perfect for technical discussions and project demos.",
      "duration": "30 Minutes",
      "actionLabel": "Schedule Google Meet",
      "visible": true
    }
  ],
  "socialLinks": [
    {
      "platform": "GitHub",
      "username": "@abishekk",
      "profileUrl": "https://github.com/abishekk",
      "icon": "Code2",
      "displayOrder": 1,
      "visible": true
    }
  ]
}
```

Status update body:

```json
{
  "status": "read"
}
```

## CMS Media

| Method | URL | Permission |
|---|---|---|
| POST | `/api/cms/media/sign-upload` | `media:create` |
| GET | `/api/cms/media` | `media:read` |
| POST | `/api/cms/media` | `media:create` |
| DELETE | `/api/cms/media/:id` | `media:delete` |

Signed upload body:

```json
{
  "folder": "portfolio/projects"
}
```

Create media asset body:

```json
{
  "publicId": "portfolio/projects/cms-project",
  "url": "https://res.cloudinary.com/demo/image/upload/v1/portfolio/projects/cms-project.png",
  "secureUrl": "https://res.cloudinary.com/demo/image/upload/v1/portfolio/projects/cms-project.png",
  "folder": "portfolio/projects",
  "resourceType": "image",
  "format": "png",
  "width": 1200,
  "height": 800,
  "bytes": 120000
}
```

## CMS Experience

| Method | URL | Permission |
|---|---|---|
| GET | `/api/cms/experience` | `experience:read` |
| POST | `/api/cms/experience` | `experience:create` |
| PUT | `/api/cms/experience/:id` | `experience:update` |
| DELETE | `/api/cms/experience/:id` | `experience:delete` |
| PATCH | `/api/cms/experience/reorder` | `experience:update` |

Experience create body:

```json
{
  "role": "Software Engineer",
  "company": "Portfolio Labs",
  "location": "Remote",
  "startDate": "2026-01-01",
  "endDate": null,
  "description": "Building and maintaining portfolio-grade full-stack applications with clean backend contracts.",
  "techTags": ["Node.js", "MongoDB"],
  "orderIndex": 0,
  "publishStatus": "draft"
}
```

## CMS About

| Method | URL | Permission |
|---|---|---|
| GET | `/api/cms/about` | `about:read` |
| PUT | `/api/cms/about` | `about:update` |

About update body:

```json
{
  "bio": [
    {
      "id": "about-intro",
      "type": "paragraph",
      "text": "I build full-stack products with a focus on clean backend systems, practical AI features, and polished user experiences."
    }
  ],
  "profileImage": {
    "url": "/assets/hero/portriat.png",
    "alt": "Portrait of Abishek"
  },
  "resumeUrl": "/resume.pdf",
  "highlights": ["Full-stack development", "AI product engineering"]
}
```

## CMS Settings

| Method | URL | Permission |
|---|---|---|
| GET | `/api/cms/settings` | `settings:read` |
| PUT | `/api/cms/settings` | `settings:update` |

Settings update body:

```json
{
  "seo": {
    "defaultTitle": "Abishek Portfolio",
    "defaultDescription": "Full-stack developer portfolio"
  },
  "forms": {
    "recipientEmail": "abishek@example.com"
  },
  "scheduling": {
    "timezone": "Asia/Kolkata",
    "durations": [15, 30]
  }
}
```

## CMS SEO

| Method | URL | Permission |
|---|---|---|
| GET | `/api/cms/seo` | `seo:read` |
| POST | `/api/cms/seo` | `seo:create` |
| PUT | `/api/cms/seo/:id` | `seo:update` |
| DELETE | `/api/cms/seo/:id` | `seo:delete` |

SEO create body:

```json
{
  "pagePath": "/projects",
  "metaTitle": "Projects - Abishek Portfolio",
  "metaDescription": "Selected full-stack, AI, and cloud projects by Abishek.",
  "ogImageUrl": "/assets/graphics/mesh-glow.png",
  "canonicalUrl": "https://example.com/projects"
}
```

## CMS Users And Roles

| Method | URL | Permission |
|---|---|---|
| GET | `/api/cms/users` | `users:read` |
| POST | `/api/cms/users` | `users:create` |
| PATCH | `/api/cms/users/:id` | `users:update` |
| GET | `/api/cms/roles` | `roles:read` |
| PUT | `/api/cms/roles/:id` | `roles:update` |
| GET | `/api/cms/audit-logs` | `settings:read` |

Create user body:

```json
{
  "name": "Editor User",
  "email": "editor@example.com",
  "password": "editor-password-123",
  "roleName": "EDITOR"
}
```

Update user body:

```json
{
  "active": false
}
```

Update role body:

```json
{
  "permissions": [
    { "module": "projects", "actions": ["create", "read", "update", "delete", "publish"] },
    { "module": "blogs", "actions": ["create", "read", "update", "delete", "publish"] }
  ]
}
```

## CMS Frontend Construction Notes

Build the CMS around these screens:

```text
Login
Dashboard
Home Editor
Skills Editor
Projects List + Project Editor
Blogs List + Blog Editor + Block Editor
Contact Content Editor
Messages Inbox
Meeting Requests Queue
Media Library
Experience Timeline Editor
About Editor
SEO Overrides
Settings
Users
Roles
Audit Logs
```

Recommended client behavior:

- Store `accessToken` in memory or secure client state.
- Send `Authorization: Bearer <accessToken>` on CMS requests.
- On `401`, call `/api/cms/auth/refresh`, then retry once.
- On `403`, show a permission error.
- On validation errors, read `error.details[].field` and show field-level errors.
- Treat `publishStatus: "draft"` as hidden from public APIs.
- Use `GET /api/cms/media` for media picker lists.
- Use `/api/cms/media/sign-upload` before direct Cloudinary uploads.
- After save/create/delete, refresh the relevant list/detail view.

## Verification Commands

```bash
npm run typecheck
npm run build
npm test
```

The backend also has a Postman-specific guide with more examples:

```text
backend/API-POSTMAN-TESTING.md
```
