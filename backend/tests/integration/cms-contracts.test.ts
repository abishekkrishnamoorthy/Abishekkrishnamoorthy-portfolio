import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../helpers/test-app.js";
import { BlogArticleModel } from "@/modules/blog/blog.model.js";
import { MediaAssetModel } from "@/modules/media/media.model.js";
import { ProjectModel } from "@/modules/projects/project.model.js";
import { usersService } from "@/modules/users/users.service.js";

async function authHeader() {
  await usersService.seedRoles();
  await usersService.createUser({
    name: "Test Admin",
    email: "admin@example.com",
    password: "super-secret-password",
    roleName: "SUPER_ADMIN",
  });
  const response = await request(app()).post("/api/cms/auth/login").send({ email: "admin@example.com", password: "super-secret-password" }).expect(200);
  return { Authorization: `Bearer ${response.body.data.accessToken}` };
}

function projectPayload(slug = "cms-project", publishStatus: "draft" | "published" = "published") {
  return {
    slug,
    orderIndex: 1,
    title: "CMS Project",
    tagline: "Production-ready project managed through the CMS",
    shortDescription: "A complete project entry that exercises the public and CMS contracts.",
    description: "This project payload mirrors the portfolio contract and is long enough to satisfy validation.",
    status: "production",
    category: "Full Stack",
    thumbnailUrl: "https://res.cloudinary.com/demo/image/upload/v1/portfolio/projects/cms-project.png",
    techTags: ["Next.js", "TypeScript"],
    highlights: ["CMS editable"],
    liveDemoUrl: "https://example.com/demo",
    githubUrl: "https://github.com/example/cms-project",
    durationLabel: "4 Weeks",
    role: "Full Stack Developer",
    lastUpdatedAt: "2026-07-22",
    techIcons: ["Next", "TS"],
    readmeMarkdown: "## Overview\nThis project is documented for testing.",
    projectStructure: "apps/web\napps/api",
    techStackTable: [{ category: "Frontend", technologies: "Next.js, TypeScript" }],
    gallery: [],
    architectureNotes: "The implementation follows a modular backend pattern with clear API contracts and CMS-managed content.",
    challenges: ["Keeping content editable"],
    solutions: ["Validated REST payloads"],
    learningOutcomes: ["Contract-first backend design"],
    isFeatured: true,
    publishStatus,
  };
}

function articlePayload(slug = "cms-article", publishStatus: "draft" | "published" = "published") {
  return {
    slug,
    title: "CMS Article Testing",
    excerpt: "A contract-valid article preview used to verify blog validation and publish filtering.",
    category: "Backend",
    publishedAt: "2026-07-22",
    updatedAt: "2026-07-22",
    author: "Abishek Krishnamoorthy",
    tags: ["Backend", "CMS"],
    coverImageUrl: "/assets/graphics/mesh-glow.png",
    blocks: [{ id: "intro", type: "paragraph", text: "This paragraph contains enough words to satisfy the blog block validation contract." }],
    featured: false,
    publishStatus,
  };
}

