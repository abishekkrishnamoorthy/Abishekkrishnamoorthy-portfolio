import { z } from "zod";
import { dateStringSchema, httpsUrlSchema, slugSchema, urlSchema } from "@/lib/validation/shared-schemas";

export const projectCategories = ["Full Stack", "Frontend", "Backend", "AI", "Cloud", "Learning"] as const;
export const projectStatuses = ["completed", "in-progress", "production"] as const;
const row = z.object({ category: z.string().trim().min(2).max(24), technologies: z.string().trim().min(2).max(120) });
const localPreviewUrlSchema = z.union([urlSchema, z.string().max(300).startsWith("blob:")]);
const gallery = z.object({
  url: localPreviewUrlSchema,
  caption: z.string().trim().max(80).optional(),
  alt: z.string().trim().max(140).optional(),
  title: z.string().trim().max(80).optional(),
  description: z.string().trim().max(240).optional(),
});

const projectSchemaBase = z.object({
  slug: slugSchema.max(80),
  orderIndex: z.number().int().min(0),
  title: z.string().trim().min(3).max(48),
  tagline: z.string().trim().min(10).max(70),
  shortDescription: z.string().trim().min(30).max(140),
  description: z.string().trim().min(40).max(220),
  status: z.enum(projectStatuses),
  category: z.enum(projectCategories),
  thumbnailUrl: localPreviewUrlSchema,
  techTags: z.array(z.string().trim().min(1).max(20)).min(1).max(8),
  highlights: z.array(z.string().trim().min(1).max(70)).min(1).max(4),
  liveDemoUrl: httpsUrlSchema,
  githubUrl: httpsUrlSchema,
  durationLabel: z.string().trim().min(2).max(24),
  role: z.string().trim().min(3).max(35),
  lastUpdatedAt: dateStringSchema,
  techIcons: z.array(z.string().trim().min(1).max(8)).min(1).max(5),
  readmeMarkdown: z.string().max(8000),
  projectStructure: z.string().max(5000),
  techStackTable: z.array(row).min(1).max(8),
  gallery: z.array(gallery).max(10).default([]),
  architectureNotes: z.string().trim().min(40).max(700),
  challenges: z.array(z.string().trim().min(1).max(120)).min(1).max(6),
  solutions: z.array(z.string().trim().min(1).max(120)).min(1).max(6),
  learningOutcomes: z.array(z.string().trim().min(1).max(120)).min(1).max(6),
  architectureDiagramUrl: urlSchema.optional(),
  isFeatured: z.boolean().default(false),
  publishStatus: z.enum(["draft", "published"]).default("published"),
});

export const projectSchema = projectSchemaBase.superRefine((value, context) => {
  if (value.publishStatus === "published" && value.gallery.length < 3) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["gallery"],
      message: "Published projects need at least 3 screenshots.",
    });
  }
});
export type ProjectFormValues = z.infer<typeof projectSchema>;
