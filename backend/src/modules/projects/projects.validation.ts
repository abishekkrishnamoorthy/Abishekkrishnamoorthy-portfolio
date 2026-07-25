import { z } from "zod";
import { projectCategories, projectSorts, projectStatuses, publishStatuses } from "@/config/constants.js";
import { dateStringSchema, httpsUrlSchema, slugSchema, urlSchema } from "@/common/validation.js";

const optionalImageUrlSchema = z.string().trim().max(300).refine((value) => !value || z.string().url().safeParse(value).success, "Must be a valid URL");
const showcaseOrderSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);

export const projectHeaderShowcaseImageSchema = z.object({
  imageUrl: optionalImageUrlSchema,
  label: z.string().trim().max(40),
  order: showcaseOrderSchema,
});

export const projectHeaderSchema = z.object({
  badge: z.string().trim().min(2).max(40),
  title: z.string().trim().min(3).max(70),
  highlightText: z.string().trim().min(3).max(70),
  description: z.string().trim().min(20).max(220),
  showcaseImages: z
    .array(projectHeaderShowcaseImageSchema)
    .length(5)
    .refine((items) => new Set(items.map((item) => item.order)).size === 5, "Showcase images must include one slot for each order from 1 to 5."),
});

export const projectHeaderImageUploadSchema = z.object({
  fileName: z.string().trim().min(1).max(160),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  data: z.string().min(1),
});

export const projectListQuerySchema = z.object({
  category: z.enum(["All", ...projectCategories]).default("All"),
  search: z.string().trim().max(80).optional().default(""),
  sort: z.enum(projectSorts).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(20).default(5),
  featured: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(12).optional(),
});

const techStackRowSchema = z.object({ category: z.string().trim().min(2).max(24), technologies: z.string().trim().min(2).max(120) });
const galleryImageSchema = z.object({
  url: urlSchema,
  caption: z.string().trim().max(80).optional(),
  alt: z.string().trim().max(140).optional(),
  title: z.string().trim().max(80).optional(),
  description: z.string().trim().max(240).optional(),
});

const projectPayloadBaseSchema = z.object({
  slug: slugSchema.max(80),
  orderIndex: z.number().int().min(0),
  title: z.string().trim().min(3).max(48),
  tagline: z.string().trim().min(10).max(70),
  shortDescription: z.string().trim().min(30).max(140),
  description: z.string().trim().min(40).max(220),
  status: z.enum(projectStatuses),
  category: z.enum(projectCategories),
  thumbnailUrl: urlSchema,
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
  techStackTable: z.array(techStackRowSchema).min(1).max(8),
  gallery: z.array(galleryImageSchema).max(10).default([]),
  architectureNotes: z.string().trim().min(40).max(700),
  challenges: z.array(z.string().trim().min(1).max(120)).min(1).max(6),
  solutions: z.array(z.string().trim().min(1).max(120)).min(1).max(6),
  learningOutcomes: z.array(z.string().trim().min(1).max(120)).min(1).max(6),
  architectureDiagramUrl: urlSchema.optional(),
  isFeatured: z.boolean().default(false),
  publishStatus: z.enum(publishStatuses).default("draft"),
});

export const projectPayloadSchema = projectPayloadBaseSchema.superRefine((value, context) => {
  if (value.publishStatus === "published" && value.gallery.length < 3) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["gallery"],
      message: "Published projects need at least 3 screenshots.",
    });
  }
});

export const updateProjectSchema = projectPayloadBaseSchema.partial().superRefine((value, context) => {
  if (value.publishStatus === "published" && Array.isArray(value.gallery) && value.gallery.length < 3) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["gallery"],
      message: "Published projects need at least 3 screenshots.",
    });
  }
});
export const reorderProjectsSchema = z.object({ items: z.array(z.object({ slug: slugSchema, orderIndex: z.number().int().min(0) })) });
export const publishProjectSchema = z.object({ publishStatus: z.enum(publishStatuses) });
