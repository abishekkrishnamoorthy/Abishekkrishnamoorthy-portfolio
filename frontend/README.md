# Home Page Frontend-First API Contract

Deployment trigger note: this frontend documentation change is safe and does not alter runtime behavior.

This document analyzes the current Home page implementation and defines the backend data contract based on what the frontend actually renders today.

It does not propose backend code, database models, or routes beyond the recommended response shape.

## Scope

The analysis is based on these files:

- [src/app/page.tsx](/home/intellect/Desktop/Abishek_portfolio/src/app/page.tsx:1)
- [src/components/home/HeroSection.tsx](/home/intellect/Desktop/Abishek_portfolio/src/components/home/HeroSection.tsx:1)
- [src/components/home/HomeSections.tsx](/home/intellect/Desktop/Abishek_portfolio/src/components/home/HomeSections.tsx:1)
- [src/components/home/FeaturedProjectCard.tsx](/home/intellect/Desktop/Abishek_portfolio/src/components/home/FeaturedProjectCard.tsx:1)
- [src/types/profile.types.ts](/home/intellect/Desktop/Abishek_portfolio/src/types/profile.types.ts:1)
- [src/types/project.types.ts](/home/intellect/Desktop/Abishek_portfolio/src/types/project.types.ts:1)
- [src/types/skill.types.ts](/home/intellect/Desktop/Abishek_portfolio/src/types/skill.types.ts:1)
- [src/types/blog.types.ts](/home/intellect/Desktop/Abishek_portfolio/src/types/blog.types.ts:158)
- [src/services/profile.service.ts](/home/intellect/Desktop/Abishek_portfolio/src/services/profile.service.ts:1)
- [src/services/project.service.ts](/home/intellect/Desktop/Abishek_portfolio/src/services/project.service.ts:1)
- [src/services/skill.service.ts](/home/intellect/Desktop/Abishek_portfolio/src/services/skill.service.ts:1)
- [src/services/blog.service.ts](/home/intellect/Desktop/Abishek_portfolio/src/services/blog.service.ts:1)

## Current Home Page Data Sources

The current Home page fetches four data groups:

- `profile`
- `featuredProjects`
- `skills`
- `latestPosts`

The CTA section at the bottom is currently static and does not consume backend data.

## What the Current Home Page Actually Renders

### Hero Section

Rendered dynamic values:

- `profile.headline`
- `profile.highlightedHeadline`
- `profile.subheadline`
- `profile.ctaLabels.primary`
- `profile.ctaLabels.secondary`

Not currently rendered on Home:

- `name`
- `availabilityStatus`
- `email`
- `githubUrl`
- `linkedinUrl`
- `resumeUrl`
- `scheduleCallUrl`
- `socialLinks`

Also not currently dynamic:

- greeting
- name label
- role pill text
- hero portrait asset
- skyline/background asset
- resume button

### Featured Projects

Rendered dynamic values per card:

- `id`
- `slug`
- `thumbnailUrl`
- `title`
- `tagline`
- `shortDescription`
- `techTags` with only the first 4 shown
- `liveDemoUrl`
- `githubUrl`

Not rendered on Home even though the full `Project` type contains them:

- `description`
- `status`
- `category`
- `highlights`
- `caseStudyUrl`
- `durationLabel`
- `role`
- `lastUpdatedAt`
- `techIcons`
- `readmeMarkdown`
- `projectStructure`
- `techStackTable`
- `gallery`
- `architectureNotes`
- `challenges`
- `solutions`
- `learningOutcomes`
- `architectureDiagramUrl`
- `previousProject`
- `nextProject`

### Skills

Rendered dynamic values:

- `skills.categories[].title`
- `skills.categories[].items`

Used internally by the frontend:

- `skills.categories[].category` is currently used as the React key

The section icon is not coming from the backend today. It is chosen by array index in the frontend.

### Currently Learning

Rendered dynamic values:

- `skills.learningItems[].label`
- `skills.learningItems[].icon`
- `skills.learningItems[].progressPercent`

Also present in the section:

- one additional static card called `Learning Journey`

### Latest Blog Preview

Rendered dynamic values:

- `slug`
- `coverImageUrl`
- `category`
- `title`
- `excerpt`
- `publishedAt`
- `readTimeMinutes`

Fetched but not rendered on Home:

- `tags`

### Contact CTA

The final CTA section is currently static.

Rendered static values:

- eyebrow
- title
- description
- button labels
- `/contact` links

## Field-by-Field Contract

## Hero

### `hero.headline`

- Field Name: `headline`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 10 characters, maximum 60 characters
- Recommended Maximum Length: `60`
- CMS Editable: `YES`
- Reason: first line of the main hero heading
- Example Value: `Building scalable software and intelligent`

### `hero.highlightedHeadline`

- Field Name: `highlightedHeadline`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 5 characters, maximum 32 characters
- Recommended Maximum Length: `32`
- CMS Editable: `YES`
- Reason: second line of the H1 is styled differently and should remain separate
- Example Value: `digital experiences.`

### `hero.subheadline`

- Field Name: `subheadline`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 40 characters, maximum 220 characters
- Recommended Maximum Length: `220`
- CMS Editable: `YES`
- Reason: supporting paragraph under the hero heading
- Example Value: `Full-stack developer focused on AI-powered products, cloud-native systems, and polished user experiences that move cleanly from idea to production.`

### `hero.cta.primaryLabel`

- Field Name: `primaryLabel`
- Type: `string`
- Required: `Yes`
- Default Value: `Explore Projects`
- Validation: trimmed, minimum 2 characters, maximum 20 characters
- Recommended Maximum Length: `20`
- CMS Editable: `YES`
- Reason: visible label inside the primary hero CTA
- Example Value: `Explore Projects`

### `hero.cta.secondaryLabel`

- Field Name: `secondaryLabel`
- Type: `string`
- Required: `Yes`
- Default Value: `Contact Me`
- Validation: trimmed, minimum 2 characters, maximum 20 characters
- Recommended Maximum Length: `20`
- CMS Editable: `YES`
- Reason: visible label inside the secondary hero CTA
- Example Value: `Contact Me`

### Hero Fields Not Needed From Backend Right Now

### `hero.greeting`

- Field Name: `greeting`
- Type: `string`
- Required: `No`
- Default Value: `""`
- Validation: none for current Home page
- Recommended Maximum Length: `0`
- CMS Editable: `NO`
- Reason: not rendered in the current Home UI
- Example Value: `Hi, I'm Abishek`

### `hero.name`

- Field Name: `name`
- Type: `string`
- Required: `No`
- Default Value: `""`
- Validation: none for current Home page
- Recommended Maximum Length: `0`
- CMS Editable: `NO`
- Reason: name is not displayed in the current hero
- Example Value: `Abishek Krishnamoorthy`

### `hero.roles`

- Field Name: `roles`
- Type: `array[string]`
- Required: `No`
- Default Value: `[]`
- Validation: if introduced later, use 1 to 3 short values
- Recommended Maximum Length: `24` per item
- CMS Editable: `NO`
- Reason: the current role pill is hardcoded and rendered as one static label
- Example Value: `["Full-stack Developer", "AI Engineer"]`

### `hero.status`

- Field Name: `status`
- Type: `object`
- Required: `No`
- Default Value: `null`
- Validation: not applicable for current Home page
- Recommended Maximum Length: `25` for visible label if added later
- CMS Editable: `NO`
- Reason: status is not currently shown on Home
- Example Value: `{ "label": "Open to opportunities", "tone": "success" }`

### `hero.heroImage`

- Field Name: `heroImage`
- Type: `object`
- Required: `No`
- Default Value: `null`
- Validation: if introduced later, require valid `src` and `alt`
- Recommended Maximum Length: `200` for URL
- CMS Editable: `NO`
- Reason: current hero artwork is static layered design, not CMS-driven
- Example Value: `{ "src": "/assets/hero/portrait.png", "alt": "Abishek portrait" }`

### `hero.resumeButton`

- Field Name: `resumeButton`
- Type: `object`
- Required: `No`
- Default Value: `null`
- Validation: label 2 to 20 chars, URL must be valid if enabled
- Recommended Maximum Length: `20` for label
- CMS Editable: `NO`
- Reason: no resume button is rendered on the current Home page
- Example Value: `{ "label": "Download Resume", "url": "https://example.com/resume.pdf" }`

## Featured Projects

Home should receive a minimal project card model, not the full project detail model.

### `featuredProjects[].id`

- Field Name: `id`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: unique, stable identifier
- Recommended Maximum Length: `40`
- CMS Editable: `NO`
- Reason: internal stable identity for rendering and caching
- Example Value: `qconnect`

### `featuredProjects[].slug`

- Field Name: `slug`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: unique, lowercase slug, regex `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- Recommended Maximum Length: `80`
- CMS Editable: `YES`
- Reason: used for the project detail route
- Example Value: `qconnect`

### `featuredProjects[].title`

- Field Name: `title`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 3 characters, maximum 40 characters
- Recommended Maximum Length: `40`
- CMS Editable: `YES`
- Reason: primary visible card heading
- Example Value: `QConnect`

### `featuredProjects[].tagline`

- Field Name: `tagline`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 10 characters, maximum 60 characters
- Recommended Maximum Length: `60`
- CMS Editable: `YES`
- Reason: secondary visible line below the title
- Example Value: `Real-time support platform for connected teams`

### `featuredProjects[].shortDescription`

- Field Name: `shortDescription`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 30 characters, maximum 140 characters
- Recommended Maximum Length: `140`
- CMS Editable: `YES`
- Reason: line-clamped summary inside the card
- Example Value: `A production-style full-stack queue and support platform.`

### `featuredProjects[].thumbnailUrl`

- Field Name: `thumbnailUrl`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: valid absolute HTTPS URL or site-relative asset path, allowed image formats `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.svg`
- Recommended Maximum Length: `200`
- CMS Editable: `YES`
- Reason: card cover image
- Example Value: `/assets/graphics/mesh-glow.png`

### `featuredProjects[].techTags`

- Field Name: `techTags`
- Type: `array[string]`
- Required: `Yes`
- Default Value: `[]`
- Validation: 1 to 4 items for the Home DTO, unique strings, each trimmed
- Recommended Maximum Length: `20` per item
- CMS Editable: `YES`
- Reason: the current card renders up to 4 tags
- Example Value: `["Next.js", "TypeScript", "Node.js", "MongoDB"]`

### `featuredProjects[].liveDemoUrl`

- Field Name: `liveDemoUrl`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: valid absolute HTTPS URL
- Recommended Maximum Length: `200`
- CMS Editable: `YES`
- Reason: the Live Demo button always renders in the current card
- Example Value: `https://qconnect-demo.example.com`

### `featuredProjects[].githubUrl`

- Field Name: `githubUrl`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: valid absolute HTTPS URL
- Recommended Maximum Length: `200`
- CMS Editable: `YES`
- Reason: the GitHub button always renders in the current card
- Example Value: `https://github.com/abishekk/qconnect`

## Skills

### `skills.categories[].id`

- Field Name: `id`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: enum values recommended: `frontend`, `backend`, `ai-tools-cloud`
- Recommended Maximum Length: `30`
- CMS Editable: `NO`
- Reason: stable key and future icon mapping target
- Example Value: `frontend`

### `skills.categories[].title`

- Field Name: `title`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 3 characters, maximum 24 characters
- Recommended Maximum Length: `24`
- CMS Editable: `YES`
- Reason: visible skill category heading
- Example Value: `Frontend`

### `skills.categories[].items`

- Field Name: `items`
- Type: `array[string]`
- Required: `Yes`
- Default Value: `[]`
- Validation: 3 to 8 items, unique, trimmed
- Recommended Maximum Length: `24` per item
- CMS Editable: `YES`
- Reason: visible skill list inside each category card
- Example Value: `["React", "Next.js", "TypeScript", "Tailwind CSS"]`

