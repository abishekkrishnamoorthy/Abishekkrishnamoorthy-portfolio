import type { z } from "zod";
import type { articleBlockSchema } from "@/modules/blog/blog.validation.js";

function blockText(block: z.infer<typeof articleBlockSchema>): string {
  switch (block.type) {
    case "heading":
    case "paragraph":
    case "quote":
      return block.text;
    case "callout":
      return `${block.title ?? ""} ${block.text}`;
    case "points":
    case "bullet-list":
    case "numbered-list":
      return block.items.join(" ");
    case "checklist":
      return block.items.map((item: { text: string }) => item.text).join(" ");
    case "table":
      return [...block.columns, ...block.rows.flat()].join(" ");
    case "code":
      return block.code;
    case "markdown":
      return block.content;
    case "formula":
      return block.latex;
    case "mermaid":
      return `${block.code} ${block.caption ?? ""}`;
    case "audio":
      return `${block.title} ${block.caption ?? ""}`;
    case "bookmark":
      return `${block.title} ${block.description ?? ""} ${block.siteName ?? ""}`;
    case "image":
    case "video":
    case "pdf":
    case "docx":
    case "ppt":
    case "zip":
    case "github-link":
    case "live-demo":
    case "documentation":
    case "research-paper":
    case "youtube":
    case "google-drive":
    case "button":
      return `${"title" in block ? block.title ?? "" : ""} ${"description" in block ? block.description ?? "" : ""}`;
    case "gallery":
      return block.images.map((image: { alt: string; caption?: string }) => `${image.alt} ${image.caption ?? ""}`).join(" ");
    case "divider":
      return "";
  }
  return "";
}

export function calculateReadTimeMinutes(blocks: Array<z.infer<typeof articleBlockSchema>>) {
  const words = blocks.flatMap((block) => blockText(block).trim().split(/\s+/).filter(Boolean)).length;
  return Math.max(1, Math.min(60, Math.ceil(words / 220)));
}
