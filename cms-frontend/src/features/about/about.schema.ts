import { z } from "zod";
import { articleBlockSchema } from "@/features/blogs/blogs.schema";
import { urlSchema } from "@/lib/validation/shared-schemas";

export const aboutSchema = z.object({
  bio: z.array(articleBlockSchema).max(80).default([]),
  profileImage: z.object({ url: urlSchema, alt: z.string().trim().min(5).max(140) }).optional(),
  resumeUrl: urlSchema.optional(),
  highlights: z.array(z.string().trim().min(1).max(120)).max(12).default([]),
});
export type AboutFormValues = z.infer<typeof aboutSchema>;
