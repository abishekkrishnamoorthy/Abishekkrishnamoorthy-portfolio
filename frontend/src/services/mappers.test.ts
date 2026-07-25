import { describe, expect, it } from "vitest";
import { mapArticlePreview, mapProject, type ProjectDto } from "@/services/mappers";

const project: ProjectDto = {
  _id: "mongo-id",
  slug: "api-project",
  orderIndex: 1,
  title: "API Project",
  tagline: "A project loaded from the backend",
  shortDescription: "A backend-driven project used to verify DTO mapping.",
  description: "A backend-driven project used to verify the public API mapping layer.",
  status: "completed",
  category: "Backend",
  thumbnailUrl: "https://example.com/project.png",
  techTags: ["TypeScript"],
  highlights: ["Typed API"],
  liveDemoUrl: "https://example.com",
  githubUrl: "https://github.com/example/project",
  durationLabel: "2 weeks",
  role: "Developer",
  lastUpdatedAt: "2026-07-22",
  techIcons: ["TS"],
  readmeMarkdown: "Overview",
  projectStructure: "src/",
  techStackTable: [{ category: "Language", technologies: "TypeScript" }],
  gallery: [],
  architectureNotes: "The browser consumes a typed public API through a service boundary.",
  challenges: ["Contract mapping"],
  solutions: ["DTO adapter"],
  learningOutcomes: ["Stable API boundaries"],
};

describe("API mappers", () => {
  it("maps MongoDB identifiers without adding fallback content", () => {
    expect(mapProject(project)).toMatchObject({ id: "mongo-id", slug: "api-project" });
  });

  it("keeps blog previews limited to public preview fields", () => {
    const preview = mapArticlePreview({ slug: "post", title: "Post title", excerpt: "Excerpt", category: "Backend", publishedAt: "2026-07-22", readTimeMinutes: 4, tags: ["API"] });
    expect(preview).toEqual({ slug: "post", title: "Post title", excerpt: "Excerpt", coverImageUrl: undefined, category: "Backend", publishedAt: "2026-07-22", readTimeMinutes: 4, tags: ["API"] });
  });
});
