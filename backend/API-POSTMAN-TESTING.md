# Portfolio Backend API - Postman Testing Guide

Base URL for local testing:

```text
http://localhost:4000
```

Protected CMS endpoints require this header after login:

```text
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

Before testing protected routes, create a super admin:

```bash
cd backend
cp .env.example .env
# Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in .env
npm run seed:admin
npm run dev
```

## Health

### GET `/health`

```json
{}
```

### GET `/health/ready`

```json
{}
```

## Public Portfolio API

### GET `/api/home`

Returns the home aggregate: hero, featured projects, skills, currently learning, and latest articles.

### GET `/api/projects`

Query examples:

```text
/api/projects?category=All&page=1&pageSize=5&sort=newest
/api/projects?featured=true&limit=3
/api/projects?search=Next.js
```

### GET `/api/projects/:slug`

```text
/api/projects/cms-project
```

### GET `/api/projects/:slug/related`

```text
/api/projects/cms-project/related
```

### GET `/api/blogs`

Query examples:

```text
/api/blogs?page=1&pageSize=9
/api/blogs?category=Backend
/api/blogs?search=CMS
```

### GET `/api/blogs/:slug`

```text
/api/blogs/cms-article
```

### GET `/api/contact`

Returns contact page content.

### POST `/api/contact/messages`

```json
{
  "name": "Priya Menon",
  "email": "priya@example.com",
  "subject": "Full-stack role",
  "message": "We are hiring for a full-stack developer role and would like to discuss your portfolio and project experience.",
  "source": "portfolio-contact-page"
}
```

### POST `/api/contact/meeting-requests`

Phone meeting:

```json
{
  "meetingType": "phone",
  "fullName": "Priya Menon",
  "phone": "+91 98765 43210",
  "preferredDate": "2026-08-05",
  "preferredTime": "15:30",
  "timezone": "Asia/Kolkata",
  "purpose": "Discuss a full-stack developer opportunity",
  "message": "A short introductory call would be helpful."
}
```

Google Meet:

```json
{
  "meetingType": "meet",
  "fullName": "Priya Menon",
  "email": "priya@example.com",
  "preferredDate": "2026-08-05",
  "preferredTime": "15:30",
  "timezone": "Asia/Kolkata",
  "purpose": "Project collaboration discussion",
  "message": "I would like to discuss a product build."
}
```

## CMS Auth

### POST `/api/cms/auth/login`

```json
{
  "email": "admin@example.com",
  "password": "your-super-admin-password"
}
```

Save `data.accessToken` as `{{accessToken}}` in Postman.

### POST `/api/cms/auth/refresh`

Uses the `refreshToken` httpOnly cookie set by login. If testing without cookies:

```json
{
  "refreshToken": "paste-refresh-token-if-you-have-it"
}
```

### POST `/api/cms/auth/logout`

```json
{}
```

## CMS Content

### GET `/api/cms/dashboard/summary`

Requires `Authorization`.

### GET `/api/cms/home`

Requires `Authorization`.

### PUT `/api/cms/home`

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

### GET `/api/cms/skills`

Requires `Authorization`.

### PUT `/api/cms/skills`

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

## CMS Projects

### GET `/api/cms/projects`

### POST `/api/cms/projects`

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
  "publishStatus": "published"
}
```

### PUT `/api/cms/projects/:slug`

Send any subset of the project fields.

```json
{
  "title": "Updated CMS Project",
  "publishStatus": "published"
}
```

### PATCH `/api/cms/projects/:slug/publish`

```json
{
  "publishStatus": "published"
}
```

### PATCH `/api/cms/projects/reorder`

```json
{
  "items": [
    { "slug": "cms-project", "orderIndex": 0 },
    { "slug": "another-project", "orderIndex": 1 }
  ]
}
```

### DELETE `/api/cms/projects/:slug`

```text
/api/cms/projects/cms-project
```

## CMS Blogs

### GET `/api/cms/blogs`

### POST `/api/cms/blogs`

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
  "publishStatus": "published"
}
```

### PUT `/api/cms/blogs/:slug`

```json
{
  "title": "Updated CMS Article Testing",
  "publishStatus": "published"
}
```

### POST `/api/cms/blogs/:slug/blocks`

```json
{
  "id": "details",
  "type": "heading",
  "level": 2,
  "text": "Implementation Details"
}
```

### PATCH `/api/cms/blogs/:slug/blocks/reorder`

```json
{
  "blockIds": ["intro", "details"]
}
```

### DELETE `/api/cms/blogs/:slug/blocks/:blockId`

```text
/api/cms/blogs/cms-article/blocks/details
```

### DELETE `/api/cms/blogs/:slug`

```text
/api/cms/blogs/cms-article
```

## CMS Contact

### GET `/api/cms/contact`

### PUT `/api/cms/contact`

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

### GET `/api/cms/messages`

### PATCH `/api/cms/messages/:id/status`

```json
{
  "status": "read"
}
```

### GET `/api/cms/meeting-requests`

### PATCH `/api/cms/meeting-requests/:id/status`

```json
{
  "status": "scheduled"
}
```

## CMS Media

### POST `/api/cms/media/sign-upload`

```json
{
  "folder": "portfolio/projects"
}
```

### POST `/api/cms/media`

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

### GET `/api/cms/media`

Optional folder filter:

```text
/api/cms/media?folder=portfolio/projects
```

### DELETE `/api/cms/media/:id`

Use a MongoDB `_id` returned by `GET /api/cms/media`.

## CMS Experience

### GET `/api/cms/experience`

### POST `/api/cms/experience`

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

### PUT `/api/cms/experience/:id`

```json
{
  "publishStatus": "published"
}
```

### PATCH `/api/cms/experience/reorder`

```json
{
  "items": [
    { "id": "paste-experience-id", "orderIndex": 0 }
  ]
}
```

### DELETE `/api/cms/experience/:id`

## CMS About, Settings, SEO

### GET `/api/cms/about`

### PUT `/api/cms/about`

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

### GET `/api/cms/settings`

### PUT `/api/cms/settings`

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

### GET `/api/cms/seo`

### POST `/api/cms/seo`

```json
{
  "pagePath": "/projects",
  "metaTitle": "Projects - Abishek Portfolio",
  "metaDescription": "Selected full-stack, AI, and cloud projects by Abishek.",
  "ogImageUrl": "/assets/graphics/mesh-glow.png",
  "canonicalUrl": "https://example.com/projects"
}
```

### PUT `/api/cms/seo/:id`

```json
{
  "metaTitle": "Updated Projects - Abishek Portfolio"
}
```

### DELETE `/api/cms/seo/:id`

## CMS Users, Roles, Audit Logs

### GET `/api/cms/users`

### POST `/api/cms/users`

```json
{
  "name": "Editor User",
  "email": "editor@example.com",
  "password": "editor-password-123",
  "roleName": "EDITOR"
}
```

### PATCH `/api/cms/users/:id`

```json
{
  "active": false
}
```

### GET `/api/cms/roles`

### PUT `/api/cms/roles/:id`

```json
{
  "permissions": [
    { "module": "projects", "actions": ["create", "read", "update", "delete", "publish"] },
    { "module": "blogs", "actions": ["create", "read", "update", "delete", "publish"] }
  ]
}
```

### GET `/api/cms/audit-logs`

Returns the latest 200 audit log entries.
