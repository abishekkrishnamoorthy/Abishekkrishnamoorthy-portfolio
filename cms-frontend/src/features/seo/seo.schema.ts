import { z } from "zod";
import { urlSchema } from "@/lib/validation/shared-schemas";

export const seoSchema = z.object({
  pagePath: z.string().trim().startsWith("/").max(160),
  metaTitle: z.string().trim().min(5).max(70),
  metaDescription: z.string().trim().min(20).max(180),
  ogImageUrl: z.preprocess((value) => value === "" ? undefined : value, urlSchema.optional()),
  canonicalUrl: z.preprocess((value) => value === "" ? undefined : value, z.string().url().max(300).optional()),
});
export type SeoFormValues = z.infer<typeof seoSchema>;
