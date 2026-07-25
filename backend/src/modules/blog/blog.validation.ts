import { z } from "zod";
import { calloutVariants } from "@/config/constants.js";
import { dateStringSchema, httpsUrlSchema, slugSchema, urlSchema } from "@/common/validation.js";

const blockBase = z.object({ id: z.string().trim().min(1).max(60) });
const imageSchema = z.object({ src: urlSchema, alt: z.string().trim().min(5).max(140), caption: z.string().trim().max(140).optional() });
const editorDocumentSchema = z.array(z.record(z.string(), z.unknown())).max(120).optional();

export const headingBlockSchema = blockBase.extend({ type: z.literal("heading"), level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]), text: z.string().trim().min(3).max(90) });
export const paragraphBlockSchema = blockBase.extend({ type: z.literal("paragraph"), text: z.string().trim().min(20).max(900) });
export const imageBlockSchema = blockBase.extend({ type: z.literal("image"), ...imageSchema.shape });
export const galleryBlockSchema = blockBase.extend({ type: z.literal("gallery"), images: z.array(imageSchema).min(1).max(9) });
export const videoBlockSchema = blockBase.extend({
  type: z.literal("video"),
  provider: z.enum(["youtube", "uploaded"]).default("youtube"),
  src: z.string().trim().min(1).max(300),
  title: z.string().trim().min(5).max(100),
  caption: z.string().trim().max(140).optional(),
  thumbnailUrl: urlSchema.optional(),
});
export const codeBlockSchema = blockBase.extend({ type: z.literal("code"), language: z.string().trim().min(1).max(24).default("text"), filename: z.string().trim().max(80).optional(), code: z.string().min(1).max(12000) });
export const quoteBlockSchema = blockBase.extend({ type: z.literal("quote"), text: z.string().trim().min(10).max(400), author: z.string().trim().max(80).optional() });
export const dividerBlockSchema = blockBase.extend({ type: z.literal("divider") });
export const calloutBlockSchema = blockBase.extend({ type: z.literal("callout"), variant: z.enum(calloutVariants).default("info"), title: z.string().trim().max(80).optional(), text: z.string().trim().min(10).max(500) });
export const tableBlockSchema = blockBase.extend({ type: z.literal("table"), columns: z.array(z.string().trim().min(1).max(40)).min(2).max(6), rows: z.array(z.array(z.string().trim().max(160))).min(1).max(30) });
export const bulletListBlockSchema = blockBase.extend({ type: z.literal("bullet-list"), items: z.array(z.string().trim().min(1).max(180)).min(1).max(20) });
export const numberedListBlockSchema = blockBase.extend({ type: z.literal("numbered-list"), items: z.array(z.string().trim().min(1).max(180)).min(1).max(20) });
export const checklistBlockSchema = blockBase.extend({ type: z.literal("checklist"), items: z.array(z.object({ text: z.string().trim().min(1).max(160), checked: z.boolean() })).min(1).max(20) });
const fileShape = { title: z.string().trim().min(3).max(80), description: z.string().trim().max(180).optional(), href: z.string().trim().min(1).max(300) };
export const pdfBlockSchema = blockBase.extend({ type: z.literal("pdf"), ...fileShape });
export const docxBlockSchema = blockBase.extend({ type: z.literal("docx"), ...fileShape });
export const pptBlockSchema = blockBase.extend({ type: z.literal("ppt"), ...fileShape });
export const zipBlockSchema = blockBase.extend({ type: z.literal("zip"), ...fileShape });
const linkShape = { title: z.string().trim().min(3).max(80), description: z.string().trim().max(180).optional(), href: httpsUrlSchema };
export const githubLinkBlockSchema = blockBase.extend({ type: z.literal("github-link"), ...linkShape });
export const liveDemoBlockSchema = blockBase.extend({ type: z.literal("live-demo"), ...linkShape });
export const documentationBlockSchema = blockBase.extend({ type: z.literal("documentation"), ...linkShape });
export const researchPaperBlockSchema = blockBase.extend({ type: z.literal("research-paper"), ...linkShape });
export const youtubeBlockSchema = blockBase.extend({ type: z.literal("youtube"), ...linkShape });
export const googleDriveBlockSchema = blockBase.extend({ type: z.literal("google-drive"), ...linkShape });
export const buttonBlockSchema = blockBase.extend({ type: z.literal("button"), label: z.string().trim().min(2).max(32), href: httpsUrlSchema, variant: z.enum(["primary", "secondary"]).default("primary").optional() });
export const markdownBlockSchema = blockBase.extend({ type: z.literal("markdown"), content: z.string().min(1).max(12000) });
export const formulaBlockSchema = blockBase.extend({ type: z.literal("formula"), latex: z.string().trim().min(1).max(1000), displayMode: z.boolean().default(true) });
export const mermaidBlockSchema = blockBase.extend({ type: z.literal("mermaid"), code: z.string().trim().min(1).max(6000), caption: z.string().trim().max(140).optional() });
export const audioBlockSchema = blockBase.extend({ type: z.literal("audio"), src: z.string().trim().min(1).max(300), title: z.string().trim().min(3).max(100), caption: z.string().trim().max(140).optional() });
export const bookmarkBlockSchema = blockBase.extend({ type: z.literal("bookmark"), href: httpsUrlSchema, title: z.string().trim().min(3).max(120), description: z.string().trim().max(240).optional(), imageUrl: urlSchema.optional(), siteName: z.string().trim().max(80).optional() });

export const articleBlockSchema = z.discriminatedUnion("type", [
  headingBlockSchema,
  paragraphBlockSchema,
  imageBlockSchema,
  galleryBlockSchema,
  videoBlockSchema,
  codeBlockSchema,
  quoteBlockSchema,
  dividerBlockSchema,
  calloutBlockSchema,
  tableBlockSchema,
  bulletListBlockSchema,
  numberedListBlockSchema,
  checklistBlockSchema,
  pdfBlockSchema,
  docxBlockSchema,
  pptBlockSchema,
  zipBlockSchema,
  githubLinkBlockSchema,
  liveDemoBlockSchema,
  documentationBlockSchema,
  researchPaperBlockSchema,
  youtubeBlockSchema,
  googleDriveBlockSchema,
  buttonBlockSchema,
  markdownBlockSchema,
  formulaBlockSchema,
  mermaidBlockSchema,
  audioBlockSchema,
  bookmarkBlockSchema,
]);

export const blogListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(20).default(9),
  category: z.string().trim().max(20).optional(),
  search: z.string().trim().max(80).optional(),
});

const articlePayloadBaseSchema = z.object({
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
  editorDocument: editorDocumentSchema,
  featured: z.boolean().default(false),
  publishStatus: z.enum(["draft", "published"]).default("draft"),
});

export const articlePayloadSchema = articlePayloadBaseSchema.superRefine((value, context) => {
  if (value.publishStatus !== "published") return;
  if (!value.blocks.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["blocks"], message: "Published articles need at least one content block." });
  }
});

export const updateArticleSchema = articlePayloadBaseSchema.partial().superRefine((value, context) => {
  if (value.publishStatus !== "published") return;
  if (Array.isArray(value.blocks) && !value.blocks.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["blocks"], message: "Published articles need at least one content block." });
  }
});
export const publishArticleSchema = z.object({ publishStatus: z.enum(["draft", "published"]) });
export const blockParamsSchema = z.object({ slug: slugSchema, blockId: z.string().min(1).max(60).optional() });
export const blockReorderSchema = z.object({ blockIds: z.array(z.string().min(1).max(60)).min(1) });
