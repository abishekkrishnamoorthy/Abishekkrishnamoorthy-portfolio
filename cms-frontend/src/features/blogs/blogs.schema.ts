import { z } from "zod";
import { dateStringSchema, httpsUrlSchema, slugSchema, urlSchema } from "@/lib/validation/shared-schemas";

const blockBase = z.object({ id: z.string().trim().min(1).max(60) });
const image = z.object({ src: urlSchema, alt: z.string().trim().min(5).max(140), caption: z.string().trim().max(140).optional() });
const fileShape = { title: z.string().trim().min(3).max(80), description: z.string().trim().max(180).optional(), href: z.string().trim().min(1).max(300) };
const linkShape = { title: z.string().trim().min(3).max(80), description: z.string().trim().max(180).optional(), href: httpsUrlSchema };
const editorDocument = z.array(z.record(z.string(), z.unknown())).max(120).optional();
const pointsStyle = z.enum(["bullet", "number", "letter"]).optional();

export const articleBlockSchema = z.discriminatedUnion("type", [
  blockBase.extend({ type: z.literal("heading"), level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]), text: z.string().trim().min(3).max(90) }),
  blockBase.extend({ type: z.literal("paragraph"), text: z.string().trim().min(20).max(900) }),
  blockBase.extend({ type: z.literal("image"), ...image.shape }),
  blockBase.extend({ type: z.literal("gallery"), images: z.array(image).min(1).max(9) }),
  blockBase.extend({ type: z.literal("video"), provider: z.enum(["youtube", "uploaded"]).default("youtube"), src: z.string().trim().min(1).max(300), title: z.string().trim().min(5).max(100), caption: z.string().trim().max(140).optional(), thumbnailUrl: urlSchema.optional() }),
  blockBase.extend({ type: z.literal("code"), language: z.string().trim().min(1).max(24).default("text"), filename: z.string().trim().max(80).optional(), code: z.string().min(1).max(12000) }),
  blockBase.extend({ type: z.literal("quote"), text: z.string().trim().min(10).max(400), author: z.string().trim().max(80).optional() }),
  blockBase.extend({ type: z.literal("divider") }),
  blockBase.extend({ type: z.literal("callout"), variant: z.enum(["info", "success", "warning", "danger"]).default("info"), title: z.string().trim().max(80).optional(), text: z.string().trim().min(10).max(500) }),
  blockBase.extend({ type: z.literal("table"), columns: z.array(z.string().trim().min(1).max(40)).min(2).max(6), rows: z.array(z.array(z.string().trim().max(160))).min(1).max(30) }),
  blockBase.extend({ type: z.literal("points"), items: z.array(z.string().trim().min(1).max(180)).min(1).max(20), style: pointsStyle }),
  blockBase.extend({ type: z.literal("bullet-list"), items: z.array(z.string().trim().min(1).max(180)).min(1).max(20) }),
  blockBase.extend({ type: z.literal("numbered-list"), items: z.array(z.string().trim().min(1).max(180)).min(1).max(20) }),
  blockBase.extend({ type: z.literal("checklist"), items: z.array(z.object({ text: z.string().trim().min(1).max(160), checked: z.boolean() })).min(1).max(20) }),
  blockBase.extend({ type: z.enum(["pdf", "docx", "ppt", "zip"]), ...fileShape }),
  blockBase.extend({ type: z.enum(["github-link", "live-demo", "documentation", "research-paper", "youtube", "google-drive"]), ...linkShape }),
  blockBase.extend({ type: z.literal("button"), label: z.string().trim().min(2).max(32), href: httpsUrlSchema, variant: z.enum(["primary", "secondary"]).default("primary").optional() }),
  blockBase.extend({ type: z.literal("markdown"), content: z.string().min(1).max(12000) }),
  blockBase.extend({ type: z.literal("formula"), latex: z.string().trim().min(1).max(1000), displayMode: z.boolean().default(true) }),
  blockBase.extend({ type: z.literal("mermaid"), code: z.string().trim().min(1).max(6000), caption: z.string().trim().max(140).optional() }),
  blockBase.extend({ type: z.literal("audio"), src: z.string().trim().min(1).max(300), title: z.string().trim().min(3).max(100), caption: z.string().trim().max(140).optional() }),
  blockBase.extend({ type: z.literal("bookmark"), href: httpsUrlSchema, title: z.string().trim().min(3).max(120), description: z.string().trim().max(240).optional(), imageUrl: urlSchema.optional(), siteName: z.string().trim().max(80).optional() }),
]);

const blogSchemaBase = z.object({
  slug: slugSchema,
  title: z.string().trim().min(8).max(72),
  excerpt: z.string().trim().min(40).max(180),
  category: z.string().trim().min(2).max(20),
  publishedAt: dateStringSchema,
  updatedAt: dateStringSchema,
  readTimeMinutes: z.number().int().min(1).max(60).optional(),
  author: z.string().trim().min(2).max(60).default("Abishek Krishnamoorthy"),
  tags: z.array(z.string().trim().min(1).max(20)).max(8),
  coverImageUrl: urlSchema.optional(),
  seoTitle: z.string().trim().max(72).optional(),
  seoDescription: z.string().trim().max(180).optional(),
  canonicalUrl: httpsUrlSchema.optional(),
  ogImageUrl: urlSchema.optional(),
  blocks: z.array(articleBlockSchema).max(80),
  editorDocument,
  featured: z.boolean().default(false),
  publishStatus: z.enum(["draft", "published"]).default("draft"),
});

export const blogSchema = blogSchemaBase.superRefine((value, context) => {
  if (value.publishStatus === "published" && !value.blocks.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["blocks"], message: "Published articles need at least one content block." });
  }
});
export type BlogFormValues = z.infer<typeof blogSchema>;
