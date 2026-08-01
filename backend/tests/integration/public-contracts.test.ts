import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../helpers/test-app.js";
import { ProjectModel } from "@/modules/projects/project.model.js";
import { BlogArticleModel } from "@/modules/blog/blog.model.js";
import { SeoOverrideModel } from "@/modules/seo/seo.model.js";
import { SettingsModel } from "@/modules/settings/settings.model.js";

describe("public API contracts", () => {
  it("returns the home aggregate shape", async () => {
    const response = await request(app()).get("/api/home").expect(200);
    expect(response.body.data.hero.headline).toBeTruthy();
    expect(response.body.data.hero.roleBadge).toBeTruthy();
    expect(response.body.data.hero.status).toMatchObject({ enabled: true, text: expect.any(String) });
    expect(response.body.data.hero.socialLinks).toMatchObject({ linkedIn: expect.any(String), gitHub: expect.any(String), email: expect.any(String) });
    expect(response.body.data.skills.categories).toBeInstanceOf(Array);
    expect(response.body.data.currentlyLearning.items).toBeInstanceOf(Array);
    expect(response.body.data.featuredProjects).toBeInstanceOf(Array);
    expect(response.body.data.latestArticles).toBeInstanceOf(Array);
  });

  it("returns the projects header shape", async () => {
    const response = await request(app()).get("/api/projects/header").expect(200);
    expect(response.body.data).toMatchObject({
      badge: "My Work",
      title: "Projects that solve",
      highlightText: "real world problems.",
      description: expect.any(String),
    });
    expect(response.body.data.showcaseImages).toHaveLength(5);
    expect(response.body.data.showcaseImages.map((image: { order: number }) => image.order)).toEqual([1, 2, 3, 4, 5]);
  });

  it("returns projects listing without detail-heavy fields", async () => {
    await ProjectModel.create({
      slug: "qconnect",
      orderIndex: 1,
      title: "QConnect",
      tagline: "Real-time support platform for connected teams",
      shortDescription: "A production-style full-stack queue and support platform.",
      description: "QConnect brings queue management, team handoff, and operational dashboards into one responsive product experience.",
      status: "production",
      category: "Full Stack",
      thumbnailUrl: "/assets/graphics/mesh-glow.png",
      techTags: ["Next.js", "TypeScript"],
      highlights: ["Live queue tracking"],
      liveDemoUrl: "https://qconnect-demo.example.com",
      githubUrl: "https://github.com/abishekk/qconnect",
      durationLabel: "3 Months",
      role: "Full Stack Developer",
      lastUpdatedAt: "2026-06-12",
      techIcons: ["Next", "TS"],
      readmeMarkdown: "## Overview\nReadable docs.",
      projectStructure: "qconnect/",
      techStackTable: [{ category: "Frontend", technologies: "Next.js" }],
      architectureNotes: "A modular service layer keeps operational workflows separate from presentation state.",
      challenges: ["Keeping queue state predictable"],
      solutions: ["Normalized API payloads"],
      learningOutcomes: ["Improved realtime UX planning"],
      publishStatus: "published",
      isFeatured: true,
    });
    const response = await request(app()).get("/api/projects").expect(200);
    expect(response.body.data.items[0].slug).toBe("qconnect");
    expect(response.body.data.items[0].readmeMarkdown).toBeUndefined();
  });

  it("returns blog listing without blocks", async () => {
    await BlogArticleModel.create({
      slug: "understanding-rag-architecture",
      title: "Understanding RAG Architecture",
      excerpt: "A clear mental model for retrieval augmented generation, embeddings, vector search, prompts, and citations.",
      category: "AI",
      publishedAt: "2026-07-06",
      updatedAt: "2026-07-10",
      readTimeMinutes: 8,
      author: "Abishek Krishnamoorthy",
      tags: ["AI", "RAG"],
      coverImageUrl: "/assets/graphics/mesh-glow.png",
      blocks: [{ id: "intro", type: "paragraph", text: "This paragraph has enough content to pass validation and rendering expectations." }],
      featured: true,
      publishStatus: "published",
    });
    const response = await request(app()).get("/api/blogs").expect(200);
    expect(response.body.data.articles[0].slug).toBe("understanding-rag-architecture");
    expect(response.body.data.articles[0].blocks).toBeUndefined();
  });

  it("accepts a contact form message with non-echoing response", async () => {
    const response = await request(app())
      .post("/api/contact/messages")
      .send({ name: "Priya Menon", email: "priya@example.com", subject: "Job opportunity", message: "We are hiring a full-stack developer for an AI product team and would like to connect." })
      .expect(201);
    expect(response.body.data.status).toBe("received");
    expect(response.body.data.message).toBe("Message received.");
    expect(response.body.data.content).toBeUndefined();
  });

  it("returns default global SEO and resolves fallback metadata", async () => {
    const global = await request(app()).get("/api/seo/global").expect(200);
    expect(global.body.data).toMatchObject({
      siteName: "Abishek Krishnamoorthy",
      siteUrl: "https://abishekkrishnamoorthy.online",
      defaultRobots: "index,follow",
    });

    const resolved = await request(app()).get("/api/seo/resolve").query({ path: "/projects/qconnect" }).expect(200);
    expect(resolved.body.data).toMatchObject({
      path: "/projects/qconnect",
      metaTitle: global.body.data.defaultMetaTitle,
      metaDescription: global.body.data.defaultMetaDescription,
      canonicalUrl: "https://abishekkrishnamoorthy.online/projects/qconnect",
      robots: "index,follow",
      hasPageOverride: false,
    });
  });

  it("resolves page SEO overrides and lists page summaries", async () => {
    await SettingsModel.findByIdAndUpdate(
      "singleton",
      {
        _id: "singleton",
        seo: {
          siteName: "Portfolio",
          siteUrl: "https://example.com",
          defaultMetaTitle: "Default Title",
          titleTemplate: "%page% | Portfolio",
          defaultMetaDescription: "Default description for the portfolio.",
          defaultAuthor: "Abishek",
          defaultRobots: "index,follow",
          defaultOgImageUrl: "https://res.cloudinary.com/demo/image/upload/v1/portfolio/seo/default.png",
        },
      },
      { upsert: true },
    );
    await SeoOverrideModel.create({
      pagePath: "/projects/qconnect",
      metaTitle: "QConnect",
      metaDescription: "Queue management project detail page.",
      ogTitle: "QConnect Social",
      ogDescription: "Social description",
      ogImageUrl: "https://res.cloudinary.com/demo/image/upload/v1/portfolio/seo/pages/qconnect.png",
      robots: "noindex,follow",
    });

    const resolved = await request(app()).get("/api/seo/resolve").query({ path: "/projects/qconnect" }).expect(200);
    expect(resolved.body.data).toMatchObject({
      metaTitle: "QConnect | Portfolio",
      metaDescription: "Queue management project detail page.",
      canonicalUrl: "https://example.com/projects/qconnect",
      robots: "noindex,follow",
      ogTitle: "QConnect Social",
      ogDescription: "Social description",
      hasPageOverride: true,
    });

    const pages = await request(app()).get("/api/seo/pages").expect(200);
    expect(pages.body.data).toEqual([expect.objectContaining({ pagePath: "/projects/qconnect", robots: "noindex,follow", updatedAt: expect.any(String) })]);
  });
});
