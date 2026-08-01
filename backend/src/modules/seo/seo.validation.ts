import { z } from "zod";
import { httpsUrlSchema } from "@/common/validation.js";
import { robotsSchema } from "@/modules/settings/settings.validation.js";

export const seoPayloadSchema = z.object({
  pagePath: z.string().trim().startsWith("/").max(160),
  metaTitle: z.string().trim().min(1).max(70).optional(),
  metaDescription: z.string().trim().min(1).max(180).optional(),
  ogImageUrl: httpsUrlSchema.optional(),
  canonicalUrl: httpsUrlSchema.optional(),
  ogTitle: z.string().trim().min(1).max(70).optional(),
  ogDescription: z.string().trim().min(1).max(180).optional(),
  robots: robotsSchema.optional(),
});

export const updateSeoSchema = seoPayloadSchema.partial();
export const resolveSeoQuerySchema = z.object({ path: z.string().trim().startsWith("/").max(200) });