### Icon Requirement Note

- Current frontend does not require icon data from backend.
- Icons are currently chosen by array index.
- Recommended improvement: add `iconKey` later and map it in the frontend by `id`, not by index.

## Currently Learning

### `currentlyLearning.items[].label`

- Field Name: `label`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 3 characters, maximum 28 characters
- Recommended Maximum Length: `28`
- CMS Editable: `YES`
- Reason: compact title in a small learning card
- Example Value: `Advanced RAG`

### `currentlyLearning.items[].icon`

- Field Name: `icon`
- Type: `string`
- Required: `Yes`
- Default Value: `Sparkles`
- Validation: enum values recommended: `Sparkles`, `Cloud`, `Network`
- Recommended Maximum Length: `20`
- CMS Editable: `YES`
- Reason: frontend maps this value to an icon component
- Example Value: `Sparkles`

### `currentlyLearning.items[].progressPercent`

- Field Name: `progressPercent`
- Type: `number`
- Required: `Yes`
- Default Value: `0`
- Validation: integer between `0` and `100`
- Recommended Maximum Length: `N/A`
- CMS Editable: `YES`
- Reason: drives both visible progress text and progress bar width
- Example Value: `78`

### Currently Learning Notes

- Order should be preserved by array position.
- Current frontend uses `label` as the React key.
- Recommended improvement: add a stable `id` for each learning item.

## Latest Blog Preview

Home should receive an article preview model, not the full article with content blocks.

### `latestArticles[].slug`

- Field Name: `slug`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: unique, lowercase slug, regex `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- Recommended Maximum Length: `100`
- CMS Editable: `YES`
- Reason: used for blog detail navigation
- Example Value: `understanding-rag-architecture`

### `latestArticles[].title`

- Field Name: `title`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 8 characters, maximum 65 characters
- Recommended Maximum Length: `65`
- CMS Editable: `YES`
- Reason: visible article card heading
- Example Value: `Understanding RAG Architecture`

### `latestArticles[].excerpt`

- Field Name: `excerpt`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 40 characters, maximum 160 characters
- Recommended Maximum Length: `160`
- CMS Editable: `YES`
- Reason: line-clamped article summary
- Example Value: `A clear mental model for retrieval augmented generation, covering ingestion, embeddings, vector search, prompts, citations, and answer grounding.`

### `latestArticles[].category`

- Field Name: `category`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 2 characters, maximum 20 characters
- Recommended Maximum Length: `20`
- CMS Editable: `YES`
- Reason: compact category label above the title
- Example Value: `AI`

### `latestArticles[].coverImageUrl`

- Field Name: `coverImageUrl`
- Type: `string`
- Required: `No`
- Default Value: `""`
- Validation: valid absolute HTTPS URL or site-relative asset path, allowed image formats `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.svg`
- Recommended Maximum Length: `200`
- CMS Editable: `YES`
- Reason: optional because the frontend already has a fallback image
- Example Value: `/assets/graphics/mesh-glow.png`

### `latestArticles[].publishedAt`

- Field Name: `publishedAt`
- Type: `date`
- Required: `Yes`
- Default Value: `""`
- Validation: ISO date string in `YYYY-MM-DD` format
- Recommended Maximum Length: `10`
- CMS Editable: `YES`
- Reason: frontend formats and displays the published date
- Example Value: `2026-07-06`

### `latestArticles[].readTimeMinutes`

- Field Name: `readTimeMinutes`
- Type: `number`
- Required: `Yes`
- Default Value: `0`
- Validation: integer between `1` and `60`
- Recommended Maximum Length: `N/A`
- CMS Editable: `NO`
- Reason: should be derived from content or editorial tooling rather than typed manually
- Example Value: `8`

### `latestArticles[].tags`

- Field Name: `tags`
- Type: `array[string]`
- Required: `No`
- Default Value: `[]`
- Validation: if returned, unique trimmed strings
- Recommended Maximum Length: `20` per item
- CMS Editable: `YES`
- Reason: the current Home page does not render tags, so they are unnecessary in the Home response
- Example Value: `["AI", "RAG", "Embeddings"]`

## CTA Section

The current CTA section is static and should not come from backend right now.

### Current Static Values

- Eyebrow: `Contact`
- Title: `Let's Connect`
- Description: `Interested in working together, discussing a project, or exploring new opportunities? I'd love to hear from you.`
- Primary button: `Contact Me`
- Secondary button: `Schedule a Call`
- Both links: `/contact`

### Recommendation

- CMS Editable: `NO`
- Reason: this is stable navigation-oriented site copy, not content-heavy data

## Recommended JSON Structure

## Why Each Structure Is Recommended

### Hero

- Use an `object`
- Reason: the fields belong to one visual section and are always fetched together

### Headline and Highlighted Headline

- Use two `string` fields
- Reason: the frontend styles them differently in separate lines

### CTA Labels

- Use an `object`
- Reason: keeps related button labels grouped and makes future expansion straightforward

### Featured Projects

- Use an ordered `array`
- Reason: the Home page renders a ranked sequence and the index is used for the visible badge

### Skills Categories

- Use an ordered `array`
- Reason: display order matters visually and category cards are repeated

### Currently Learning

- Use an ordered `array`
- Reason: this section is a repeatable set of progress cards

### Blog Previews

- Use an ordered `array`
- Reason: Home shows the latest posts in a fixed preview grid

### Hero Image

- If added later, use an `object`, not just a string
- Reason: image assets should include both `src` and `alt`

### Resume Button

- If added later, use an `object`, not a boolean
- Reason: UI would need both the label and URL, not just visibility

### Status

- If added later, use an `object`
- Reason: status usually needs both a visible label and a tone or state value

## Recommended API Strategy

## Recommendation

Use one API:

`GET /api/home`

## Why One API Is Better For The Current Home Page

- The Home page always needs all of its sections together.
- The current page already waits for multiple async calls before rendering.
- A single aggregated payload reduces request overhead.
- It keeps homepage caching and CMS publishing simpler.
- The Home page does not need full domain models, only compact preview DTOs.

## Complete Recommended JSON Response

```json
{
  "hero": {
    "headline": "Building scalable software and intelligent",
    "highlightedHeadline": "digital experiences.",
    "subheadline": "Full-stack developer focused on AI-powered products, cloud-native systems, and polished user experiences that move cleanly from idea to production.",
    "cta": {
      "primaryLabel": "Explore Projects",
      "secondaryLabel": "Contact Me"
    }
  },
  "featuredProjects": [
    {
      "id": "qconnect",
      "slug": "qconnect",
      "title": "QConnect",
      "tagline": "Real-time support platform for connected teams",
      "shortDescription": "A production-style full-stack queue and support platform.",
      "thumbnailUrl": "/assets/graphics/mesh-glow.png",
      "techTags": ["Next.js", "TypeScript", "Node.js", "MongoDB"],
      "liveDemoUrl": "https://qconnect-demo.example.com",
      "githubUrl": "https://github.com/abishekk/qconnect"
    },
    {
      "id": "rag-assistant",
      "slug": "rag-assistant",
      "title": "RAG Assistant",
      "tagline": "Document-grounded AI answers with source-aware retrieval",
      "shortDescription": "An AI assistant prototype built around retrieval-augmented generation.",
      "thumbnailUrl": "/assets/graphics/grid.svg",
      "techTags": ["RAG", "OpenAI", "Vector DB", "Next.js"],
      "liveDemoUrl": "https://rag-assistant.example.com",
      "githubUrl": "https://github.com/abishekk/rag-assistant"
    },
    {
      "id": "aws-deployment-hub",
      "slug": "aws-deployment-hub",
      "title": "AWS Deployment Hub",
      "tagline": "Cloud deployment workflows with production observability",
      "shortDescription": "A cloud operations hub for deployments, logs, and environments.",
      "thumbnailUrl": "/assets/hero/skyline.png",
      "techTags": ["AWS", "Docker", "CI/CD", "Node.js"],
      "liveDemoUrl": "https://aws-deployment-hub.example.com",
      "githubUrl": "https://github.com/abishekk/aws-deployment-hub"
    }
  ],
  "skills": {
    "categories": [
      {
        "id": "frontend",
        "title": "Frontend",
        "items": ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Accessibility"]
      },
      {
        "id": "backend",
        "title": "Backend",
        "items": ["Node.js", "Express", "REST APIs", "MongoDB", "PostgreSQL", "Authentication"]
      },
      {
        "id": "ai-tools-cloud",
        "title": "AI / Tools / Cloud",
        "items": ["RAG", "OpenAI", "AWS", "Docker", "CI/CD", "Cloudinary"]
      }
    ]
  },
  "currentlyLearning": {
    "items": [
      { "label": "Advanced RAG", "icon": "Sparkles", "progressPercent": 78 },
      { "label": "AWS Architecture", "icon": "Cloud", "progressPercent": 68 },
      { "label": "System Design", "icon": "Network", "progressPercent": 72 }
    ]
  },
  "latestArticles": [
    {
      "slug": "deploying-qconnect-backend-on-aws-ec2",
      "title": "Deploying QConnect Backend on AWS EC2",
      "excerpt": "A practical deployment walkthrough for running a Node.js backend on EC2 with Nginx, PM2, environment variables, and a repeatable release checklist.",
      "category": "Projects",
      "coverImageUrl": "/assets/hero/skyline.png",
      "publishedAt": "2026-07-14",
      "readTimeMinutes": 9
    },
    {
      "slug": "understanding-rag-architecture",
      "title": "Understanding RAG Architecture",
      "excerpt": "A clear mental model for retrieval augmented generation, covering ingestion, embeddings, vector search, prompts, citations, and answer grounding.",
      "category": "AI",
      "coverImageUrl": "/assets/graphics/mesh-glow.png",
      "publishedAt": "2026-07-06",
      "readTimeMinutes": 8
    },
    {
      "slug": "aws-deployment-notes-and-resources",
      "title": "AWS Deployment Notes & Resources",
      "excerpt": "A curated deployment packet with checklists, diagrams, service notes, and references for moving full-stack projects onto AWS.",
      "category": "Resources",
      "coverImageUrl": "/assets/graphics/grid.svg",
      "publishedAt": "2026-06-28",
      "readTimeMinutes": 5
    }
  ]
}
```

## Fields That Should Not Come From Backend

These should remain frontend-owned for the current implementation:

- hero decorative backgrounds and local visual assets
- hero skyline image
- hero portrait image
- hero section badge text
- section eyebrows
- section titles
- `View all projects` button label and route
- `View all posts` button label and route
- project numeric badge `01`, `02`, `03`
- blog fallback cover image logic
- date formatting
- the final contact CTA content and routes
- skill card icons as component references
- the static `Learning Journey` card

## Frontend Improvements That Would Simplify The API

- Replace full `Project` usage on Home with a dedicated `FeaturedProjectCard` DTO.
- Replace current `Profile` usage on Home with a dedicated `HomeHero` DTO.
- Remove unused `tags` from the latest article preview response used on Home.
- Map skill icons by `id` or `iconKey`, not by category array index.
- Add a stable `id` to currently learning items instead of using `label` as the React key.
- Split `skills` and `currentlyLearning` into separate response sections even if they come from the same CMS collection.

## Final Recommendation

The Home page should consume one aggregated response optimized for preview content:

- compact
- cache-friendly
- CMS-safe
- UI-length-aware
- separate from full detail models used by project and blog detail pages

This keeps the backend contract aligned with what the frontend actually renders today, while leaving room for future CMS growth without overfetching.

# Projects Module API Analysis

This section analyzes the current Projects module implementation and defines the frontend-first API contract for the Projects Listing Page and Project Details Page.

It does not propose backend code, Express routes, MongoDB schemas, or storage implementation.

## Scope

The analysis is based on these files:

