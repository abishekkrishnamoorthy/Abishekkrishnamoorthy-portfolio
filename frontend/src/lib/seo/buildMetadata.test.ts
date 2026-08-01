import { describe, expect, it } from "vitest";
import { buildMetadata, fallbackResolvedSeo } from "@/lib/seo/buildMetadata";
import type { ResolvedSeo } from "@/types/seo.types";

const resolved: ResolvedSeo = {
  path: "/projects/qconnect",
  metaTitle: "QConnect | Portfolio",
  metaDescription: "Project description",
  canonicalUrl: "https://example.com/projects/qconnect",
  robots: "noindex,follow",
  ogTitle: "QConnect Social",
  ogDescription: "Social description",
  ogImageUrl: "https://res.cloudinary.com/demo/image/upload/v1/seo/qconnect.png",
  author: "Abishek",
  siteName: "Portfolio",
  siteUrl: "https://example.com",
  googleVerificationCode: "token",
  defaultFaviconUrl: "https://res.cloudinary.com/demo/image/upload/v1/seo/favicon.png",
  hasPageOverride: true,
};

describe("SEO metadata helpers", () => {
  it("maps resolved SEO into Next metadata", () => {
    const metadata = buildMetadata(resolved);
    expect(metadata.title).toBe("QConnect | Portfolio");
    expect(metadata.description).toBe("Project description");
    expect(metadata.alternates).toEqual({ canonical: "https://example.com/projects/qconnect" });
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.verification).toEqual({ google: "token" });
  });

  it("omits Google verification metadata when no code exists", () => {
    expect(buildMetadata({ ...resolved, googleVerificationCode: undefined }).verification).toBeUndefined();
  });

  it("creates non-empty local fallback metadata", () => {
    const fallback = fallbackResolvedSeo("/contact", { title: "Contact", description: "Reach out" });
    expect(fallback.metaTitle).toBe("Contact");
    expect(fallback.canonicalUrl).toContain("/contact");
  });
});
