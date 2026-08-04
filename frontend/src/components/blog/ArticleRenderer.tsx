"use client";

import { AudioLines, Bookmark, Check, CheckCircle2, Clipboard, Code2, Download, ExternalLink, FileArchive, FileText, Info, LinkIcon, Play, Quote, ShieldAlert, Sigma, TriangleAlert, Workflow } from "lucide-react";
import hljs from "highlight.js/lib/common";
import Image from "next/image";
import { useState } from "react";
import rehypeHighlight from "rehype-highlight";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";
import type { ArticleBlock, CalloutVariant, FileBlock, LinkBlock } from "@/types/blog.types";

export function ArticleRenderer({ blocks }: { blocks: ArticleBlock[] }) {
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string; caption?: string } | null>(null);

  return (
    <>
      <div className="mx-auto flex w-full max-w-[780px] flex-col gap-9">
        {blocks.map((block) => (
          <ArticleBlockRenderer key={block.id} block={block} onLightbox={setLightboxImage} />
        ))}
      </div>
      {lightboxImage ? <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} /> : null}
    </>
  );
}

function ArticleBlockRenderer({ block, onLightbox }: { block: ArticleBlock; onLightbox: (image: { src: string; alt: string; caption?: string }) => void }) {
  switch (block.type) {
    case "heading":
      return <HeadingBlock block={block} />;
    case "paragraph":
      return <ParagraphBlock text={block.text} />;
    case "image":
      return <ImageBlock block={block} onLightbox={onLightbox} />;
    case "gallery":
      return <GalleryBlock block={block} onLightbox={onLightbox} />;
    case "video":
      return <VideoBlock block={block} />;
    case "code":
      return <CodeBlock block={block} />;
    case "quote":
      return <QuoteBlock block={block} />;
    case "divider":
      return <DividerBlock />;
    case "callout":
      return <CalloutBlock block={block} />;
    case "table":
      return <TableBlock block={block} />;
    case "points":
      return <PointsBlock block={block} />;
    case "bullet-list":
      return <ListBlock items={block.items} ordered={false} />;
    case "numbered-list":
      return <ListBlock items={block.items} ordered />;
    case "checklist":
      return <ChecklistBlock block={block} />;
    case "pdf":
    case "docx":
    case "ppt":
    case "zip":
      return <FileResourceBlock block={block} />;
    case "github-link":
    case "live-demo":
    case "documentation":
    case "research-paper":
    case "youtube":
    case "google-drive":
      return <LinkResourceBlock block={block} />;
    case "button":
      return <ButtonBlock block={block} />;
    case "markdown":
      return <MarkdownBlock content={block.content} />;
    case "formula":
      return <FormulaBlock block={block} />;
    case "mermaid":
      return <MermaidBlock block={block} />;
    case "audio":
      return <AudioBlock block={block} />;
    case "bookmark":
      return <BookmarkBlock block={block} />;
  }
}

function HeadingBlock({ block }: { block: Extract<ArticleBlock, { type: "heading" }> }) {
  if (block.level === 1) return <h1 className="text-[38px] font-bold leading-[1.12] text-white">{block.text}</h1>;
  if (block.level === 4) return <h4 className="text-xl font-semibold leading-8 text-white">{block.text}</h4>;
  if (block.level === 3) return <h3 className="text-[24px] font-semibold leading-9 text-white">{block.text}</h3>;
  return <h2 className="text-[30px] font-bold leading-10 text-white">{block.text}</h2>;
}

function ParagraphBlock({ text }: { text: string }) {
  return <p className="text-[17px] leading-8 text-[var(--text-secondary)]">{text}</p>;
}

function ImageBlock({ block, onLightbox }: { block: Extract<ArticleBlock, { type: "image" }>; onLightbox: (image: { src: string; alt: string; caption?: string }) => void }) {
  return (
    <figure>
      <button type="button" className="group relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]" onClick={() => onLightbox(block)}>
        <Image src={block.src} alt={block.alt} fill sizes="(max-width: 900px) 100vw, 780px" className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100" loading="lazy" />
        <span className="absolute right-4 top-4 rounded-full border border-[rgba(255,255,255,0.12)] bg-black/40 px-3 py-1 text-xs text-white opacity-0 backdrop-blur transition group-hover:opacity-100">Open</span>
      </button>
      {block.caption ? <figcaption className="mt-3 text-center text-sm text-[var(--text-muted)]">{block.caption}</figcaption> : null}
    </figure>
  );
}