- [src/app/projects/page.tsx](/home/intellect/Desktop/Abishek_portfolio/src/app/projects/page.tsx:1)
- [src/app/projects/[slug]/page.tsx](/home/intellect/Desktop/Abishek_portfolio/src/app/projects/[slug]/page.tsx:1)
- [src/components/projects/ProjectsHero.tsx](/home/intellect/Desktop/Abishek_portfolio/src/components/projects/ProjectsHero.tsx:1)
- [src/components/projects/ProjectsPageClient.tsx](/home/intellect/Desktop/Abishek_portfolio/src/components/projects/ProjectsPageClient.tsx:1)
- [src/components/projects/ProjectsToolbar.tsx](/home/intellect/Desktop/Abishek_portfolio/src/components/projects/ProjectsToolbar.tsx:1)
- [src/components/projects/ProjectListItem.tsx](/home/intellect/Desktop/Abishek_portfolio/src/components/projects/ProjectListItem.tsx:1)
- [src/components/project-details/ProjectDetailSections.tsx](/home/intellect/Desktop/Abishek_portfolio/src/components/project-details/ProjectDetailSections.tsx:1)
- [src/components/project-details/ProjectQuickStats.tsx](/home/intellect/Desktop/Abishek_portfolio/src/components/project-details/ProjectQuickStats.tsx:1)
- [src/components/project-details/ProjectTabs.tsx](/home/intellect/Desktop/Abishek_portfolio/src/components/project-details/ProjectTabs.tsx:1)
- [src/components/project-details/ProjectStructureBlock.tsx](/home/intellect/Desktop/Abishek_portfolio/src/components/project-details/ProjectStructureBlock.tsx:1)
- [src/components/project-details/TechStackTable.tsx](/home/intellect/Desktop/Abishek_portfolio/src/components/project-details/TechStackTable.tsx:1)
- [src/hooks/useProjects.ts](/home/intellect/Desktop/Abishek_portfolio/src/hooks/useProjects.ts:1)
- [src/constants/categories.ts](/home/intellect/Desktop/Abishek_portfolio/src/constants/categories.ts:1)
- [src/constants/sort-options.ts](/home/intellect/Desktop/Abishek_portfolio/src/constants/sort-options.ts:1)
- [src/types/project.types.ts](/home/intellect/Desktop/Abishek_portfolio/src/types/project.types.ts:1)
- [src/services/project.service.ts](/home/intellect/Desktop/Abishek_portfolio/src/services/project.service.ts:1)

## Current Projects Module Data Sources

The Projects module currently uses:

- `getProjects({ pageSize: 4 })` for the Projects Listing hero preview stack
- `useProjects({ category, search, sort, pageSize: 5 })` for the paginated listing
- `getProjectBySlug(slug)` for the Project Details page
- `getRelatedProjects(slug)` for the Project Details related section

The listing page uses infinite loading with this response shape:

- `items`
- `nextPage`
- `hasNextPage`

## What The Current Projects Listing Page Actually Renders

### Projects Hero

Rendered dynamic values from the first 4 projects:

- `id`
- `thumbnailUrl`
- `title`
- `category`

Static values:

- eyebrow: `My Work`
- title: `Projects that solve real world problems.`
- description: `A focused catalog of full-stack, AI, cloud, frontend, backend, and learning projects.`

### Projects Toolbar

Dynamic API data needed:

- none

Frontend-owned filter values:

- categories: `All`, `AI`, `Full Stack`, `Cloud`, `Frontend`, `Backend`, `Learning`
- sort options: `newest`, `oldest`, `az`
- search input value

### Project List Item

Rendered dynamic values per project:

- `id`
- `slug`
- `thumbnailUrl`
- `status`
- `title`
- `tagline`
- `description`
- `techTags`
- `highlights`
- `liveDemoUrl`
- `githubUrl`

Not rendered on the listing item even though the full type contains them:

- `shortDescription`
- `caseStudyUrl`
- `durationLabel`
- `role`
- `lastUpdatedAt`
- `techIcons`
- `readmeMarkdown`
- `projectStructure`
- `techStackTable`
- `gallery`
- `architectureNotes`
- `challenges`
- `solutions`
- `learningOutcomes`
- `architectureDiagramUrl`
- `previousProject`
- `nextProject`

## Project Listing Query Contract

### `category`

- Field Name: `category`
- Type: `string`
- Required: `No`
- Default Value: `All`
- Validation: enum values `All`, `AI`, `Full Stack`, `Cloud`, `Frontend`, `Backend`, `Learning`
- Recommended Maximum Length: `20`
- CMS Editable: `NO`
- Reason: frontend-owned filter state using fixed category constants
- Example Value: `Cloud`

### `search`

- Field Name: `search`
- Type: `string`
- Required: `No`
- Default Value: `""`
- Validation: trimmed, maximum 80 characters
- Recommended Maximum Length: `80`
- CMS Editable: `NO`
- Reason: user-entered search term, debounced by frontend before querying
- Example Value: `aws`

### `sort`

- Field Name: `sort`
- Type: `string`
- Required: `No`
- Default Value: `newest`
- Validation: enum values `newest`, `oldest`, `az`
- Recommended Maximum Length: `10`
- CMS Editable: `NO`
- Reason: frontend-owned sort state using fixed sort constants
- Example Value: `newest`

### `page`

- Field Name: `page`
- Type: `number`
- Required: `No`
- Default Value: `1`
- Validation: integer, minimum `1`
- Recommended Maximum Length: `N/A`
- CMS Editable: `NO`
- Reason: pagination control for infinite loading
- Example Value: `2`

### `pageSize`

- Field Name: `pageSize`
- Type: `number`
- Required: `No`
- Default Value: `5`
- Validation: integer, minimum `1`, maximum `20`
- Recommended Maximum Length: `N/A`
- CMS Editable: `NO`
- Reason: listing page requests `5`; hero preview requests `4`
- Example Value: `5`

### `featured`

- Field Name: `featured`
- Type: `boolean`
- Required: `No`
- Default Value: `false`
- Validation: boolean
- Recommended Maximum Length: `N/A`
- CMS Editable: `NO`
- Reason: supported by the existing service for Home, but not directly used by the Projects Listing page
- Example Value: `true`

### `limit`

- Field Name: `limit`
- Type: `number`
- Required: `No`
- Default Value: `3`
- Validation: integer, minimum `1`, maximum `12`
- Recommended Maximum Length: `N/A`
- CMS Editable: `NO`
- Reason: supported by the existing service for featured project calls
- Example Value: `3`

## Project List Response Contract

### `items`

- Field Name: `items`
- Type: `array[ProjectListItem]`
- Required: `Yes`
- Default Value: `[]`
- Validation: array length should respect `pageSize`
- Recommended Maximum Length: `5` items per listing page request
- CMS Editable: `NO`
- Reason: paginated project list rendered by `ProjectsPageClient`
- Example Value: `[{ "id": "qconnect", "slug": "qconnect" }]`

### `hasNextPage`

- Field Name: `hasNextPage`
- Type: `boolean`
- Required: `Yes`
- Default Value: `false`
- Validation: boolean
- Recommended Maximum Length: `N/A`
- CMS Editable: `NO`
- Reason: controls infinite-scroll loading and end-of-list state
- Example Value: `true`

### `nextPage`

- Field Name: `nextPage`
- Type: `number`
- Required: `No`
- Default Value: `null`
- Validation: integer greater than current page when present
- Recommended Maximum Length: `N/A`
- CMS Editable: `NO`
- Reason: used by React Query to fetch the next page
- Example Value: `2`

## Project List Item Fields

Home featured cards and Projects listing cards should not use the same DTO. The Projects listing card renders more information than the Home featured card.

### `projects[].id`

- Field Name: `id`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: unique, stable identifier
- Recommended Maximum Length: `40`
- CMS Editable: `NO`
- Reason: React key and stable identity
- Example Value: `qconnect`

### `projects[].slug`

- Field Name: `slug`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: unique, lowercase slug, regex `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- Recommended Maximum Length: `80`
- CMS Editable: `YES`
- Reason: builds `/projects/[slug]` navigation
- Example Value: `qconnect`

### `projects[].thumbnailUrl`

- Field Name: `thumbnailUrl`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: valid absolute HTTPS URL or site-relative asset path; allowed formats `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.svg`
- Recommended Maximum Length: `200`
- CMS Editable: `YES`
- Reason: list card thumbnail and listing hero stacked preview
- Example Value: `/assets/graphics/mesh-glow.png`

### `projects[].status`

- Field Name: `status`
- Type: `string`
- Required: `Yes`
- Default Value: `completed`
- Validation: enum values `production`, `in-progress`, `completed`
- Recommended Maximum Length: `20`
- CMS Editable: `YES`
- Reason: rendered by the status badge
- Example Value: `production`

### `projects[].category`

- Field Name: `category`
- Type: `string`
- Required: `Yes`
- Default Value: `Learning`
- Validation: enum values `AI`, `Full Stack`, `Cloud`, `Frontend`, `Backend`, `Learning`
- Recommended Maximum Length: `20`
- CMS Editable: `YES`
- Reason: rendered in the Projects hero preview cards and used for filtering
- Example Value: `Full Stack`

### `projects[].title`

- Field Name: `title`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 3 characters, maximum 48 characters
- Recommended Maximum Length: `48`
- CMS Editable: `YES`
- Reason: primary card heading and hero preview title
- Example Value: `QConnect`

### `projects[].tagline`

- Field Name: `tagline`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 10 characters, maximum 70 characters
- Recommended Maximum Length: `70`
- CMS Editable: `YES`
- Reason: gold subheading in the listing item
- Example Value: `Real-time support platform for connected teams`

### `projects[].description`

- Field Name: `description`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 40 characters, maximum 220 characters
- Recommended Maximum Length: `220`
- CMS Editable: `YES`
- Reason: main project list card paragraph and detail hero paragraph
- Example Value: `QConnect brings queue management, team handoff, and operational dashboards into one responsive product experience.`

### `projects[].techTags`

- Field Name: `techTags`
- Type: `array[string]`
- Required: `Yes`
- Default Value: `[]`
- Validation: 1 to 8 unique trimmed strings
- Recommended Maximum Length: `20` per item
- CMS Editable: `YES`
- Reason: rendered as tag pills on the list item
- Example Value: `["Next.js", "TypeScript", "Node.js", "MongoDB"]`

### `projects[].highlights`

- Field Name: `highlights`
- Type: `array[string]`
- Required: `Yes`
- Default Value: `[]`
- Validation: 1 to 4 unique trimmed strings
- Recommended Maximum Length: `70` per item
- CMS Editable: `YES`
- Reason: rendered as checklist bullets in the project list item
- Example Value: `["Live queue tracking", "Role-aware dashboards", "Realtime ticket updates"]`

### `projects[].liveDemoUrl`

- Field Name: `liveDemoUrl`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: valid absolute HTTPS URL
- Recommended Maximum Length: `200`
- CMS Editable: `YES`
- Reason: Live Demo button always renders on listing and detail pages
- Example Value: `https://qconnect-demo.example.com`

### `projects[].githubUrl`

- Field Name: `githubUrl`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: valid absolute HTTPS URL
- Recommended Maximum Length: `200`
- CMS Editable: `YES`
- Reason: GitHub button always renders on listing and detail sidebar
- Example Value: `https://github.com/abishekk/qconnect`

### `projects[].orderIndex`

- Field Name: `orderIndex`
- Type: `number`
- Required: `Yes`
- Default Value: `0`
- Validation: integer, minimum `0`, unique or stable within ordered project list
- Recommended Maximum Length: `N/A`
- CMS Editable: `YES`
- Reason: current mock filtering and sorting uses this value for newest/oldest ordering
- Example Value: `1`

## Project Details Page Data Requirements

The details page currently expects one full project object plus related project cards.

## Project Header

