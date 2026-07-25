import { z } from "zod";

export const skillsSchema = z.object({
  categories: z.array(z.object({
    id: z.enum(["frontend", "backend", "ai-tools-cloud"]),
    title: z.string().trim().min(3).max(24),
    items: z.array(z.string().trim().min(1).max(24)).min(3).max(8),
    orderIndex: z.number().int().min(0).default(0),
  })).min(1).max(3),
  learningItems: z.array(z.object({
    id: z.string().trim().min(1).max(40),
    label: z.string().trim().min(3).max(28),
    icon: z.enum(["Sparkles", "Cloud", "Network"]).default("Sparkles"),
    progressPercent: z.number().int().min(0).max(100),
    orderIndex: z.number().int().min(0).default(0),
  })).min(0).max(8),
});
export type SkillsFormValues = z.infer<typeof skillsSchema>;
