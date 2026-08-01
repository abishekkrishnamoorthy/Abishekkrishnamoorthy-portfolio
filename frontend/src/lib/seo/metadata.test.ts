import { beforeEach, describe, expect, it, vi } from "vitest";
import { metadataForPath } from "@/lib/seo/metadata";
import { resolveSeo } from "@/services/seo.service";
import type { ResolvedSeo } from "@/types/seo.types";

vi.mock("@/services/seo.service", () => ({
  resolveSeo: vi.fn(),
}));

const resolved: ResolvedSeo = {
  path: "/contact",
  metaTitle: "CMS Global Title",
  metaDescription: "CMS global description.",
  canonicalUrl: "https://example.com/contact",
  robots: "index,follow",
  ogTitle: "CMS OG Title",
  ogDescription: "CMS OG description.",
  ogImageUrl: "https://res.cloudinary.com/demo/image/upload/v1/seo/default.png",
  author: "Abishek",
  siteName: "CMS Site",
  siteUrl: "https://example.com",
  googleVerificationCode: "token",
  hasPageOverride: false,
};

const resolveSeoMock = vi.mocked(resolveSeo);

describe("metadataForPath", () => {
  beforeEach(() => {
    resolveSeoMock.mockReset();
  });

  it("uses successful CMS resolved SEO without route fallback overrides", async () => {
    resolveSeoMock.mockResolvedValue(resolved);

    const metadata = await metadataForPath("/contact", {
      title: "Hardcoded Contact Title",
      description: "Hardcoded contact description.",
      imageUrl: "https://example.com/hardcoded.png",
    });

    expect(metadata.title).toBe("CMS Global Title");
    expect(metadata.description).toBe("CMS global description.");
    expect(metadata.openGraph).toMatchObject({
      title: "CMS OG Title",
      description: "CMS OG description.",
      images: ["https://res.cloudinary.com/demo/image/upload/v1/seo/default.png"],
    });
  });

  it("uses route fallback metadata only when the SEO API fails", async () => {
    resolveSeoMock.mockRejectedValue(new Error("network"));

    const metadata = await metadataForPath("/contact", {
      title: "Hardcoded Contact Title",
      description: "Hardcoded contact description.",
      imageUrl: "https://example.com/hardcoded.png",
    });

    expect(metadata.title).toBe("Hardcoded Contact Title");
    expect(metadata.description).toBe("Hardcoded contact description.");
    expect(metadata.openGraph).toMatchObject({
      title: "Hardcoded Contact Title",
      description: "Hardcoded contact description.",
      images: ["https://example.com/hardcoded.png"],
    });
  });
});
