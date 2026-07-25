import { z } from "zod";
import { dateStringSchema } from "@/common/validation.js";

export const experiencePayloadSchema = z.object({
  role: z.string().trim().min(2).max(80),
  company: z.string().trim().min(2).max(80),
  location: z.string().trim().min(2).max(80),
  startDate: dateStringSchema,
  endDate: dateStringSchema.nullable().optional(),
  description: z.string().trim().min(20).max(800),
  techTags: z.array(z.string().trim().min(1).max(24)).max(12).default([]),
  orderIndex: z.number().int().min(0),
  publishStatus: z.enum(["draft", "published"]).default("draft"),
});

export const updateExperienceSchema = experiencePayloadSchema.partial();
export const reorderExperienceSchema = z.object({ items: z.array(z.object({ id: z.string(), orderIndex: z.number().int().min(0) })) });
