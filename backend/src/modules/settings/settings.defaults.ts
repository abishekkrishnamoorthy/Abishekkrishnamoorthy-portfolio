export const robotsValues = ["index,follow", "noindex,follow", "index,nofollow", "noindex,nofollow"] as const;

export type RobotsValue = (typeof robotsValues)[number];

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

export const DEFAULT_GLOBAL_SEO: GlobalSeo = {
  siteName: "Abishek Krishnamoorthy",
  siteUrl: "https://abishekkrishnamoorthy.online",
  defaultMetaTitle: "Abishek Krishnamoorthy - Full-Stack Developer",
  titleTemplate: "%page% | Abishek Krishnamoorthy",
  defaultMetaDescription: "Full-stack developer portfolio featuring projects, articles, and experience.",
  defaultAuthor: "Abishek Krishnamoorthy",
  defaultRobots: "index,follow",
};
