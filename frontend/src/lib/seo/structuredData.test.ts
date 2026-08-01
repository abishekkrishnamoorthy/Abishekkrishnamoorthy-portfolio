import { describe, expect, it } from "vitest";
import { buildPersonJsonLd, buildWebSiteJsonLd } from "@/lib/seo/structuredData";
import type { ContactContent } from "@/types/contact.types";
import type { GlobalSeo } from "@/types/seo.types";

const globalSeo: GlobalSeo = {
  siteName: "Portfolio",
  siteUrl: "https://example.com",
  defaultMetaTitle: "Portfolio",
  titleTemplate: "%page% | Portfolio",
  defaultMetaDescription: "CMS-managed portfolio description.",
  defaultAuthor: "Abishek",
  defaultRobots: "index,follow",
  defaultOgImageUrl: "https://res.cloudinary.com/demo/image/upload/v1/portfolio/seo/default.png",
};

describe("structured data helpers", () => {
  it("builds Website JSON-LD from Global SEO values", () => {
    expect(buildWebSiteJsonLd(globalSeo)).toMatchObject({
      "@type": "WebSite",
      name: "Portfolio",
      url: "https://example.com",
      description: "CMS-managed portfolio description.",
      image: "https://res.cloudinary.com/demo/image/upload/v1/portfolio/seo/default.png",
    });
  });

  it("builds Person JSON-LD from Global SEO and omits empty contact fields", () => {
    const person = buildPersonJsonLd(globalSeo);
    expect(person).toMatchObject({
      "@type": "Person",
      name: "Abishek",
      url: "https://example.com",
      image: "https://res.cloudinary.com/demo/image/upload/v1/portfolio/seo/default.png",
    });
    expect(person).not.toHaveProperty("email");
  });

  it("includes visible social profile URLs", () => {
    const contact: ContactContent = {
      hero: { title: "Contact", description: "Contact me" },
      contact: { email: { label: "Email", value: "hello@example.com", visible: true }, location: { label: "Location", value: "Remote", visible: true } },
      communicationMethods: [],
      socialLinks: [{ platform: "GitHub", icon: "github", displayOrder: 1, visible: true, profileUrl: "https://github.com/example" }],
    };
    expect(buildPersonJsonLd(globalSeo, contact)).toMatchObject({ email: "hello@example.com", sameAs: ["https://github.com/example"] });
  });

  it("omits optional image when Global SEO has no image", () => {
    expect(buildWebSiteJsonLd({ ...globalSeo, defaultOgImageUrl: undefined })).not.toHaveProperty("image");
    expect(buildPersonJsonLd({ ...globalSeo, defaultOgImageUrl: undefined })).not.toHaveProperty("image");
  });
});
