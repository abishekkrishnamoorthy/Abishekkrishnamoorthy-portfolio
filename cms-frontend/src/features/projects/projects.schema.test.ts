import { describe, expect, it } from "vitest";
import { projectSchema } from "@/features/projects/projects.schema";

describe("projectSchema", () => {
  it("rejects short project titles and invalid URLs", () => {
    const result = projectSchema.safeParse({ title: "x", liveDemoUrl: "http://bad.test" });
    expect(result.success).toBe(false);
  });

  it("allows local image previews while files are pending upload", () => {
    const result = projectSchema.safeParse({
      slug: "pending-upload",
      orderIndex: 0,
      title: "Pending upload project",
      tagline: "A valid project tagline",
      shortDescription: "A valid project short description with enough text.",
      description: "A valid project description with enough text to satisfy the editor validation rules.",
      status: "completed",
      category: "Full Stack",
      thumbnailUrl: "blob:http://localhost/thumbnail",
      techTags: ["React"],
      highlights: ["Highlight"],
      liveDemoUrl: "https://example.com/demo",
      githubUrl: "https://github.com/example/repo",
      durationLabel: "2 weeks",
      role: "Developer",
      lastUpdatedAt: "2026-08-04",
      techIcons: ["react"],
      readmeMarkdown: "",
      projectStructure: "",
      techStackTable: [{ category: "Frontend", technologies: "React" }],
      gallery: [{ url: "blob:http://localhost/gallery", alt: "Project screenshot" }],
      architectureNotes: "Architecture notes with enough detail for validation to accept this project.",
      challenges: ["Challenge"],
      solutions: ["Solution"],
      learningOutcomes: ["Learning outcome"],
      isFeatured: false,
      publishStatus: "draft",
    });
    expect(result.success).toBe(true);
  });
});