function GalleryBlock({ block, onLightbox }: { block: Extract<ArticleBlock, { type: "gallery" }>; onLightbox: (image: { src: string; alt: string; caption?: string }) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {block.images.map((image) => (
        <button key={`${image.src}-${image.alt}`} type="button" className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]" onClick={() => onLightbox(image)}>
          <Image src={image.src} alt={image.alt} fill sizes="(max-width: 900px) 100vw, 260px" className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100" loading="lazy" />
          {image.caption ? <span className="absolute inset-x-0 bottom-0 bg-black/50 px-3 py-2 text-left text-xs text-white backdrop-blur">{image.caption}</span> : null}
        </button>
      ))}
    </div>
  );
}

function VideoBlock({ block }: { block: Extract<ArticleBlock, { type: "video" }> }) {
  return (
    <figure>
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]">
        {block.provider === "youtube" ? (
          <iframe src={block.src} title={block.title} className="h-full w-full" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
        ) : (
          <video src={block.src} controls preload="metadata" className="h-full w-full" poster={block.thumbnailUrl} />
        )}
        <span className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.12)] bg-black/40 px-3 py-1 text-xs text-white backdrop-blur"><Play className="h-3 w-3" /> Video</span>
      </div>
      {block.caption ? <figcaption className="mt-3 text-center text-sm text-[var(--text-muted)]">{block.caption}</figcaption> : null}
    </figure>
  );
}