Rendered dynamic values:

- `title`
- `description`
- `status`
- `liveDemoUrl`

Static values:

- back link label
- eyebrow: `Project`
- `Live URL` label
- `Live Demo` button label
- `Ask Project AI` button label
- Ask Project AI suggested questions

### Recommended Header Structure

Use a `header` object inside the detail response if creating a clean API DTO, but map it from existing project fields:

```json
{
  "header": {
    "title": "QConnect",
    "description": "QConnect brings queue management, team handoff, and operational dashboards into one responsive product experience.",
    "status": "production",
    "liveDemoUrl": "https://qconnect-demo.example.com"
  }
}
```

Reason:

- The current UI treats these values as one visual header group.
- `status` should be an enum, not free text, because badge color depends on known status values.
- `liveDemoUrl` should remain separate from project links because it appears in both text and button form.

## Project Quick Stats

Rendered dynamic values:

- `status`
- `durationLabel`
- `role`
- `lastUpdatedAt`
- `techIcons`

### `project.durationLabel`

- Field Name: `durationLabel`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 2 characters, maximum 24 characters
- Recommended Maximum Length: `24`
- CMS Editable: `YES`
- Reason: compact value in a stats card
- Example Value: `3 Months`

### `project.role`

- Field Name: `role`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 3 characters, maximum 35 characters
- Recommended Maximum Length: `35`
- CMS Editable: `YES`
- Reason: compact role value in a stats card
- Example Value: `Full Stack Developer`

### `project.lastUpdatedAt`

- Field Name: `lastUpdatedAt`
- Type: `date`
- Required: `Yes`
- Default Value: `""`
- Validation: ISO date string in `YYYY-MM-DD` format
- Recommended Maximum Length: `10`
- CMS Editable: `YES`
- Reason: formatted by frontend in the quick stats row
- Example Value: `2026-06-12`

### `project.techIcons`

- Field Name: `techIcons`
- Type: `array[string]`
- Required: `Yes`
- Default Value: `[]`
- Validation: 1 to 5 short strings
- Recommended Maximum Length: `8` per item
- CMS Editable: `YES`
- Reason: displayed as a compact `A / B / C` technologies value
- Example Value: `["Next", "TS", "Node", "DB"]`

## Project Tabs

The details page has three tabs:

- `README`
- `Screenshots`
- `Case Study`

Tab labels are static and should not come from backend.

## README Tab

Rendered dynamic values:

- `readmeMarkdown`
- `techStackTable`
- `projectStructure`

### `project.readmeMarkdown`

- Field Name: `readmeMarkdown`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: markdown string; should include `##` headings because the frontend splits content by `\n## `
- Recommended Maximum Length: `8000`
- CMS Editable: `YES`
- Reason: rendered into multiple overview sections using `react-markdown`
- Example Value: `## Overview\nQConnect is built as a production-minded portfolio project...`

### `project.techStackTable`

- Field Name: `techStackTable`
- Type: `array[object]`
- Required: `Yes`
- Default Value: `[]`
- Validation: 1 to 8 rows; each row requires `category` and `technologies`
- Recommended Maximum Length: `24` for category, `120` for technologies
- CMS Editable: `YES`
- Reason: rendered by `TechStackTable`
- Example Value: `[{ "category": "Frontend", "technologies": "Next.js, React, TypeScript, Tailwind CSS" }]`

### `project.techStackTable[].category`

- Field Name: `category`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 2 characters, maximum 24 characters
- Recommended Maximum Length: `24`
- CMS Editable: `YES`
- Reason: first table column
- Example Value: `Frontend`

### `project.techStackTable[].technologies`

- Field Name: `technologies`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 2 characters, maximum 120 characters
- Recommended Maximum Length: `120`
- CMS Editable: `YES`
- Reason: second table column
- Example Value: `Next.js, React, TypeScript, Tailwind CSS`

### `project.projectStructure`

- Field Name: `projectStructure`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: plain text tree or code-style block, maximum 5000 characters
- Recommended Maximum Length: `5000`
- CMS Editable: `YES`
- Reason: rendered in a monospace copyable code block
- Example Value: `qconnect/\n  app/\n  components/\n  services/\n  README.md`

## Screenshots Tab

Rendered dynamic values:

- `gallery[].url`
- `gallery[].caption`

### `project.gallery`

- Field Name: `gallery`
- Type: `array[object]`
- Required: `No`
- Default Value: `[]`
- Validation: 0 to 12 images
- Recommended Maximum Length: `12` images
- CMS Editable: `YES`
- Reason: rendered as screenshot grid and lightbox; empty array shows an empty state
- Example Value: `[{ "url": "/assets/graphics/mesh-glow.png", "caption": "Dashboard overview" }]`

### `project.gallery[].url`

- Field Name: `url`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: valid absolute HTTPS URL or site-relative asset path; allowed formats `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.svg`
- Recommended Maximum Length: `200`
- CMS Editable: `YES`
- Reason: rendered by `next/image` in grid and lightbox
- Example Value: `/assets/graphics/mesh-glow.png`

### `project.gallery[].caption`

- Field Name: `caption`
- Type: `string`
- Required: `No`
- Default Value: `""`
- Validation: trimmed, maximum 80 characters
- Recommended Maximum Length: `80`
- CMS Editable: `YES`
- Reason: used as fallback alt text in screenshot images
- Example Value: `Dashboard overview`

## Case Study Tab

Rendered dynamic values:

- `architectureNotes`
- `challenges`
- `solutions`
- `learningOutcomes`

### `project.architectureNotes`

- Field Name: `architectureNotes`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 40 characters, maximum 700 characters
- Recommended Maximum Length: `700`
- CMS Editable: `YES`
- Reason: rendered as the Architecture case-study paragraph
- Example Value: `A modular service layer keeps operational workflows separate from presentation state.`

### `project.challenges`

- Field Name: `challenges`
- Type: `array[string]`
- Required: `Yes`
- Default Value: `[]`
- Validation: 1 to 6 items, each trimmed
- Recommended Maximum Length: `120` per item
- CMS Editable: `YES`
- Reason: rendered as the Challenges case-study list
- Example Value: `["Keeping queue state predictable", "Designing dense dashboards for fast scanning"]`

### `project.solutions`

- Field Name: `solutions`
- Type: `array[string]`
- Required: `Yes`
- Default Value: `[]`
- Validation: 1 to 6 items, each trimmed
- Recommended Maximum Length: `120` per item
- CMS Editable: `YES`
- Reason: rendered as the Solutions case-study list
- Example Value: `["Normalized API payloads", "Compact cards and clear status badges"]`

### `project.learningOutcomes`

- Field Name: `learningOutcomes`
- Type: `array[string]`
- Required: `Yes`
- Default Value: `[]`
- Validation: 1 to 6 items, each trimmed
- Recommended Maximum Length: `120` per item
- CMS Editable: `YES`
- Reason: rendered as the Learning Outcomes case-study list
- Example Value: `["Improved realtime UX planning", "Sharper data modeling for support workflows"]`

## Project Sidebar

Rendered dynamic values:

- `liveDemoUrl`
- `githubUrl`

Static values:

- `On this page` heading
- sidebar anchor labels
- `Project Links` heading
- `Live Demo` label
- `GitHub Repository` label

The `On this page` nav anchors are static today and should not come from backend unless the README/case-study renderer is redesigned to generate anchors dynamically.

## Related Projects

The current related section renders each related project through `FeaturedProjectCard`, which means it needs the Home featured project card fields:

- `id`
- `slug`
- `thumbnailUrl`
- `title`
- `tagline`
- `shortDescription`
- `techTags`
- `liveDemoUrl`
- `githubUrl`

Recommendation:

- Return related projects as compact card DTOs, not full project detail objects.
- Limit related projects to 3 because the layout is a 3-column grid.

## Previous And Next Project Navigation

Rendered dynamic values:

- `previousProject.slug`
- `previousProject.title`
- `nextProject.slug`
- `nextProject.title`

### `project.previousProject`

- Field Name: `previousProject`
- Type: `object | null`
- Required: `No`
- Default Value: `null`
- Validation: when present, must include `slug` and `title`
- Recommended Maximum Length: `80` for slug, `48` for title
- CMS Editable: `NO`
- Reason: navigation should be generated from project order, not manually edited
- Example Value: `{ "slug": "rag-assistant", "title": "RAG Assistant" }`

### `project.nextProject`

- Field Name: `nextProject`
- Type: `object | null`
- Required: `No`
- Default Value: `null`
- Validation: when present, must include `slug` and `title`
- Recommended Maximum Length: `80` for slug, `48` for title
- CMS Editable: `NO`
- Reason: navigation should be generated from project order, not manually edited
- Example Value: `{ "slug": "aws-deployment-hub", "title": "AWS Deployment Hub" }`

## Project Media Analysis

The frontend currently displays project media through URLs only.

Current media fields:

- `thumbnailUrl`
- `gallery[].url`
- `architectureDiagramUrl`

Currently rendered:

- `thumbnailUrl`
- `gallery[].url`

Currently defined but not rendered:

- `architectureDiagramUrl`

There is no current frontend support for:

- videos
- downloadable documents
- multiple hero images
- binary uploads in API payloads

## Recommended Media Architecture

Media should be URL-based only.

Recommended structure for the current frontend:

```json
{
  "media": {
    "thumbnail": {
      "url": "/assets/graphics/mesh-glow.png",
      "alt": "QConnect project thumbnail"
    },
    "gallery": [
      {
        "url": "/assets/graphics/mesh-glow.png",
        "alt": "Dashboard overview",
        "caption": "Dashboard overview"
      }
    ],
    "architectureDiagram": {
      "url": "/assets/graphics/grid.svg",
      "alt": "QConnect architecture diagram"
    }
  }
}
```

Reason:

- `url` keeps the API storage-agnostic.
- `alt` should be added because the current frontend has weak alt handling for gallery images.
- `caption` remains optional because the current UI already handles missing captions.
- `architectureDiagram` should remain optional until a UI section renders it.

## Hero Image Design

The current Project Details hero does not render four images. It renders no image grid in the detail hero.

The Projects Listing hero renders up to four project preview cards using the first four project thumbnails.

For the current implementation, the best structure is not a named four-image object. Use an ordered array of project preview cards.

Recommended structure:

```json
{
  "heroPreviewProjects": [
    {
      "id": "qconnect",
      "title": "QConnect",
      "category": "Full Stack",
      "thumbnailUrl": "/assets/graphics/mesh-glow.png"
    }
  ]
}
```

Reason:

- The current hero can render fewer than 4 previews without breaking.
- Order matters because the layout positions cards by index.
- The source images are project thumbnails, not independent hero art.
- An array is easier to reorder from CMS or backend sorting.
- Named fields like `cover`, `desktop`, `mobile`, and `dashboard` do not match the current UI.

### Hero Preview Media Rules

- Minimum images: `0`
- Recommended minimum: `3`
- Maximum images used by current UI: `4`
- Recommended maximum returned: `4`
- Recommended aspect ratio: `16:10`
- Allowed formats: `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.svg`
- Delivery: URL only

## Recommended API Strategy

Use multiple Projects APIs because the listing and detail pages have different data needs.

Recommended frontend contracts:

- `GET /api/projects`
- `GET /api/projects/:slug`
- `GET /api/projects/:slug/related`

Reason:

- Listing cards do not need README markdown, project structure, tables, gallery, case-study notes, or previous/next data.
- Detail pages need a much larger object.
- Related projects should use compact cards to avoid overfetching.
- The current frontend already separates `getProjects`, `getProjectBySlug`, and `getRelatedProjects`.

## Complete Recommended Project List Response

