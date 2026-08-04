export type ArticleBlockType =
  | "heading"
  | "paragraph"
  | "image"
  | "gallery"
  | "video"
  | "code"
  | "quote"
  | "divider"
  | "callout"
  | "table"
  | "points"
  | "bullet-list"
  | "numbered-list"
  | "checklist"
  | "pdf"
  | "docx"
  | "ppt"
  | "zip"
  | "github-link"
  | "live-demo"
  | "documentation"
  | "research-paper"
  | "youtube"
  | "google-drive"
  | "button"
  | "markdown"
  | "formula"
  | "mermaid"
  | "audio"
  | "bookmark";

export type CalloutVariant = "info" | "success" | "warning" | "danger";

type ArticleBlockBase = {
  id: string;
  type: ArticleBlockType;
};

export type HeadingBlock = ArticleBlockBase & {
  type: "heading";
  level: 1 | 2 | 3 | 4;
  text: string;
};

export type ParagraphBlock = ArticleBlockBase & {
  type: "paragraph";
  text: string;
};

export type ImageBlock = ArticleBlockBase & {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
};

export type GalleryBlock = ArticleBlockBase & {
  type: "gallery";
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
};

export type VideoBlock = ArticleBlockBase & {
  type: "video";
  provider: "youtube" | "uploaded";
  src: string;
  title: string;
  caption?: string;
  thumbnailUrl?: string;
};

export type CodeBlock = ArticleBlockBase & {
  type: "code";
  language: string;
  filename?: string;
  code: string;
};

export type QuoteBlock = ArticleBlockBase & {
  type: "quote";
  text: string;
  author?: string;
};

export type DividerBlock = ArticleBlockBase & {
  type: "divider";
};

export type CalloutBlock = ArticleBlockBase & {
  type: "callout";
  variant: CalloutVariant;
  title?: string;
  text: string;
};

export type TableBlock = ArticleBlockBase & {
  type: "table";
  columns: string[];
  rows: string[][];
};

export type PointsBlock = ArticleBlockBase & {
  type: "points";
  items: string[];
  style?: "bullet" | "number" | "letter";
};

export type ListBlock = ArticleBlockBase & {
  type: "bullet-list" | "numbered-list";
  items: string[];
};

export type ChecklistBlock = ArticleBlockBase & {
  type: "checklist";
  items: Array<{
    text: string;
    checked: boolean;
  }>;
};

export type FileBlock = ArticleBlockBase & {
  type: "pdf" | "docx" | "ppt" | "zip";
  title: string;
  description?: string;
  href: string;
};

export type LinkBlock = ArticleBlockBase & {
  type: "github-link" | "live-demo" | "documentation" | "research-paper" | "youtube" | "google-drive";
  title: string;
  description?: string;
  href: string;
};

export type ButtonBlock = ArticleBlockBase & {
  type: "button";
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

export type MarkdownBlock = ArticleBlockBase & {
  type: "markdown";
  content: string;
};

export type FormulaBlock = ArticleBlockBase & {
  type: "formula";
  latex: string;
  displayMode: boolean;
};

export type MermaidBlock = ArticleBlockBase & {
  type: "mermaid";
  code: string;
  caption?: string;
};

export type AudioBlock = ArticleBlockBase & {
  type: "audio";
  src: string;
  title: string;
  caption?: string;
};

export type BookmarkBlock = ArticleBlockBase & {
  type: "bookmark";
  href: string;
  title: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
};

export type ArticleBlock =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | GalleryBlock
  | VideoBlock
  | CodeBlock
  | QuoteBlock
  | DividerBlock
  | CalloutBlock
  | TableBlock
  | PointsBlock
  | ListBlock
  | ChecklistBlock
  | FileBlock
  | LinkBlock
  | ButtonBlock
  | MarkdownBlock
  | FormulaBlock
  | MermaidBlock
  | AudioBlock
  | BookmarkBlock;

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  author: string;
  tags: string[];
  coverImageUrl?: string;
  blocks: ArticleBlock[];
};

export type ArticlePreview = Pick<Article, "slug" | "title" | "excerpt" | "coverImageUrl" | "category" | "publishedAt" | "readTimeMinutes" | "tags">;

export type ArticleReference = Pick<Article, "slug" | "title"> & Partial<Pick<Article, "coverImageUrl" | "readTimeMinutes" | "category">>;

export type BlogListPayload = {
  featuredArticle: ArticlePreview | null;
  articles: ArticlePreview[];
  total: number;
};

export type BlogDetailPayload = {
  article: Article;
  relatedArticles: ArticleReference[];
  previous: ArticleReference | null;
  next: ArticleReference | null;
};

export type BlogsQuery = {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
};
