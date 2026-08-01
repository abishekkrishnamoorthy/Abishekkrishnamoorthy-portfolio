export type RobotsValue = "index,follow" | "noindex,follow" | "index,nofollow" | "noindex,nofollow";

export type GlobalSeo = {
  siteName: string;
  siteUrl: string;
  defaultMetaTitle: string;
  titleTemplate: string;
  defaultMetaDescription: string;
  defaultAuthor: string;
  defaultRobots: RobotsValue;
  googleVerificationCode?: string;
  defaultOgImageUrl?: string;
  defaultFaviconUrl?: string;
};

export type ResolvedSeo = {
  path: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  robots: RobotsValue;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl?: string;
  author: string;
  siteName: string;
  siteUrl: string;
  googleVerificationCode?: string;
  defaultFaviconUrl?: string;
  hasPageOverride: boolean;
};

export type SeoPageSummary = {
  pagePath: string;
  robots?: RobotsValue;
  updatedAt: string;
};