```json
{
  "items": [
    {
      "id": "qconnect",
      "slug": "qconnect",
      "orderIndex": 1,
      "title": "QConnect",
      "tagline": "Real-time support platform for connected teams",
      "description": "QConnect brings queue management, team handoff, and operational dashboards into one responsive product experience.",
      "status": "production",
      "category": "Full Stack",
      "thumbnailUrl": "/assets/graphics/mesh-glow.png",
      "techTags": ["Next.js", "TypeScript", "Node.js", "MongoDB"],
      "highlights": ["Live queue tracking", "Role-aware dashboards", "Realtime ticket updates"],
      "liveDemoUrl": "https://qconnect-demo.example.com",
      "githubUrl": "https://github.com/abishekk/qconnect"
    }
  ],
  "hasNextPage": true,
  "nextPage": 2
}
```

## Complete Recommended Project Detail Response

```json
{
  "id": "qconnect",
  "slug": "qconnect",
  "orderIndex": 1,
  "title": "QConnect",
  "tagline": "Real-time support platform for connected teams",
  "shortDescription": "A production-style full-stack queue and support platform.",
  "description": "QConnect brings queue management, team handoff, and operational dashboards into one responsive product experience.",
  "status": "production",
  "category": "Full Stack",
  "thumbnailUrl": "/assets/graphics/mesh-glow.png",
  "techTags": ["Next.js", "TypeScript", "Node.js", "MongoDB"],
  "highlights": ["Live queue tracking", "Role-aware dashboards", "Realtime ticket updates"],
  "liveDemoUrl": "https://qconnect-demo.example.com",
  "githubUrl": "https://github.com/abishekk/qconnect",
  "durationLabel": "3 Months",
  "role": "Full Stack Developer",
  "lastUpdatedAt": "2026-06-12",
  "techIcons": ["Next", "TS", "Node", "DB"],
  "readmeMarkdown": "## Overview\nQConnect is built as a production-minded portfolio project with clear architecture.\n\n## Key Features\n- Typed API boundaries\n- Responsive user interface",
  "projectStructure": "qconnect/\n  app/\n  components/\n  services/\n  README.md",
  "techStackTable": [
    {
      "category": "Frontend",
      "technologies": "Next.js, React, TypeScript, Tailwind CSS"
    },
    {
      "category": "Backend",
      "technologies": "Node.js, Express, REST APIs"
    }
  ],
  "gallery": [
    {
      "url": "/assets/graphics/mesh-glow.png",
      "caption": "Dashboard overview"
    }
  ],
  "architectureNotes": "A modular service layer keeps operational workflows separate from presentation state.",
  "challenges": ["Keeping queue state predictable", "Designing dense dashboards for fast scanning"],
  "solutions": ["Normalized API payloads", "Compact cards and clear status badges"],
  "learningOutcomes": ["Improved realtime UX planning", "Sharper data modeling for support workflows"],
  "architectureDiagramUrl": null,
  "previousProject": null,
  "nextProject": {
    "slug": "rag-assistant",
    "title": "RAG Assistant"
  }
}
```

## Complete Recommended Related Projects Response

```json
[
  {
    "id": "rag-assistant",
    "slug": "rag-assistant",
    "title": "RAG Assistant",
    "tagline": "Document-grounded AI answers with source-aware retrieval",
    "shortDescription": "An AI assistant prototype built around retrieval-augmented generation.",
    "thumbnailUrl": "/assets/graphics/grid.svg",
    "techTags": ["RAG", "OpenAI", "Vector DB", "Next.js"],
    "liveDemoUrl": "https://rag-assistant.example.com",
    "githubUrl": "https://github.com/abishekk/rag-assistant"
  }
]
```

## Fields That Should Not Come From Backend

These should remain frontend-owned for the current Projects implementation:

- Projects page hero eyebrow, title, and description
- toolbar category labels
- toolbar sort labels
- search placeholder text
- empty state copy
- error state copy
- loading skeleton layout
- end-of-list copy
- tab labels
- `On this page` sidebar labels and anchors
- `Project Links` heading
- `Live Demo`, `GitHub Repository`, and `Explore Project` button labels
- `Ask Project AI` suggested questions and placeholder
- lightbox interaction state
- card rotation, positioning, hover, and animation values
- date formatting
- badge display labels derived from `status`

## Frontend Improvements That Would Simplify The API

- Create separate TypeScript DTOs for `ProjectListItem`, `ProjectDetail`, `ProjectRelatedCard`, and `ProjectHeroPreview`.
- Stop passing the full `Project` type into listing components.
- Add `alt` to project thumbnail and gallery image data.
- Make project link fields optional in the frontend if drafts may not have live URLs yet.
- Replace `techIcons` with a clearer `quickTechLabels` field because the current UI renders text, not actual icons.
- Generate the `On this page` nav from rendered README and case-study sections if the content becomes CMS-driven.
- Consider replacing `readmeMarkdown` splitting by `\n## ` with structured content blocks later, similar to the Blog article block renderer.

## Final Recommendation

The Projects module should use separate response shapes for list, detail, hero preview, and related cards.

This keeps the listing page fast, keeps the detail page complete, and avoids forcing every project card to download long markdown, gallery arrays, project structure text, and case-study content it does not render.

# Blog Module API Analysis

This section analyzes the current Blog module implementation and defines the frontend-first API contract for the Blog Listing Page and Blog Details Page.

It does not propose backend code, Express routes, MongoDB schemas, or storage implementation.

## Scope

The analysis is based on these files:

- [src/app/blog/page.tsx](/home/intellect/Desktop/Abishek_portfolio/src/app/blog/page.tsx:1)
- [src/app/blog/[slug]/page.tsx](/home/intellect/Desktop/Abishek_portfolio/src/app/blog/[slug]/page.tsx:1)
- [src/components/blog/BlogIndexClient.tsx](/home/intellect/Desktop/Abishek_portfolio/src/components/blog/BlogIndexClient.tsx:1)
- [src/components/blog/BlogDetailSections.tsx](/home/intellect/Desktop/Abishek_portfolio/src/components/blog/BlogDetailSections.tsx:1)
- [src/components/blog/ArticleRenderer.tsx](/home/intellect/Desktop/Abishek_portfolio/src/components/blog/ArticleRenderer.tsx:1)
- [src/components/blog/BlogSidebar.tsx](/home/intellect/Desktop/Abishek_portfolio/src/components/blog/BlogSidebar.tsx:1)
- [src/types/blog.types.ts](/home/intellect/Desktop/Abishek_portfolio/src/types/blog.types.ts:1)
- [src/services/blog.service.ts](/home/intellect/Desktop/Abishek_portfolio/src/services/blog.service.ts:1)

## Current Blog Module Data Sources

The Blog module currently uses:

- `getAllBlogPosts()` for the Blog Listing grid
- `getFeaturedBlogPost()` for the Featured Post card
- `getBlogPostBySlug(slug)` for the Blog Details page
- `getRelatedBlogPosts(slug)` for the Blog Details sidebar
- `getPreviousNextBlogPosts(slug)` for previous and next article navigation

The Blog page currently receives full `Article` objects on the listing page, even though the cards only need preview fields.

## What The Current Blog Listing Page Actually Renders

### Blog Hero

Dynamic API data needed:

- none

Static values:

- eyebrow: `Blog`
- title: `Developer Journal`
- description
- stats: `12 Posts`, `5 Categories`
- focus label: `AI • AWS • Full Stack`

### Search And Filters

Dynamic API data needed:

- none

Frontend-owned values:

- search input state
- active filter state
- filter labels: `All`, `Articles`, `Projects`, `Videos`, `Resources`, `AI`, `AWS`, `Backend`, `Frontend`, `React`

Current behavior:

- search is UI-only
- filters are UI-only
- no backend filtering or pagination is currently implemented

### Featured Article

Rendered dynamic values:

- `slug`
- `coverImageUrl`
- `category`
- `title`
- `excerpt`
- `publishedAt`
- `readTimeMinutes`
- `tags`

### Article Cards

Rendered dynamic values:

- `slug`
- `coverImageUrl`
- `category`
- `title`
- `excerpt`
- `publishedAt`
- `readTimeMinutes`
- `tags`

Not rendered on listing cards even though the full `Article` type contains them:

- `id`
- `updatedAt`
- `author`
- `blocks`

## Blog Listing Field Contract

### `articles[].slug`

