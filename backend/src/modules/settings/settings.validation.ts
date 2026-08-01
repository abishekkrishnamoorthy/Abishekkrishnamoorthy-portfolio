import { z } from "zod";
import { httpsUrlSchema } from "@/common/validation.js";

export const robotsSchema = z.enum(["index,follow", "noindex,follow", "index,nofollow", "noindex,nofollow"]);

export const globalSeoSchema = z.object({
  siteName: z.string().trim().min(1).max(120).optional(),
  siteUrl: httpsUrlSchema.optional(),
  defaultMetaTitle: z.string().trim().min(1).max(70).optional(),
  titleTemplate: z.string().trim().min(1).max(120).includes("%page%", { message: 'Title template must include "%page%"' }).optional(),
  defaultMetaDescription: z.string().trim().min(1).max(180).optional(),
  defaultAuthor: z.string().trim().min(1).max(120).optional(),
  defaultRobots: robotsSchema.optional(),
  googleVerificationCode: z.string().trim().max(120).optional(),
  defaultOgImageUrl: httpsUrlSchema.optional(),
  defaultFaviconUrl: httpsUrlSchema.optional(),
});

export const settingsPayloadSchema = z
  .object({
    seo: globalSeoSchema.optional(),
    forms: z.record(z.unknown()).optional(),
    scheduling: z.record(z.unknown()).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "At least one settings field is required");
