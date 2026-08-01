import type { MetadataRoute } from "next";
import { site } from "@/constants/site";
import { getSeoPages } from "@/services/seo.service";

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const pages = await getSeoPages().catch(() => []);
  const disallow = pages.filter((page) => page.robots?.includes("noindex")).map((page) => page.pagePath);
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      ...(disallow.length ? { disallow } : {}),
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