- Field Name: `slug`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: unique, lowercase slug, regex `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- Recommended Maximum Length: `100`
- CMS Editable: `YES`
- Reason: builds `/blog/[slug]` links
- Example Value: `understanding-rag-architecture`

### `articles[].title`

- Field Name: `title`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 8 characters, maximum 72 characters
- Recommended Maximum Length: `72`
- CMS Editable: `YES`
- Reason: visible heading in featured and grid cards
- Example Value: `Understanding RAG Architecture`

### `articles[].excerpt`

- Field Name: `excerpt`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 40 characters, maximum 180 characters
- Recommended Maximum Length: `180`
- CMS Editable: `YES`
- Reason: visible description in featured and grid cards
- Example Value: `A clear mental model for retrieval augmented generation, covering ingestion, embeddings, vector search, prompts, citations, and answer grounding.`

### `articles[].category`

- Field Name: `category`
- Type: `string`
- Required: `Yes`
- Default Value: `Articles`
- Validation: trimmed, recommended enum values `Articles`, `Projects`, `Videos`, `Resources`, `AI`, `AWS`, `Backend`, `Frontend`, `React`
- Recommended Maximum Length: `20`
- CMS Editable: `YES`
- Reason: rendered as the gold category badge
- Example Value: `AI`

### `articles[].coverImageUrl`

- Field Name: `coverImageUrl`
- Type: `string`
- Required: `No`
- Default Value: `""`
- Validation: valid absolute HTTPS URL or site-relative asset path; allowed formats `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.svg`
- Recommended Maximum Length: `200`
- CMS Editable: `YES`
- Reason: listing cards use a fallback if no cover exists
- Example Value: `/assets/graphics/mesh-glow.png`

### `articles[].publishedAt`

- Field Name: `publishedAt`
- Type: `date`
- Required: `Yes`
- Default Value: `""`
- Validation: ISO date string in `YYYY-MM-DD` format
- Recommended Maximum Length: `10`
- CMS Editable: `YES`
- Reason: displayed in card metadata after frontend formatting
- Example Value: `2026-07-06`

### `articles[].readTimeMinutes`

- Field Name: `readTimeMinutes`
- Type: `number`
- Required: `Yes`
- Default Value: `1`
- Validation: integer between `1` and `60`
- Recommended Maximum Length: `N/A`
- CMS Editable: `NO`
- Reason: displayed in metadata; should ideally be computed from content
- Example Value: `8`

### `articles[].tags`

- Field Name: `tags`
- Type: `array[string]`
- Required: `Yes`
- Default Value: `[]`
- Validation: 0 to 8 unique trimmed strings
- Recommended Maximum Length: `20` per tag
- CMS Editable: `YES`
- Reason: listing cards render up to 4 tags
- Example Value: `["AI", "RAG", "Embeddings", "LLMs"]`

### `featuredArticle`

- Field Name: `featuredArticle`
- Type: `ArticlePreview`
- Required: `Yes`
- Default Value: `null`
- Validation: must include the same fields as listing article previews
- Recommended Maximum Length: `1` item
- CMS Editable: `YES`
- Reason: the listing page renders a dedicated featured card
- Example Value: `{ "slug": "deploying-qconnect-backend-on-aws-ec2", "title": "Deploying QConnect Backend on AWS EC2" }`

## Blog Details Page Data Requirements

The Blog Details page currently expects:

- one full article object
- two related articles in the sidebar
- previous article
- next article

## Blog Details Header

Rendered dynamic values:

- `category`
- `title`
- `excerpt`
- `coverImageUrl`

Static values:

- back link label
- cover image overlay

### `article.id`

- Field Name: `id`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: unique stable identifier
- Recommended Maximum Length: `50`
- CMS Editable: `NO`
- Reason: internal identity for CMS and rendering
- Example Value: `article-002`

### `article.updatedAt`

- Field Name: `updatedAt`
- Type: `date`
- Required: `Yes`
- Default Value: `""`
- Validation: ISO date string in `YYYY-MM-DD` format; should be greater than or equal to `publishedAt`
- Recommended Maximum Length: `10`
- CMS Editable: `YES`
- Reason: displayed in the article sidebar metadata
- Example Value: `2026-07-10`

### `article.author`

- Field Name: `author`
- Type: `string`
- Required: `Yes`
- Default Value: `Abishek Krishnamoorthy`
- Validation: trimmed, minimum 2 characters, maximum 60 characters
- Recommended Maximum Length: `60`
- CMS Editable: `YES`
- Reason: metadata component exists and the type requires it, even though current detail layout does not render `BlogMetadata`
- Example Value: `Abishek Krishnamoorthy`

### `article.blocks`

- Field Name: `blocks`
- Type: `array[ArticleBlock]`
- Required: `Yes`
- Default Value: `[]`
- Validation: ordered array; every block requires a unique `id` and valid `type`
- Recommended Maximum Length: `80` blocks
- CMS Editable: `YES`
- Reason: rendered sequentially by the shared article renderer
- Example Value: `[{ "id": "intro", "type": "paragraph", "text": "..." }]`

## Content Blocks

The frontend renderer is already built around a scalable mixed-block architecture. Blocks should be an ordered array of discriminated objects.

Recommended structure:

```json
{
  "blocks": [
    {
      "id": "intro",
      "type": "heading",
      "level": 2,
      "text": "Deployment goal"
    },
    {
      "id": "intro-copy",
      "type": "paragraph",
      "text": "QConnect needed a backend deployment path that was easy to repeat."
    }
  ]
}
```

Reason:

- the current renderer displays blocks in exact array order
- every block type can appear multiple times
- mixed content has no fixed order
- this can be shared by CMS preview and published article rendering

### Shared Block Fields

### `blocks[].id`

- Field Name: `id`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: unique within article
- Recommended Maximum Length: `60`
- CMS Editable: `NO`
- Reason: React key and stable block identity
- Example Value: `qconnect-code`

### `blocks[].type`

- Field Name: `type`
- Type: `string`
- Required: `Yes`
- Default Value: `paragraph`
- Validation: enum values `heading`, `paragraph`, `image`, `gallery`, `video`, `code`, `quote`, `divider`, `callout`, `table`, `bullet-list`, `numbered-list`, `checklist`, `pdf`, `docx`, `ppt`, `zip`, `github-link`, `live-demo`, `documentation`, `research-paper`, `youtube`, `google-drive`, `button`, `markdown`
- Recommended Maximum Length: `30`
- CMS Editable: `YES`
- Reason: determines which React block component renders
- Example Value: `code`

## Block-Specific Field Contract

### Heading Block

- Field Name: `level`
- Type: `number`
- Required: `Yes`
- Default Value: `2`
- Validation: enum values `2`, `3`, `4`
- Recommended Maximum Length: `N/A`
- CMS Editable: `YES`
- Reason: determines heading size
- Example Value: `2`

- Field Name: `text`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 3 characters, maximum 90 characters
- Recommended Maximum Length: `90`
- CMS Editable: `YES`
- Reason: visible heading text
- Example Value: `Deployment goal`

### Paragraph Block

- Field Name: `text`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 20 characters, maximum 900 characters
- Recommended Maximum Length: `900`
- CMS Editable: `YES`
- Reason: rendered as article body copy
- Example Value: `QConnect needed a backend deployment path that was easy to repeat, inspect, and explain during demos.`

### Image Block

- Field Name: `src`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: valid image URL; allowed formats `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.svg`
- Recommended Maximum Length: `200`
- CMS Editable: `YES`
- Reason: rendered as a lightbox-enabled image
- Example Value: `/assets/hero/skyline.png`

- Field Name: `alt`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 5 characters, maximum 140 characters
- Recommended Maximum Length: `140`
- CMS Editable: `YES`
- Reason: required for accessible image rendering
- Example Value: `Dark skyline used as a deployment cover`

- Field Name: `caption`
- Type: `string`
- Required: `No`
- Default Value: `""`
- Validation: trimmed, maximum 140 characters
- Recommended Maximum Length: `140`
- CMS Editable: `YES`
- Reason: optional visible caption below image
- Example Value: `A lightweight cloud deployment path for portfolio-grade backend projects.`

### Gallery Block

- Field Name: `images`
- Type: `array[object]`
- Required: `Yes`
- Default Value: `[]`
- Validation: 1 to 9 images; each image requires `src` and `alt`
- Recommended Maximum Length: `9` images
- CMS Editable: `YES`
- Reason: rendered as responsive image grid with lightbox
- Example Value: `[{ "src": "/assets/graphics/grid.svg", "alt": "Grid graphic", "caption": "Render boundaries" }]`

### Video Block

- Field Name: `provider`
- Type: `string`
- Required: `Yes`
- Default Value: `youtube`
- Validation: enum values `youtube`, `uploaded`
- Recommended Maximum Length: `20`
- CMS Editable: `YES`
- Reason: determines iframe or native video rendering
- Example Value: `youtube`

- Field Name: `src`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: valid YouTube embed URL for `youtube`; valid video URL for `uploaded`
- Recommended Maximum Length: `300`
- CMS Editable: `YES`
- Reason: rendered as video source
- Example Value: `https://www.youtube.com/embed/dQw4w9WgXcQ`

- Field Name: `title`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 5 characters, maximum 100 characters
- Recommended Maximum Length: `100`
- CMS Editable: `YES`
- Reason: iframe title and content label
- Example Value: `Static hosting deployment overview`

- Field Name: `thumbnailUrl`
- Type: `string`
- Required: `No`
- Default Value: `""`
- Validation: valid image URL
- Recommended Maximum Length: `200`
- CMS Editable: `YES`
- Reason: used as native video poster for uploaded videos
- Example Value: `/assets/graphics/mesh-glow.png`

### Code Block

- Field Name: `language`
- Type: `string`
- Required: `Yes`
- Default Value: `text`
- Validation: lowercase language key supported by Highlight.js where possible
- Recommended Maximum Length: `24`
- CMS Editable: `YES`
- Reason: language label and syntax highlighting
- Example Value: `ts`

- Field Name: `filename`
- Type: `string`
- Required: `No`
- Default Value: `""`
- Validation: trimmed, maximum 80 characters
- Recommended Maximum Length: `80`
- CMS Editable: `YES`
- Reason: displayed in code block header
- Example Value: `rag-answer.ts`

- Field Name: `code`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: plain code text, maximum 12000 characters
- Recommended Maximum Length: `12000`
- CMS Editable: `YES`
- Reason: rendered with copy button, language label, and line numbers
- Example Value: `const chunks = await vectorStore.search(query, { topK: 6 });`

### Quote Block

- Field Name: `text`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 10 characters, maximum 400 characters
- Recommended Maximum Length: `400`
- CMS Editable: `YES`
- Reason: rendered as emphasized quote text
- Example Value: `The goal is not to make deployment magical.`

- Field Name: `author`
- Type: `string`
- Required: `No`
- Default Value: `""`
- Validation: trimmed, maximum 80 characters
- Recommended Maximum Length: `80`
- CMS Editable: `YES`
- Reason: optional quote attribution
- Example Value: `Deployment note`

### Callout Block

- Field Name: `variant`
- Type: `string`
- Required: `Yes`
- Default Value: `info`
- Validation: enum values `info`, `success`, `warning`, `danger`
- Recommended Maximum Length: `20`
- CMS Editable: `YES`
- Reason: controls icon and visual tone
- Example Value: `success`

- Field Name: `title`
- Type: `string`
- Required: `No`
- Default Value: `""`
- Validation: trimmed, maximum 80 characters
- Recommended Maximum Length: `80`
- CMS Editable: `YES`
- Reason: optional callout heading
- Example Value: `Grounding signal`

- Field Name: `text`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 10 characters, maximum 500 characters
- Recommended Maximum Length: `500`
- CMS Editable: `YES`
- Reason: visible callout body
- Example Value: `A useful RAG answer should cite context and admit when retrieved material is incomplete.`

### Table Block

- Field Name: `columns`
- Type: `array[string]`
- Required: `Yes`
- Default Value: `[]`
- Validation: 2 to 6 columns, each maximum 40 characters
- Recommended Maximum Length: `40` per column
- CMS Editable: `YES`
- Reason: rendered as table headers
- Example Value: `["Stage", "Purpose", "Common risk"]`

- Field Name: `rows`
- Type: `array[array[string]]`
- Required: `Yes`
- Default Value: `[]`
- Validation: 1 to 30 rows; each row cell count should match `columns.length`; each cell maximum 160 characters
- Recommended Maximum Length: `160` per cell
- CMS Editable: `YES`
- Reason: rendered as table body
- Example Value: `[["Retrieval", "Find relevant context", "Returning near-matches"]]`

### List Blocks

- Field Name: `items`
- Type: `array[string]`
- Required: `Yes`
- Default Value: `[]`
- Validation: 1 to 20 items, each maximum 180 characters
- Recommended Maximum Length: `180` per item
- CMS Editable: `YES`
- Reason: rendered as bullet or numbered list
- Example Value: `["Ingest documents into clean chunks.", "Embed chunks and store metadata."]`

### Checklist Block

- Field Name: `items`
- Type: `array[object]`
- Required: `Yes`
- Default Value: `[]`
- Validation: 1 to 20 items; each item requires `text` and `checked`
- Recommended Maximum Length: `160` per item text
- CMS Editable: `YES`
- Reason: rendered as checklist rows
- Example Value: `[{ "text": "Validate environment variables", "checked": true }]`

### File Blocks

- Field Name: `title`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 3 characters, maximum 80 characters
- Recommended Maximum Length: `80`
- CMS Editable: `YES`
- Reason: resource card title
- Example Value: `EC2 Deployment Checklist`

- Field Name: `description`
- Type: `string`
- Required: `No`
- Default Value: `""`
- Validation: trimmed, maximum 180 characters
- Recommended Maximum Length: `180`
- CMS Editable: `YES`
- Reason: optional resource description
- Example Value: `An EC2 checklist for instance setup, Nginx, PM2, and release verification.`

- Field Name: `href`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: valid URL or site-relative file path; file extension should match block type
- Recommended Maximum Length: `300`
- CMS Editable: `YES`
- Reason: preview/download target
- Example Value: `/resources/qconnect-ec2-checklist.pdf`

### Link Blocks

- Field Name: `title`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 3 characters, maximum 80 characters
- Recommended Maximum Length: `80`
- CMS Editable: `YES`
- Reason: external link card title
- Example Value: `QConnect Backend Repository`

- Field Name: `description`
- Type: `string`
- Required: `No`
- Default Value: `""`
- Validation: trimmed, maximum 180 characters
- Recommended Maximum Length: `180`
- CMS Editable: `YES`
- Reason: optional link card context
- Example Value: `Source reference for the backend deployment structure.`

- Field Name: `href`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: valid absolute HTTPS URL
- Recommended Maximum Length: `300`
- CMS Editable: `YES`
- Reason: opens external resource card
- Example Value: `https://github.com/abishekk/qconnect-backend`

### Button Block

- Field Name: `label`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 2 characters, maximum 32 characters
- Recommended Maximum Length: `32`
- CMS Editable: `YES`
- Reason: visible button text
- Example Value: `View Workflow Template`

- Field Name: `href`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: valid absolute HTTPS URL
- Recommended Maximum Length: `300`
- CMS Editable: `YES`
- Reason: button target
- Example Value: `https://github.com/abishekk/node-cicd-template`

