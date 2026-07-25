import { AudioLines, CheckCircle2, Code2, ExternalLink, FileArchive, FileText, Info, LinkIcon, Play, Quote, ShieldAlert, Sigma, TriangleAlert, Workflow, Bookmark } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import type { ArticleBlock } from "@/types/blog.types";

export function ArticleRenderer({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="mx-auto flex w-full max-w-[780px] flex-col gap-8">
      {blocks.length ? blocks.map((block) => <ArticleBlockRenderer key={block.id} block={block} />) : <p className="text-sm text-secondary">No content blocks yet.</p>}
    </div>
  );
}

function ArticleBlockRenderer({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "heading":
      return <Heading block={block} />;
    case "paragraph":
      return <p className="text-[17px] leading-8 text-secondary">{block.text}</p>;
    case "markdown":
      return <MarkdownBlock content={block.content} />;
    case "image":
      return <ImagePreview src={block.src} alt={block.alt} caption={block.caption} />;
    case "gallery":
      return <div className="grid gap-3 md:grid-cols-3">{block.images.map((image) => <ImagePreview key={`${image.src}-${image.alt}`} src={image.src} alt={image.alt} caption={image.caption} compact />)}</div>;
    case "video":
      return <MediaFrame label={block.title} icon={<Play size={16} />} caption={block.caption}>{block.provider === "youtube" ? <iframe src={block.src} title={block.title} className="aspect-video w-full" /> : <video src={block.src} controls className="aspect-video w-full" poster={block.thumbnailUrl}><track kind="captions" /></video>}</MediaFrame>;
    case "audio":
      return <MediaFrame label={block.title} icon={<AudioLines size={16} />} caption={block.caption}><audio src={block.src} controls className="w-full"><track kind="captions" /></audio></MediaFrame>;
    case "code":
      return <CodePreview title={block.filename ?? block.language} code={block.code} />;
    case "quote":
      return <blockquote className="rounded-lg border border-accent/30 bg-accent/10 p-5 text-secondary"><Quote className="mb-3 text-accent" size={22} /><p className="text-lg italic leading-8">{block.text}</p>{block.author ? <footer className="mt-3 text-sm text-muted">{block.author}</footer> : null}</blockquote>;
    case "divider":
      return <hr className="border-border-subtle" />;
    case "callout":
      return <Callout block={block} />;
    case "table":
      return <TablePreview block={block} />;
    case "bullet-list":
      return <ul className="list-disc space-y-2 pl-5 text-secondary">{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
    case "numbered-list":
      return <ol className="list-decimal space-y-2 pl-5 text-secondary">{block.items.map((item) => <li key={item}>{item}</li>)}</ol>;
    case "checklist":
      return <ul className="space-y-2">{block.items.map((item) => <li key={item.text} className="flex gap-2 rounded-md border border-border-subtle bg-surface-hover px-3 py-2 text-secondary"><CheckCircle2 size={16} className={item.checked ? "text-accent" : "text-muted"} />{item.text}</li>)}</ul>;
    case "pdf":
    case "docx":
    case "ppt":
    case "zip":
      return <ResourceBlock icon={block.type === "zip" ? <FileArchive size={18} /> : <FileText size={18} />} title={block.title} description={block.description} href={block.href} action="Download" />;
    case "github-link":
    case "live-demo":
    case "documentation":
    case "research-paper":
    case "youtube":
    case "google-drive":
      return <ResourceBlock icon={linkIcon(block.type)} title={block.title} description={block.description} href={block.href} action="Open" />;
    case "button":
      return <div><Button type="button">{block.label}<ExternalLink size={16} /></Button></div>;
    case "formula":
      return <ResourceBlock icon={<Sigma size={18} />} title="Formula" description={block.latex} />;
    case "mermaid":
      return <MediaFrame label="Mermaid Diagram" icon={<Workflow size={16} />} caption={block.caption}><pre className="overflow-auto p-4 text-sm text-primary">{block.code}</pre></MediaFrame>;
    case "bookmark":
      return <ResourceBlock icon={<Bookmark size={18} />} title={block.title} description={block.description ?? block.siteName} href={block.href} action="Open" />;
  }
}

function Heading({ block }: { block: Extract<ArticleBlock, { type: "heading" }> }) {
  if (block.level === 1) return <h1 className="text-4xl font-bold text-primary">{block.text}</h1>;
  if (block.level === 2) return <h2 className="text-3xl font-bold text-primary">{block.text}</h2>;
  if (block.level === 3) return <h3 className="text-2xl font-semibold text-primary">{block.text}</h3>;
  return <h4 className="text-xl font-semibold text-primary">{block.text}</h4>;
}

function MarkdownBlock({ content }: { content: string }) {
  return (
    <div className="grid gap-4">
      {content.split(/\n{2,}/).map((paragraph, index) => (
        <p key={`${paragraph}-${index}`} className="whitespace-pre-wrap text-[17px] leading-8 text-secondary">
          {renderInlineMarkdown(paragraph)}
        </p>
      ))}
    </div>
  );
}

function renderInlineMarkdown(text: string) {
  const segments = text.split(/(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`|<u>.*?<\/u>|<mark>.*?<\/mark>|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return segments.map((segment, index) => {
    if (segment.startsWith("**") && segment.endsWith("**")) return <strong key={index} className="font-semibold text-primary">{segment.slice(2, -2)}</strong>;
    if (segment.startsWith("_") && segment.endsWith("_")) return <em key={index}>{segment.slice(1, -1)}</em>;
    if (segment.startsWith("`") && segment.endsWith("`")) return <code key={index} className="rounded-md border border-border-subtle bg-surface-hover px-1.5 py-0.5 font-mono text-[0.92em] text-primary">{segment.slice(1, -1)}</code>;
    if (segment.startsWith("<u>") && segment.endsWith("</u>")) return <u key={index} className="underline underline-offset-4">{segment.slice(3, -4)}</u>;
    if (segment.startsWith("<mark>") && segment.endsWith("</mark>")) return <mark key={index} className="rounded bg-accent/20 px-1 text-primary">{segment.slice(6, -7)}</mark>;
    const link = segment.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noreferrer" className="font-medium text-accent underline underline-offset-4">{link[1]}</a>;
    return <span key={index}>{segment}</span>;
  });
}

function ImagePreview({ src, alt, caption, compact = false }: { src: string; alt: string; caption?: string; compact?: boolean }) {
  return (
    <figure>
      <img src={src} alt={alt} className={`${compact ? "aspect-[4/3]" : "aspect-video"} w-full rounded-lg border border-border-subtle object-cover`} />
      {caption ? <figcaption className="mt-2 text-center text-sm text-muted">{caption}</figcaption> : null}
    </figure>
  );
}

function MediaFrame({ label, icon, caption, children }: { label: string; icon: ReactNode; caption?: string; children: ReactNode }) {
  return <figure className="overflow-hidden rounded-lg border border-border-subtle bg-surface-hover"><div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3 text-sm font-semibold text-primary">{icon}{label}</div>{children}{caption ? <figcaption className="border-t border-border-subtle px-4 py-3 text-sm text-muted">{caption}</figcaption> : null}</figure>;
}

function CodePreview({ title, code }: { title: string; code: string }) {
  return <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-hover"><div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3 text-sm font-semibold text-primary"><Code2 size={16} />{title}</div><pre className="overflow-auto p-4 text-sm leading-6 text-primary"><code>{code}</code></pre></div>;
}

function Callout({ block }: { block: Extract<ArticleBlock, { type: "callout" }> }) {
  const Icon = block.variant === "warning" ? TriangleAlert : block.variant === "danger" ? ShieldAlert : Info;
  return <div className="rounded-lg border border-accent/20 bg-accent/10 p-5"><div className="flex gap-3"><Icon className="mt-1 text-accent" size={18} /><div>{block.title ? <p className="font-semibold text-primary">{block.title}</p> : null}<p className="text-sm leading-6 text-secondary">{block.text}</p></div></div></div>;
}

function TablePreview({ block }: { block: Extract<ArticleBlock, { type: "table" }> }) {
  return <div className="overflow-x-auto rounded-lg border border-border-subtle"><table className="w-full min-w-[520px] text-sm"><thead><tr>{block.columns.map((column) => <th key={column} className="border-b border-border-subtle px-4 py-3 text-left text-primary">{column}</th>)}</tr></thead><tbody>{block.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={`${index}-${cellIndex}`} className="border-b border-border-subtle px-4 py-3 text-secondary">{cell}</td>)}</tr>)}</tbody></table></div>;
}

function ResourceBlock({ icon, title, description, href, action }: { icon: ReactNode; title: string; description?: string; href?: string; action?: string }) {
  return <div className="flex items-center justify-between gap-4 rounded-lg border border-border-subtle bg-surface-hover p-5"><div className="flex min-w-0 gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-accent/20 bg-accent/10 text-accent">{icon}</span><span className="min-w-0"><span className="block font-semibold text-primary">{title}</span>{description ? <span className="mt-1 block text-sm leading-6 text-secondary">{description}</span> : null}</span></div>{href && action ? <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-accent">{action}<ExternalLink size={14} /></a> : null}</div>;
}

function linkIcon(type: string) {
  if (type === "github-link") return <Code2 size={18} />;
  if (type === "documentation" || type === "research-paper") return <FileText size={18} />;
  if (type === "google-drive") return <FileArchive size={18} />;
  return <LinkIcon size={18} />;
}
