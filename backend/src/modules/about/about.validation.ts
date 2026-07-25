import { z } from "zod";
import { articleBlockSchema } from "@/modules/blog/blog.validation.js";
import { urlSchema } from "@/common/validation.js";

export const aboutPayloadSchema = z.object({
  bio: z.array(articleBlockSchema).max(80).default([]),
  profileImage: z.object({ url: urlSchema, alt: z.string().trim().min(5).max(140) }).optional(),
  resumeUrl: urlSchema.optional(),
  highlights: z.array(z.string().trim().min(1).max(120)).max(12).default([]),
});