- Field Name: `variant`
- Type: `string`
- Required: `No`
- Default Value: `primary`
- Validation: enum values `primary`, `secondary`
- Recommended Maximum Length: `20`
- CMS Editable: `YES`
- Reason: controls button styling
- Example Value: `secondary`

### Markdown Block

- Field Name: `content`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: markdown with GFM support, maximum 12000 characters
- Recommended Maximum Length: `12000`
- CMS Editable: `YES`
- Reason: rendered with `react-markdown`, GFM, and syntax highlighting
- Example Value: `## RAG in one sentence\n\nRetrieval augmented generation gives an LLM the right context.`

## Blog Sidebar

Rendered dynamic values:

- `publishedAt`
- `updatedAt`
- `readTimeMinutes`
- `category`
- `tags`
- related article `slug`
- related article `coverImageUrl`
- related article `title`
- related article `readTimeMinutes`
- related article `category`
- article `title` for X share text

Static and frontend-owned:

- section headings
- share destinations
- current page URL
- copy-link behavior

## Related Articles

The sidebar renders only 2 related articles.

Recommended related article card fields:

- `slug`
- `title`
- `coverImageUrl`
- `readTimeMinutes`
- `category`

Do not send article blocks or full article content for related articles.

## Previous And Next Article Navigation

Rendered dynamic values:

- `previous.slug`
- `previous.title`
- `next.slug`
- `next.title`

Previous and next should be backend-generated from publish order, not manually edited in CMS.

## Blog Media Analysis

Current media fields:

- `coverImageUrl`
- image block `src`
- gallery image `src`
- video block `src`
- video block `thumbnailUrl`
- file block `href`
- link block `href`

Recommended rules:

- delivery should be URL-only
- cover image recommended aspect ratio: `16:10`
- article image recommended aspect ratio: `16:9`
- gallery image recommended aspect ratio: `4:3`
- video recommended aspect ratio: `16:9`
- cover image minimum recommended resolution: `1200x750`
- article image minimum recommended resolution: `1200x675`
- gallery image minimum recommended resolution: `800x600`
- maximum gallery images per block: `9`
- maximum file blocks per article: `20`
- alt text should be required for all images
- display order is controlled by the `blocks` array order

## Blog API Strategy

Use separate Blog APIs because listing and detail pages have different payload sizes.

Recommended frontend contracts:

- `GET /api/blogs`
- `GET /api/blogs/:slug`
- `GET /api/blogs/:slug/related`
- `GET /api/blogs/:slug/previous-next`

Reason:

- listing pages do not need article blocks
- detail pages need the full ordered block array
- related and previous/next articles need compact navigation DTOs only
- this keeps first-load listing payloads small

## Complete Recommended Blog Listing Response

```json
{
  "featuredArticle": {
    "slug": "deploying-qconnect-backend-on-aws-ec2",
    "title": "Deploying QConnect Backend on AWS EC2",
    "excerpt": "A practical deployment walkthrough for running a Node.js backend on EC2 with Nginx, PM2, environment variables, and a repeatable release checklist.",
    "category": "Projects",
    "coverImageUrl": "/assets/hero/skyline.png",
    "publishedAt": "2026-07-14",
    "readTimeMinutes": 9,
    "tags": ["AWS", "EC2", "Node.js", "Nginx"]
  },
  "articles": [
    {
      "slug": "understanding-rag-architecture",
      "title": "Understanding RAG Architecture",
      "excerpt": "A clear mental model for retrieval augmented generation, covering ingestion, embeddings, vector search, prompts, citations, and answer grounding.",
      "category": "AI",
      "coverImageUrl": "/assets/graphics/mesh-glow.png",
      "publishedAt": "2026-07-06",
      "readTimeMinutes": 8,
      "tags": ["AI", "RAG", "Embeddings", "LLMs"]
    }
  ],
  "total": 9
}
```

## Complete Recommended Blog Details Response

```json
{
  "article": {
    "id": "article-002",
    "slug": "understanding-rag-architecture",
    "title": "Understanding RAG Architecture",
    "excerpt": "A clear mental model for retrieval augmented generation, covering ingestion, embeddings, vector search, prompts, citations, and answer grounding.",
    "category": "AI",
    "publishedAt": "2026-07-06",
    "updatedAt": "2026-07-10",
    "readTimeMinutes": 8,
    "author": "Abishek Krishnamoorthy",
    "tags": ["AI", "RAG", "Embeddings", "LLMs"],
    "coverImageUrl": "/assets/graphics/mesh-glow.png",
    "blocks": [
      {
        "id": "rag-intro",
        "type": "markdown",
        "content": "## RAG in one sentence\n\nRetrieval augmented generation gives an LLM the right context at answer time."
      },
      {
        "id": "rag-flow",
        "type": "numbered-list",
        "items": ["Ingest documents into clean chunks.", "Embed chunks and store metadata."]
      }
    ]
  },
  "relatedArticles": [
    {
      "slug": "deploying-qconnect-backend-on-aws-ec2",
      "title": "Deploying QConnect Backend on AWS EC2",
      "coverImageUrl": "/assets/hero/skyline.png",
      "readTimeMinutes": 9,
      "category": "Projects"
    }
  ],
  "previous": {
    "slug": "deploying-qconnect-backend-on-aws-ec2",
    "title": "Deploying QConnect Backend on AWS EC2"
  },
  "next": {
    "slug": "aws-deployment-notes-and-resources",
    "title": "AWS Deployment Notes & Resources"
  }
}
```

## Blog CMS Structure

Recommended CMS groups:

- Basic Information: `title`, `slug`, `excerpt`, `category`, `tags`, `author`
- Media: `coverImageUrl`, cover alt text, gallery/image assets used by blocks
- Content Blocks: ordered block array with type-specific fields
- SEO: meta title, meta description, OG image; current frontend derives these from title, excerpt, and cover
- Publishing: `publishedAt`, `updatedAt`, draft/published state, featured flag
- Resources: uploaded file URLs and external resource links used in file/link blocks
- Settings: read time calculation, related-article matching rules, canonical URL behavior

## Blog Fields That Should Not Come From Backend

These should remain frontend-owned for the current implementation:

- hero title, subtitle, stats, and focus text
- search placeholder and active search state
- filter chip labels and active filter state
- section headings
- `Read Article` label
- tag slicing to 4 tags on cards
- cover image fallback path
- date formatting
- share URLs and copy-link behavior
- lightbox state
- code copy state
- block icons and visual styles

## Blog Performance Recommendations

- Use compact `ArticlePreview` objects for listing pages.
- Do not send `blocks` to `/api/blogs`.
- Limit listing response to the fields rendered by cards.
- Return only 2 related articles for the sidebar.
- Generate previous/next server-side from publish order.
- Serve images and files by URL through a media provider or static file path.
- Compute `readTimeMinutes` during publish or save, not during every page request.

## Blog Final Recommendation

The Blog module should keep one flexible `Article` model for detail pages, but use compact preview DTOs for listing, featured, related, and previous/next responses.

This preserves the current block-renderer architecture while avoiding unnecessary payload on the listing page.

# Contact Module API Analysis

This section analyzes the current Contact page implementation and defines the frontend-first API contract for contact information, contact form submission, and meeting request submission.

It does not propose backend code, Express routes, MongoDB schemas, or email/calendar integrations.

## Scope

The analysis is based on these files:

- [src/app/contact/page.tsx](/home/intellect/Desktop/Abishek_portfolio/src/app/contact/page.tsx:1)
- [src/components/contact/ContactHub.tsx](/home/intellect/Desktop/Abishek_portfolio/src/components/contact/ContactHub.tsx:1)
- [src/types/contact.types.ts](/home/intellect/Desktop/Abishek_portfolio/src/types/contact.types.ts:1)
- [src/types/profile.types.ts](/home/intellect/Desktop/Abishek_portfolio/src/types/profile.types.ts:1)
- [src/services/contact.service.ts](/home/intellect/Desktop/Abishek_portfolio/src/services/contact.service.ts:1)
- [src/services/profile.service.ts](/home/intellect/Desktop/Abishek_portfolio/src/services/profile.service.ts:1)

## Current Contact Module Data Sources

The Contact page currently uses:

- `getProfile()` for contact/social link values
- local static content inside `ContactHub`
- local `submitMeetingRequest(payload)` mock service for meeting requests

The contact form is UI-only today and does not call a service.

## What The Current Contact Page Actually Renders

### Contact Hero

Dynamic API data needed:

- none

Static values:

- eyebrow: `Contact`
- title: `Let's Connect`
- description
- `Schedule a Call` button
- `Send a Message` anchor button

### Communication Cards

Dynamic API data needed:

- none in the current implementation

Static cards:

- Phone Call
- Google Meet

Rendered values:

- title
- description
- estimated duration
- action label

### Scheduling Modal

Rendered dynamic user-input values:

- `meetingType`
- `fullName`
- `preferredDate`
- `preferredTime`
- `timezone`
- `phone`
- `email`
- `purpose`
- `message`

### Contact Form

Rendered UI fields:

- name
- email
- subject
- message

Current behavior:

- `onSubmit` prevents default
- no API call yet
- no validation logic yet

### Social Links

Rendered dynamic values from `profile`:

- `profile.githubUrl`
- `profile.linkedinUrl`
- `profile.email`
- `profile.resumeUrl`

Rendered static values:

- GitHub username: `@abishekk`
- LinkedIn display name: `Abishek Krishnamoorthy`
- Resume label: `Download resume`
- Location: `India · Open to Remote`
- X URL: `https://x.com/abishekk`
- X username: `@abishekk`

## Contact Information Contract

Contact information should be modeled as objects and arrays, not loose strings.

Reason:

- the UI repeats card-like social/contact rows
- each item has label, value, URL/action, icon, order, and visibility concerns
- this lets the CMS hide, reorder, or update methods without frontend rewrites

## Recommended GET Contact Information Response Fields

### `contact.email`

- Field Name: `email`
- Type: `object`
- Required: `Yes`
- Default Value: `null`
- Validation: must include valid email address
- Recommended Maximum Length: `120` for address
- CMS Editable: `YES`
- Reason: rendered as an email social/contact card and may be used for form delivery
- Example Value: `{ "label": "Email", "value": "abishek@example.com", "href": "mailto:abishek@example.com", "visible": true }`

### `contact.phone`

- Field Name: `phone`
- Type: `object`
- Required: `No`
- Default Value: `null`
- Validation: E.164 recommended; display value maximum 24 characters
- Recommended Maximum Length: `24`
- CMS Editable: `YES`
- Reason: current page supports phone meeting requests; phone card is not currently rendered but requested in the communication-hub architecture
- Example Value: `{ "label": "Phone", "value": "+91 98765 43210", "href": "tel:+919876543210", "visible": false }`

### `contact.location`

- Field Name: `location`
- Type: `object`
- Required: `Yes`
- Default Value: `{ "value": "India · Open to Remote" }`
- Validation: trimmed, maximum 60 characters
- Recommended Maximum Length: `60`
- CMS Editable: `YES`
- Reason: rendered as a Location card value
- Example Value: `{ "label": "Location", "value": "India · Open to Remote", "visible": true }`

### `contact.resume`

- Field Name: `resume`
- Type: `object`
- Required: `No`
- Default Value: `null`
- Validation: valid HTTPS URL or site-relative file path; recommended `.pdf`
- Recommended Maximum Length: `300`
- CMS Editable: `YES`
- Reason: rendered as Resume card using `profile.resumeUrl`
- Example Value: `{ "label": "Resume", "value": "Download resume", "href": "/resume.pdf", "visible": true }`

### `contact.availability`

- Field Name: `availability`
- Type: `object`
- Required: `No`
- Default Value: `null`
- Validation: status label maximum 40 characters; availableFor values maximum 24 characters each
- Recommended Maximum Length: `40` for status
- CMS Editable: `YES`
- Reason: availability is part of the desired communication hub, but current ContactHub does not render a dedicated availability section
- Example Value: `{ "status": "Open to Opportunities", "availableFor": ["Full-Time", "Freelance", "Remote"], "responseTime": "Within 24 Hours" }`

