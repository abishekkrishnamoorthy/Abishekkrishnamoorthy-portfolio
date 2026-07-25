import { z } from "zod";
import { urlSchema } from "@/common/validation.js";

export const seoPayloadSchema = z.object({
  pagePath: z.string().trim().startsWith("/").max(160),
  metaTitle: z.string().trim().min(5).max(70),
  metaDescription: z.string().trim().min(20).max(180),
  ogImageUrl: urlSchema.optional(),
  canonicalUrl: z.string().url().max(300).optional(),
});

export const updateSeoSchema = seoPayloadSchema.partial();