function CodeBlock({ block }: { block: Extract<ArticleBlock, { type: "code" }> }) {
  const [copied, setCopied] = useState(false);
  const lines = block.code.split("\n");
  const copy = async () => {
    await navigator.clipboard.writeText(block.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.42)]">
      <div className="flex items-center justify-between gap-3 border-b border-[rgba(255,255,255,0.08)] px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Code2 className="h-4 w-4 shrink-0 text-[var(--accent-gold)]" />
          <span className="truncate text-sm text-white">{block.filename ?? block.language}</span>
          <span className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">{block.language}</span>
        </div>
        <button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition hover:border-[rgba(212,175,55,0.32)] hover:text-white">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="custom-scrollbar overflow-x-auto p-4 text-sm leading-6">
        <code>
          {lines.map((line, index) => (
              <span key={`${line}-${index}`} className="table-row">
                <span className="table-cell select-none pr-5 text-right text-[var(--text-muted)]">{index + 1}</span>
              <span className="table-cell whitespace-pre text-white/90" dangerouslySetInnerHTML={{ __html: highlightCodeLine(line || " ", block.language) }} />
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

function QuoteBlock({ block }: { block: Extract<ArticleBlock, { type: "quote" }> }) {
  return (
    <blockquote className="relative overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.24)] bg-[linear-gradient(135deg,rgba(212,175,55,0.08),rgba(18,19,24,0.96))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
      <span className="absolute inset-y-5 left-0 w-1 rounded-r-full bg-[var(--accent-gold)]" aria-hidden="true" />
      <Quote className="mb-4 h-8 w-8 text-[var(--accent-gold)]" />
      <p className="text-xl italic leading-9 text-white/90">{block.text}</p>
      {block.author ? <footer className="mt-4 text-sm text-[var(--text-muted)]">— {block.author}</footer> : null}
    </blockquote>
  );
}

function DividerBlock() {
  return <hr className="border-[rgba(255,255,255,0.08)]" />;
}

function CalloutBlock({ block }: { block: Extract<ArticleBlock, { type: "callout" }> }) {
  const Icon = calloutIcon(block.variant);
  return (
    <div className={cn("rounded-2xl border p-5", calloutClasses(block.variant))}>
      <div className="flex gap-4">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          {block.title ? <p className="font-semibold text-white">{block.title}</p> : null}
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{block.text}</p>
        </div>
      </div>
    </div>
  );
}

function TableBlock({ block }: { block: Extract<ArticleBlock, { type: "table" }> }) {
  return (
    <div className="custom-scrollbar overflow-x-auto rounded-2xl border border-[rgba(212,175,55,0.2)] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
      <table className="w-full min-w-[620px] border-collapse bg-[var(--bg-surface)] text-sm">
        <thead className="bg-[rgba(212,175,55,0.1)]">
          <tr>
            {block.columns.map((column) => <th key={column} className="border-b border-[rgba(212,175,55,0.24)] px-4 py-3 text-left font-semibold text-[var(--accent-gold)]">{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={row.join("-") || rowIndex} className="odd:bg-white/[0.015]">
              {row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`} className="border-b border-[rgba(255,255,255,0.06)] px-4 py-3 leading-6 text-[var(--text-secondary)]">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListBlock({ items, ordered }: { items: string[]; ordered: boolean }) {
  const List = ordered ? "ol" : "ul";
  return (
    <List className={cn("space-y-3 pl-5 text-[17px] leading-8 text-[var(--text-secondary)] marker:text-[var(--accent-gold)]", ordered ? "list-decimal" : "list-disc")}>
      {items.map((item) => <li key={item}>{item}</li>)}
    </List>
  );
}

function PointsBlock({ block }: { block: Extract<ArticleBlock, { type: "points" }> }) {
  const style = block.style ?? "bullet";
  return (
    <ul className="grid gap-3">
      {block.items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-4 rounded-2xl border border-[rgba(212,175,55,0.18)] bg-[var(--bg-surface)] p-4 text-[var(--text-secondary)]">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(212,175,55,0.28)] bg-[rgba(212,175,55,0.08)] text-sm font-semibold text-[var(--accent-gold)]">{pointMarker(style, index)}</span>
          <span className="min-w-0 pt-0.5 text-[17px] leading-8">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function pointMarker(style: "bullet" | "number" | "letter", index: number) {
  if (style === "number") return index + 1;
  if (style === "letter") return String.fromCharCode(65 + (index % 26));
  return "•";
}

function ChecklistBlock({ block }: { block: Extract<ArticleBlock, { type: "checklist" }> }) {
  return (
    <ul className="space-y-3">
      {block.items.map((item) => (
        <li key={item.text} className="flex gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          <CheckCircle2 className={cn("mt-0.5 h-4 w-4 shrink-0", item.checked ? "text-[var(--accent-gold)]" : "text-[var(--text-muted)]")} />
          {item.text}
        </li>
      ))}
    </ul>
  );
}

function FileResourceBlock({ block }: { block: FileBlock }) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.08)] text-[var(--accent-gold)]">{fileIcon(block.type)}</span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-white">{block.title}</span>
            {block.description ? <span className="mt-1 block text-sm leading-6 text-[var(--text-secondary)]">{block.description}</span> : null}
            <span className="mt-2 block text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">{block.type}</span>
          </span>
        </div>
        <div className="flex shrink-0 gap-2">
          {block.type === "pdf" ? <Button href={block.href} external variant="secondary" size="sm" icon={<FileText className="h-4 w-4" />}>Preview</Button> : null}
          <Button href={block.href} external size="sm" icon={<Download className="h-4 w-4" />}>Download</Button>
        </div>
      </div>
    </div>
  );
}

function LinkResourceBlock({ block }: { block: LinkBlock }) {
  return (
    <a href={block.href} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition hover:-translate-y-1 hover:border-[rgba(212,175,55,0.36)] motion-reduce:hover:translate-y-0">
      <span className="flex min-w-0 items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.08)] text-[var(--accent-gold)]">{linkIcon(block.type)}</span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-white">{block.title}</span>
          {block.description ? <span className="mt-1 block text-sm leading-6 text-[var(--text-secondary)]">{block.description}</span> : null}
        </span>
      </span>
      <ExternalLink className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition group-hover:text-[var(--accent-gold)]" />
    </a>
  );
}

function ButtonBlock({ block }: { block: Extract<ArticleBlock, { type: "button" }> }) {
  return (
    <div>
      <Button href={block.href} external variant={block.variant ?? "primary"} icon={<ExternalLink className="h-4 w-4" />}>
        {block.label}
      </Button>
    </div>
  );
}

function MarkdownBlock({ content }: { content: string }) {
  return (
    <div className="article-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h2: ({ children }) => <h2 className="mb-4 mt-2 text-[30px] font-bold leading-10 text-white">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-3 mt-7 text-[24px] font-semibold leading-9 text-white">{children}</h3>,
          p: ({ children }) => <p className="mb-5 text-[17px] leading-8 text-[var(--text-secondary)] last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="mb-5 list-disc space-y-2 pl-5 text-[17px] leading-8 text-[var(--text-secondary)] marker:text-[var(--accent-gold)]">{children}</ul>,
          ol: ({ children }) => <ol className="mb-5 list-decimal space-y-2 pl-5 text-[17px] leading-8 text-[var(--text-secondary)] marker:text-[var(--accent-gold)]">{children}</ol>,
          blockquote: ({ children }) => <blockquote className="mb-6 border-l-2 border-[var(--accent-gold)] bg-[rgba(212,175,55,0.06)] px-5 py-4 text-[var(--text-secondary)]">{children}</blockquote>,
          code: ({ children }) => <code className="rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.34)] px-1.5 py-0.5 font-mono text-[0.92em] text-white">{children}</code>,
          pre: ({ children }) => <pre className="custom-scrollbar mb-6 overflow-x-auto rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.42)] p-4 text-sm leading-6">{children}</pre>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function FormulaBlock({ block }: { block: Extract<ArticleBlock, { type: "formula" }> }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[rgba(212,175,55,0.18)] bg-[rgba(212,175,55,0.06)] p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--accent-gold)]"><Sigma className="h-4 w-4" /> Formula</div>
      <code className="font-mono text-base leading-7 text-white">{block.latex}</code>
    </div>
  );
}

function MermaidBlock({ block }: { block: Extract<ArticleBlock, { type: "mermaid" }> }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[rgba(0,0,0,0.32)]">
      <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] px-4 py-3 text-sm font-semibold text-white"><Workflow className="h-4 w-4 text-[var(--accent-gold)]" /> Mermaid Diagram</div>
      <pre className="custom-scrollbar overflow-x-auto p-4 text-sm leading-6 text-white/90"><code>{block.code}</code></pre>
      {block.caption ? <figcaption className="border-t border-[rgba(255,255,255,0.08)] px-4 py-3 text-sm text-[var(--text-muted)]">{block.caption}</figcaption> : null}
    </figure>
  );
}

function AudioBlock({ block }: { block: Extract<ArticleBlock, { type: "audio" }> }) {
  return (
    <figure className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
      <div className="mb-4 flex items-center gap-3 text-white">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.08)] text-[var(--accent-gold)]"><AudioLines className="h-5 w-5" /></span>
        <span className="font-semibold">{block.title}</span>
      </div>
      <audio src={block.src} controls preload="metadata" className="w-full" />
      {block.caption ? <figcaption className="mt-3 text-sm text-[var(--text-muted)]">{block.caption}</figcaption> : null}
    </figure>
  );
}

function BookmarkBlock({ block }: { block: Extract<ArticleBlock, { type: "bookmark" }> }) {
  return (
    <a href={block.href} target="_blank" rel="noopener noreferrer" className="group grid gap-4 overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition hover:-translate-y-1 hover:border-[rgba(212,175,55,0.36)] md:grid-cols-[minmax(0,1fr)_160px] motion-reduce:hover:translate-y-0">
      <span className="flex min-w-0 gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.08)] text-[var(--accent-gold)]"><Bookmark className="h-5 w-5" /></span>
        <span className="min-w-0">
          {block.siteName ? <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">{block.siteName}</span> : null}
          <span className="block text-sm font-semibold text-white">{block.title}</span>
          {block.description ? <span className="mt-1 line-clamp-2 block text-sm leading-6 text-[var(--text-secondary)]">{block.description}</span> : null}
        </span>
      </span>
      {block.imageUrl ? <span className="relative hidden aspect-video overflow-hidden rounded-xl border border-[var(--border-subtle)] md:block"><Image src={block.imageUrl} alt="" fill sizes="160px" className="object-cover" /></span> : null}
    </a>
  );
}

function highlightCodeLine(line: string, language: string) {
  try {
    if (hljs.getLanguage(language)) return hljs.highlight(line, { language, ignoreIllegals: true }).value;
    return hljs.highlightAuto(line).value;
  } catch {
    return escapeHtml(line);
  }
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function Lightbox({ image, onClose }: { image: { src: string; alt: string; caption?: string }; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onClick={onClose}>
      <figure className="w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.12)] bg-black">
          <Image src={image.src} alt={image.alt} fill sizes="100vw" className="object-contain" />
        </div>
        {image.caption ? <figcaption className="mt-3 text-center text-sm text-white/70">{image.caption}</figcaption> : null}
      </figure>
      <button type="button" aria-label="Close image preview" className="absolute right-5 top-5 rounded-full border border-white/10 bg-white/10 p-2 text-white" onClick={onClose}>×</button>
    </div>
  );
}

function fileIcon(type: FileBlock["type"]) {
  if (type === "zip") return <FileArchive className="h-5 w-5" />;
  return <FileText className="h-5 w-5" />;
}

function linkIcon(type: LinkBlock["type"]) {
  if (type === "github-link") return <Code2 className="h-5 w-5" />;
  if (type === "youtube" || type === "live-demo") return <ExternalLink className="h-5 w-5" />;
  if (type === "google-drive") return <FileArchive className="h-5 w-5" />;
  if (type === "documentation" || type === "research-paper") return <FileText className="h-5 w-5" />;
  return <LinkIcon className="h-5 w-5" />;
}

function calloutIcon(variant: CalloutVariant) {
  if (variant === "success") return CheckCircle2;
  if (variant === "warning") return TriangleAlert;
  if (variant === "danger") return ShieldAlert;
  return Info;
}

function calloutClasses(variant: CalloutVariant) {
  if (variant === "success") return "border-[rgba(74,222,128,0.22)] bg-[rgba(74,222,128,0.06)] text-[var(--status-success)]";
  if (variant === "warning") return "border-[rgba(212,175,55,0.24)] bg-[rgba(212,175,55,0.07)] text-[var(--accent-gold)]";
  if (variant === "danger") return "border-[rgba(248,113,113,0.24)] bg-[rgba(248,113,113,0.07)] text-red-300";
  return "border-[rgba(96,165,250,0.22)] bg-[rgba(96,165,250,0.06)] text-[var(--status-progress)]";
}
