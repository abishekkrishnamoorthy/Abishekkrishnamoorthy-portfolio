import { z } from "zod";
import { httpsUrlSchema } from "@/lib/validation/shared-schemas";

const emptyToUndefined = (value: unknown) => value === "" ? undefined : value;

export const robotsValues = ["index,follow", "noindex,follow", "index,nofollow", "noindex,nofollow"] as const;
export const robotsSchema = z.enum(robotsValues);

export const seoSchema = z.object({
  pagePath: z.string().trim().startsWith("/").max(160),
  metaTitle: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(70).optional()),
  metaDescription: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(180).optional()),
  ogImageUrl: z.preprocess(emptyToUndefined, httpsUrlSchema.optional()),
  canonicalUrl: z.preprocess(emptyToUndefined, httpsUrlSchema.optional()),
  ogTitle: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(70).optional()),
  ogDescription: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(180).optional()),
  robots: z.preprocess(emptyToUndefined, robotsSchema.optional()),
});
export type SeoFormValues = z.infer<typeof seoSchema>;

export const globalSeoSchema = z.object({
  siteName: z.string().trim().min(1).max(120),
  siteUrl: httpsUrlSchema,
  defaultMetaTitle: z.string().trim().min(1).max(70),
  titleTemplate: z.string().trim().min(1).max(120).refine((value) => value.includes("%page%"), 'Title template must include "%page%"'),
  defaultMetaDescription: z.string().trim().min(1).max(180),
  defaultAuthor: z.string().trim().min(1).max(120),
  defaultRobots: robotsSchema,
  googleVerificationCode: z.preprocess(emptyToUndefined, z.string().trim().max(120).optional()),
  defaultOgImageUrl: z.preprocess(emptyToUndefined, httpsUrlSchema.optional()),
  defaultFaviconUrl: z.preprocess(emptyToUndefined, httpsUrlSchema.optional()),
});
export type GlobalSeoFormValues = z.infer<typeof globalSeoSchema>;
