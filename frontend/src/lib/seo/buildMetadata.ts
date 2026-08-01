import type { Metadata } from "next";
import { site } from "@/constants/site";
import type { ResolvedSeo, RobotsValue } from "@/types/seo.types";

function robotsMetadata(value: RobotsValue) {
  const parts = new Set(value.split(","));
  return {
    index: !parts.has("noindex"),
    follow: !parts.has("nofollow"),
  };
}

export function buildMetadata(resolved: ResolvedSeo): Metadata {
  const images = resolved.ogImageUrl ? [resolved.ogImageUrl] : undefined;
  return {
    title: resolved.metaTitle,
    description: resolved.metaDescription,
    alternates: { canonical: resolved.canonicalUrl },
    robots: robotsMetadata(resolved.robots),
    openGraph: {
      title: resolved.ogTitle,
      description: resolved.ogDescription,
      url: resolved.canonicalUrl,
      siteName: resolved.siteName,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: resolved.ogTitle,
      description: resolved.ogDescription,
      images,
    },
    icons: resolved.defaultFaviconUrl ? { icon: resolved.defaultFaviconUrl } : undefined,
    verification: resolved.googleVerificationCode ? { google: resolved.googleVerificationCode } : undefined,
  };
}

export function fallbackResolvedSeo(path: string, fallback: { title?: string; description?: string; imageUrl?: string } = {}): ResolvedSeo {
  const canonicalUrl = `${site.url}${path === "/" ? "" : path}`;
  const title = fallback.title || site.name;
  const description = fallback.description || site.description;
  return {
    path,
    metaTitle: title,
    metaDescription: description,
    canonicalUrl,
    robots: "index,follow",
    ogTitle: title,
    ogDescription: description,
    ...(fallback.imageUrl || site.defaultOgImage ? { ogImageUrl: fallback.imageUrl || site.defaultOgImage } : {}),
    author: site.name,
    siteName: site.name,
    siteUrl: site.url,
    hasPageOverride: false,
  };
}