### `contact.businessHours`

- Field Name: `businessHours`
- Type: `object`
- Required: `No`
- Default Value: `null`
- Validation: day label maximum 40 characters, time label maximum 40 characters, timezone maximum 60 characters
- Recommended Maximum Length: `60`
- CMS Editable: `YES`
- Reason: scheduling copy references availability, but current UI only stores timezone in meeting form
- Example Value: `{ "days": "Monday - Friday", "hours": "10 AM - 7 PM", "timezone": "Asia/Kolkata" }`

### `communicationMethods`

- Field Name: `communicationMethods`
- Type: `array[object]`
- Required: `Yes`
- Default Value: `[]`
- Validation: 1 to 6 methods; each method requires `id`, `type`, `title`, `description`, `duration`, and `actionLabel`
- Recommended Maximum Length: `2` methods for current UI
- CMS Editable: `YES`
- Reason: current communication cards are static, but the repeated UI maps cleanly to CMS-controlled objects
- Example Value: `{ "id": "phone", "type": "phone", "title": "Phone Call", "duration": "15-30 Minutes" }`

## Social Links Contract

Social links should be an ordered array of objects.

### `socialLinks[].platform`

- Field Name: `platform`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: enum values `GitHub`, `LinkedIn`, `Email`, `Resume`, `Location`, `X`, `Instagram`, `Medium`, `Behance`
- Recommended Maximum Length: `24`
- CMS Editable: `YES`
- Reason: rendered as card title and used for icon mapping
- Example Value: `GitHub`

### `socialLinks[].username`

- Field Name: `username`
- Type: `string`
- Required: `No`
- Default Value: `""`
- Validation: trimmed, maximum 60 characters
- Recommended Maximum Length: `60`
- CMS Editable: `YES`
- Reason: rendered as the card value
- Example Value: `@abishekk`

### `socialLinks[].profileUrl`

- Field Name: `profileUrl`
- Type: `string`
- Required: `No`
- Default Value: `""`
- Validation: valid HTTPS URL, `mailto:` URL, `tel:` URL, or site-relative file path depending on platform
- Recommended Maximum Length: `300`
- CMS Editable: `YES`
- Reason: card click target
- Example Value: `https://github.com/abishekk`

### `socialLinks[].icon`

- Field Name: `icon`
- Type: `string`
- Required: `Yes`
- Default Value: `LinkIcon`
- Validation: frontend-supported icon key
- Recommended Maximum Length: `40`
- CMS Editable: `YES`
- Reason: lets CMS choose an icon without sending React components
- Example Value: `Code2`

### `socialLinks[].displayOrder`

- Field Name: `displayOrder`
- Type: `number`
- Required: `Yes`
- Default Value: `0`
- Validation: integer, minimum `0`
- Recommended Maximum Length: `N/A`
- CMS Editable: `YES`
- Reason: controls card order
- Example Value: `1`

### `socialLinks[].visible`

- Field Name: `visible`
- Type: `boolean`
- Required: `Yes`
- Default Value: `true`
- Validation: boolean
- Recommended Maximum Length: `N/A`
- CMS Editable: `YES`
- Reason: allows hiding links without deleting them
- Example Value: `true`

## Meeting Request Contract

### `meetingType`

- Field Name: `meetingType`
- Type: `string`
- Required: `Yes`
- Default Value: `phone`
- Validation: enum values `phone`, `meet`
- Recommended Maximum Length: `10`
- CMS Editable: `NO`
- Reason: selected by visitor in scheduling modal
- Example Value: `meet`

### `fullName`

- Field Name: `fullName`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 2 characters, maximum 80 characters
- Recommended Maximum Length: `80`
- CMS Editable: `NO`
- Reason: visitor identity for scheduling request
- Example Value: `Aarav Sharma`

### `email`

- Field Name: `email`
- Type: `string`
- Required: `Conditional`
- Default Value: `""`
- Validation: valid email; required when `meetingType` is `meet`; optional for `phone`
- Recommended Maximum Length: `120`
- CMS Editable: `NO`
- Reason: Google Meet requests require email delivery
- Example Value: `aarav@example.com`

### `phone`

- Field Name: `phone`
- Type: `string`
- Required: `Conditional`
- Default Value: `""`
- Validation: current frontend regex `^[+\d][\d\s().-]{7,}$`; required when `meetingType` is `phone`; optional for `meet`
- Recommended Maximum Length: `24`
- CMS Editable: `NO`
- Reason: phone requests require callback number
- Example Value: `+91 98765 43210`

### `preferredDate`

- Field Name: `preferredDate`
- Type: `date`
- Required: `Yes`
- Default Value: `""`
- Validation: ISO date string `YYYY-MM-DD`; cannot be in the past
- Recommended Maximum Length: `10`
- CMS Editable: `NO`
- Reason: visitor-selected meeting date
- Example Value: `2026-07-24`

### `preferredTime`

- Field Name: `preferredTime`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: `HH:mm` 24-hour time format
- Recommended Maximum Length: `5`
- CMS Editable: `NO`
- Reason: visitor-selected meeting time
- Example Value: `15:30`

### `timezone`

- Field Name: `timezone`
- Type: `string`
- Required: `Yes`
- Default Value: `Asia/Kolkata`
- Validation: valid IANA timezone preferred; trimmed, maximum 60 characters
- Recommended Maximum Length: `60`
- CMS Editable: `NO`
- Reason: avoids ambiguity in scheduling
- Example Value: `Asia/Kolkata`

### `purpose`

- Field Name: `purpose`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 5 characters, maximum 140 characters
- Recommended Maximum Length: `140`
- CMS Editable: `NO`
- Reason: summarizes why the visitor wants a meeting
- Example Value: `Discuss a full-time frontend role`

### `message`

- Field Name: `message`
- Type: `string`
- Required: `No`
- Default Value: `""`
- Validation: trimmed, maximum 1000 characters
- Recommended Maximum Length: `1000`
- CMS Editable: `NO`
- Reason: optional context for the meeting request
- Example Value: `I would like to discuss your AWS and AI project experience.`

## Contact Form Contract

The current form is UI-only, but the visible fields are clear.

### `name`

- Field Name: `name`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 2 characters, maximum 80 characters
- Recommended Maximum Length: `80`
- CMS Editable: `NO`
- Reason: visitor identity for message
- Example Value: `Priya Menon`

### `email`

- Field Name: `email`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: valid email address, maximum 120 characters
- Recommended Maximum Length: `120`
- CMS Editable: `NO`
- Reason: reply address
- Example Value: `priya@example.com`

### `subject`

- Field Name: `subject`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 5 characters, maximum 120 characters
- Recommended Maximum Length: `120`
- CMS Editable: `NO`
- Reason: visible contact form field and message classification
- Example Value: `Job opportunity`

### `message`

- Field Name: `message`
- Type: `string`
- Required: `Yes`
- Default Value: `""`
- Validation: trimmed, minimum 20 characters, maximum 2000 characters
- Recommended Maximum Length: `2000`
- CMS Editable: `NO`
- Reason: main visitor message
- Example Value: `We are hiring a full-stack developer for an AI product team and would like to connect.`

### Spam Prevention Recommendations

- Add a hidden honeypot field.
- Rate-limit by IP and email.
- Add server-side validation even if frontend validation exists.
- Store user agent and referrer for moderation/debugging.
- Avoid exposing raw email delivery errors to the UI.

## Contact API Strategy

Recommended frontend contracts:

- `GET /api/contact`
- `POST /api/contact/messages`
- `POST /api/contact/meeting-requests`

Reason:

- contact information is CMS-managed display data
- contact form submission is visitor-generated data
- meeting requests have different validation and workflow requirements from general messages

## Complete Recommended Contact Information Response

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
    "phone": {
      "label": "Phone",
      "value": "+91 98765 43210",
      "href": "tel:+919876543210",
      "visible": false
    },
    "location": {
      "label": "Location",
      "value": "India · Open to Remote",
      "visible": true
    },
    "resume": {
      "label": "Resume",
      "value": "Download resume",
      "href": "/resume.pdf",
      "visible": true
    },
    "availability": {
      "status": "Open to Opportunities",
      "availableFor": ["Full-Time", "Freelance", "Contract", "Remote"],
      "responseTime": "Within 24 Hours"
    },
    "businessHours": {
      "days": "Monday - Friday",
      "hours": "10 AM - 7 PM",
      "timezone": "Asia/Kolkata"
    }
  },
  "communicationMethods": [
    {
      "id": "phone",
      "type": "phone",
      "title": "Phone Call",
      "description": "Ideal for quick discussions, job opportunities, or project consultations.",
      "duration": "15-30 Minutes",
      "actionLabel": "Request Phone Call",
      "visible": true
    },
    {
      "id": "meet",
      "type": "meet",
      "title": "Google Meet",
      "description": "Perfect for technical discussions, project demos, and detailed conversations.",
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
    },
    {
      "platform": "LinkedIn",
      "username": "Abishek Krishnamoorthy",
      "profileUrl": "https://linkedin.com/in/abishekk",
      "icon": "BriefcaseBusiness",
      "displayOrder": 2,
      "visible": true
    }
  ]
}
```

## Complete Recommended Meeting Request Payload

```json
{
  "meetingType": "meet",
  "fullName": "Aarav Sharma",
  "email": "aarav@example.com",
  "phone": "+91 98765 43210",
  "preferredDate": "2026-07-24",
  "preferredTime": "15:30",
  "timezone": "Asia/Kolkata",
  "purpose": "Discuss a full-time frontend role",
  "message": "I would like to discuss your AWS and AI project experience."
}
```

## Complete Recommended Meeting Request Response

```json
{
  "id": "meeting-1721815200000",
  "status": "received",
  "message": "Meeting request received."
}
```

## Complete Recommended Contact Form Payload

```json
{
  "name": "Priya Menon",
  "email": "priya@example.com",
  "subject": "Job opportunity",
  "message": "We are hiring a full-stack developer for an AI product team and would like to connect.",
  "source": "portfolio-contact-page"
}
```

## Complete Recommended Contact Form Response

```json
{
  "id": "message-1721815200000",
  "status": "received",
  "message": "Message received."
}
```

## Contact CMS Structure

Recommended CMS groups:

- Basic Information: email, phone, location, resume URL
- Communication Methods: phone call and Google Meet cards
- Availability: status, available engagement types, response time, business hours
- Social Links: platform, username, URL, icon key, display order, visibility
- Form Settings: recipient email, allowed subjects, spam protection settings
- Scheduling Settings: default timezone, available days, available hours, meeting durations, approval workflow copy
- SEO: title, description, canonical URL

## Contact Fields That Should Not Come From Backend

These should remain frontend-owned for the current implementation:

- modal open/close state
- success/loading state
- form input state before submission
- ESC and outside-click behavior
- button icons as React components
- validation error display copy unless localization is introduced
- animation values
- current static section layout

## Contact Performance Recommendations

- Keep `GET /api/contact` small and cacheable.
- Do not include message submissions or meeting requests in the contact information response.
- Keep social links as an ordered array so hidden links can be filtered server-side.
- Validate contact and meeting payloads server-side even if frontend validation exists.
- Return short success responses; do not echo sensitive submitted content back to the client.

## Contact Final Recommendation

The Contact module should separate CMS-managed display information from visitor-submitted data.

Use `GET /api/contact` for visible contact methods and social links, `POST /api/contact/messages` for the general contact form, and `POST /api/contact/meeting-requests` for scheduling requests.

## SEO Deployment Note

CMS-managed SEO metadata is refreshed through the protected frontend revalidation endpoint after CMS updates; a frontend deployment is only required when the implementation or deployment configuration changes.
