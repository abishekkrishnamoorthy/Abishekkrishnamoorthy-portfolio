import type { PublishStatus, NavItem } from "@/types/common.types";

export type ArticleBlock =
  | { id: string; type: "heading"; level: 1 | 2 | 3 | 4; text: string }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "image"; src: string; alt: string; caption?: string }
  | { id: string; type: "gallery"; images: Array<{ src: string; alt: string; caption?: string }> }
  | { id: string; type: "video"; provider: "youtube" | "uploaded"; src: string; title: string; caption?: string; thumbnailUrl?: string }
  | { id: string; type: "code"; language: string; filename?: string; code: string }
  | { id: string; type: "quote"; text: string; author?: string }
  | { id: string; type: "divider" }
  | { id: string; type: "callout"; variant: "info" | "success" | "warning" | "danger"; title?: string; text: string }
  | { id: string; type: "table"; columns: string[]; rows: string[][] }
  | { id: string; type: "bullet-list"; items: string[] }
  | { id: string; type: "numbered-list"; items: string[] }
  | { id: string; type: "checklist"; items: Array<{ text: string; checked: boolean }> }
  | { id: string; type: "pdf" | "docx" | "ppt" | "zip"; title: string; description?: string; href: string }
  | { id: string; type: "github-link" | "live-demo" | "documentation" | "research-paper" | "youtube" | "google-drive"; title: string; description?: string; href: string }
  | { id: string; type: "button"; label: string; href: string; variant?: "primary" | "secondary" }
  | { id: string; type: "markdown"; content: string }
  | { id: string; type: "formula"; latex: string; displayMode: boolean }
  | { id: string; type: "mermaid"; code: string; caption?: string }
  | { id: string; type: "audio"; src: string; title: string; caption?: string }
  | { id: string; type: "bookmark"; href: string; title: string; description?: string; imageUrl?: string; siteName?: string };

export type BlogArticle = {
  _id?: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes?: number;
  author: string;
  tags: string[];
  coverImageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  blocks: ArticleBlock[];
  editorDocument?: Array<Record<string, unknown>>;
  featured: boolean;
  publishStatus: PublishStatus;
  previous?: NavItem;
  next?: NavItem;
};