describe("CMS API contracts", () => {
  it("requires authentication for protected CMS routes", async () => {
    await request(app()).get("/api/cms/projects").expect(401);
  });

  it("creates a project through CMS and syncs media usage metadata", async () => {
    const headers = await authHeader();
    await MediaAssetModel.create({
      publicId: "portfolio/projects/cms-project",
      url: "https://res.cloudinary.com/demo/image/upload/v1/portfolio/projects/cms-project.png",
      secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/portfolio/projects/cms-project.png",
      folder: "portfolio/projects",
    });

    const response = await request(app()).post("/api/cms/projects").set(headers).send(projectPayload("cms-project", "draft")).expect(201);
    expect(response.body.data.slug).toBe("cms-project");

    const asset = await MediaAssetModel.findOne({ publicId: "portfolio/projects/cms-project" }).lean();
    expect(asset?.usedIn).toEqual([{ collection: "projects", documentId: "cms-project", field: "content" }]);
  });

  it("keeps draft projects and articles out of public APIs", async () => {
    await ProjectModel.create(projectPayload("draft-project", "draft"));
    await BlogArticleModel.create({ ...articlePayload("draft-article", "draft"), readTimeMinutes: 3 });

    const projects = await request(app()).get("/api/projects").expect(200);
    const blogs = await request(app()).get("/api/blogs").expect(200);

    expect(projects.body.data.items).toHaveLength(0);
    expect(blogs.body.data.articles).toHaveLength(0);
  });

  it("validates blog blocks and contact message payloads", async () => {
    const headers = await authHeader();
    await request(app()).post("/api/cms/blogs").set(headers).send({ ...articlePayload(), blocks: [{ id: "bad", type: "paragraph", text: "Too short" }] }).expect(400);
    await request(app()).post("/api/contact/messages").send({ name: "A", email: "not-email", subject: "Hi", message: "Short" }).expect(400);
  });

  it("supports CMS experience CRUD through protected routes", async () => {
    const headers = await authHeader();
    const created = await request(app())
      .post("/api/cms/experience")
      .set(headers)
      .send({
        role: "Software Engineer",
        company: "Portfolio Labs",
        location: "Remote",
        startDate: "2026-01-01",
        endDate: null,
        description: "Building and maintaining portfolio-grade full-stack applications with clean backend contracts.",
        techTags: ["Node.js", "MongoDB"],
        orderIndex: 0,
        publishStatus: "draft",
      })
      .expect(201);

    await request(app()).put(`/api/cms/experience/${created.body.data._id}`).set(headers).send({ publishStatus: "published" }).expect(200);
    const list = await request(app()).get("/api/cms/experience").set(headers).expect(200);
    expect(list.body.data[0].publishStatus).toBe("published");
  });

  it("supports extended CMS SEO override fields and duplicate path validation", async () => {
    const headers = await authHeader();
    const payload = {
      pagePath: "/projects/qconnect",
      metaTitle: "QConnect",
      metaDescription: "Queue management project detail page.",
      canonicalUrl: "https://abishekkrishnamoorthy.online/projects/qconnect",
      ogImageUrl: "https://res.cloudinary.com/demo/image/upload/v1/portfolio/seo/pages/qconnect.png",
      ogTitle: "QConnect Social",
      ogDescription: "Social description",
      robots: "index,follow",
    };

    const created = await request(app()).post("/api/cms/seo").set(headers).send(payload).expect(201);
    expect(created.body.data).toMatchObject(payload);

    await request(app()).post("/api/cms/seo").set(headers).send(payload).expect(409);

    const updated = await request(app()).put(`/api/cms/seo/${created.body.data._id}`).set(headers).send({ robots: "noindex,follow" }).expect(200);
    expect(updated.body.data.robots).toBe("noindex,follow");
  });

  it("supports partial Global SEO updates through CMS settings", async () => {
    const headers = await authHeader();
    const response = await request(app())
      .put("/api/cms/settings")
      .set(headers)
      .send({
        seo: {
          siteName: "Portfolio",
          siteUrl: "https://abishekkrishnamoorthy.online",
          defaultMetaTitle: "Default SEO Title",
          titleTemplate: "%page% | Portfolio",
          defaultMetaDescription: "Default SEO description for the portfolio.",
          defaultAuthor: "Abishek Krishnamoorthy",
          defaultRobots: "index,follow",
          googleVerificationCode: "google-site-token",
        },
      })
      .expect(200);

    expect(response.body.data.seo).toMatchObject({
      siteName: "Portfolio",
      titleTemplate: "%page% | Portfolio",
      googleVerificationCode: "google-site-token",
    });

    const partial = await request(app()).put("/api/cms/settings").set(headers).send({ seo: { defaultRobots: "noindex,follow" } }).expect(200);
    expect(partial.body.data.seo).toMatchObject({
      siteName: "Portfolio",
      defaultRobots: "noindex,follow",
      defaultMetaTitle: "Default SEO Title",
    });
  });
});
