import {
  ArrowDown,
  ArrowUp,
  AudioLines,
  Bold,
  Code2,
  Copy,
  File,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link,
  Pilcrow,
  Play,
  Plus,
  Quote,
  Table as TableIcon,
  Trash2,
  Underline,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/app/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { ArticleBlock } from "@/types/blog.types";

type UploadKind = "image" | "video" | "audio" | "document";
type TextFormat = "bold" | "italic" | "underline" | "highlight" | "code" | "link";
type FileArticleBlock = Extract<ArticleBlock, { type: "pdf" | "docx" | "ppt" | "zip" }>;
type DocumentationArticleBlock = { id: string; type: "documentation"; title: string; description?: string; href: string };

type BuilderProps = {
  blocks: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
  onUpload: (file: File) => Promise<string>;
};

const documentExtensions = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".zip"];

function makeId(prefix = "block") {
  return `${prefix}-${crypto.randomUUID()}`;
}

function documentTypeFromFileName(fileName: string): "pdf" | "docx" | "ppt" | "zip" | "documentation" {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "pdf";
  if (extension === "doc" || extension === "docx") return "docx";
  if (extension === "ppt" || extension === "pptx") return "ppt";
  if (extension === "zip") return "zip";
  return "documentation";
}

function titleFromFileName(fileName: string, fallback: string) {
  return (fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || fallback).slice(0, 80);
}

function createBlock(kind: "heading" | "subheading" | "paragraph" | "quote" | "code" | "table" | "link"): ArticleBlock {
  const id = makeId(kind);
  if (kind === "heading") return { id, type: "heading", level: 1, text: "Enter heading" };
  if (kind === "subheading") return { id, type: "heading", level: 2, text: "Enter sub heading" };
  if (kind === "paragraph") return { id, type: "paragraph", text: "Start writing..." };
  if (kind === "quote") return { id, type: "quote", text: "Add quote...", author: "" };
  if (kind === "code") return { id, type: "code", language: "typescript", filename: "", code: "console.log('Hello world');" };
  if (kind === "table") return { id, type: "table", columns: ["Column 1", "Column 2"], rows: [["Value", "Value"]] };
  return { id, type: "documentation", title: "Link title", description: "", href: "https://example.com" };
}

function createMediaBlock(kind: UploadKind, url: string, fileName: string): ArticleBlock {
  const title = titleFromFileName(fileName, kind === "document" ? "Document" : fileName);
  if (kind === "image") return { id: makeId("image"), type: "image", src: url, alt: title, caption: "" };
  if (kind === "video") return { id: makeId("video"), type: "video", provider: "uploaded", src: url, title, caption: "" };
  if (kind === "audio") return { id: makeId("audio"), type: "audio", src: url, title, caption: "" };
  const documentType = documentTypeFromFileName(fileName);
  return { id: makeId("document"), type: documentType, title, description: "", href: url };
}

function acceptForUploadKind(kind: UploadKind) {
  if (kind === "image") return "image/jpeg,image/png,image/webp,image/gif";
  if (kind === "video") return "video/mp4,video/webm,video/quicktime";
  if (kind === "audio") return "audio/mpeg,audio/wav,audio/ogg,audio/mp4";
  return documentExtensions.join(",");
}

function validateFile(file: File, kind: UploadKind) {
  if (kind === "image" && !file.type.startsWith("image/")) return "Please choose an image file.";
  if (kind === "video" && !file.type.startsWith("video/")) return "Please choose a video file.";
  if (kind === "audio" && !file.type.startsWith("audio/")) return "Please choose an audio file.";
  if (kind === "document" && !documentExtensions.some((extension) => file.name.toLowerCase().endsWith(extension))) return "Documents must be PDF, DOC, DOCX, PPT, PPTX, or ZIP.";
  return null;
}

function isFileBlock(block: ArticleBlock): block is FileArticleBlock {
  return block.type === "pdf" || block.type === "docx" || block.type === "ppt" || block.type === "zip";
}

export function BlogArticleBuilder({ blocks, onChange, onUpload }: BuilderProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const blockRefs = useRef<Record<string, HTMLElement | null>>({});
  const uploadIntent = useRef<{ kind: UploadKind; replaceId?: string } | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [selection, setSelection] = useState<{ blockId: string; start: number; end: number } | null>(null);
  const [isBlockSheetOpen, setIsBlockSheetOpen] = useState(false);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

  function setBlocks(next: ArticleBlock[]) {
    onChange(next);
  }

  useEffect(() => {
    if (!focusedBlockId) return;
    const scrollTimer = requestAnimationFrame(() => {
      blockRefs.current[focusedBlockId]?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
    return () => cancelAnimationFrame(scrollTimer);
  }, [focusedBlockId, blocks.length]);

  function addBlock(kind: Parameters<typeof createBlock>[0]) {
    const block = createBlock(kind);
    setBlocks([...blocks, block]);
    setFocusedBlockId(block.id);
    setIsBlockSheetOpen(false);
    requestAnimationFrame(() => {
      blockRefs.current[block.id]?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }

  function updateBlock(nextBlock: ArticleBlock) {
    setBlocks(blocks.map((block) => (block.id === nextBlock.id ? nextBlock : block)));
  }

  function removeBlock(id: string) {
    setBlocks(blocks.filter((block) => block.id !== id));
  }

  function duplicateBlock(block: ArticleBlock) {
    const index = blocks.findIndex((item) => item.id === block.id);
    const clone = { ...block, id: makeId(block.type) } as ArticleBlock;
    setBlocks([...blocks.slice(0, index + 1), clone, ...blocks.slice(index + 1)]);
  }

  function moveBlock(id: string, direction: -1 | 1) {
    const index = blocks.findIndex((block) => block.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setBlocks(next);
  }

  function pickUpload(kind: UploadKind, replaceId?: string) {
    uploadIntent.current = { kind, replaceId };
    setIsBlockSheetOpen(false);
    fileInputRef.current?.click();
  }

  async function uploadSelectedFile(file?: File) {
    const intent = uploadIntent.current;
    if (!file || !intent) return;
    const validationError = validateFile(file, intent.kind);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setUploading(intent.replaceId ?? intent.kind);
    try {
      const url = await onUpload(file);
      const mediaBlock = createMediaBlock(intent.kind, url, file.name);
      if (intent.replaceId) {
        setBlocks(blocks.map((block) => (block.id === intent.replaceId ? { ...mediaBlock, id: block.id } : block)));
        setFocusedBlockId(intent.replaceId);
        requestAnimationFrame(() => {
          blockRefs.current[intent.replaceId!]?.scrollIntoView({ block: "center", behavior: "smooth" });
        });
      } else {
        setBlocks([...blocks, mediaBlock]);
        setFocusedBlockId(mediaBlock.id);
        requestAnimationFrame(() => {
          blockRefs.current[mediaBlock.id]?.scrollIntoView({ block: "center", behavior: "smooth" });
        });
      }
      toast.success(`${intent.kind === "document" ? "Document" : intent.kind} uploaded`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Media upload failed");
    } finally {
      setUploading(null);
      uploadIntent.current = null;
    }
  }

  function applyFormat(format: TextFormat) {
    if (!selection || selection.start === selection.end) return;
    const block = blocks.find((item) => item.id === selection.blockId);
    if (!block || (block.type !== "paragraph" && block.type !== "markdown")) return;
    const value = block.type === "markdown" ? block.content : block.text;
    const before = value.slice(0, selection.start);
    const selected = value.slice(selection.start, selection.end);
    const after = value.slice(selection.end);
    const href = format === "link" ? window.prompt("Link URL", "https://") : null;
    if (format === "link" && !href) return;
    const wrapped =
      format === "bold" ? `**${selected}**`
      : format === "italic" ? `_${selected}_`
      : format === "underline" ? `<u>${selected}</u>`
      : format === "highlight" ? `<mark>${selected}</mark>`
      : format === "code" ? `\`${selected}\``
      : `[${selected}](${href})`;
    updateBlock({ id: block.id, type: "markdown", content: `${before}${wrapped}${after}` });
  }

  return (
    <div className="relative grid min-h-[650px] overflow-hidden rounded-xl border border-border-subtle bg-surface md:grid-cols-[230px_minmax(0,1fr)]">
      <aside className="hidden border-r border-border-subtle bg-surface-hover/50 p-4 md:block">
        <ArticleBlockMenu addBlock={addBlock} pickUpload={pickUpload} uploading={uploading} />
      </aside>
      <input ref={fileInputRef} type="file" className="hidden" accept={acceptForUploadKind(uploadIntent.current?.kind ?? "image")} onChange={(event) => { void uploadSelectedFile(event.target.files?.[0]); event.currentTarget.value = ""; }} />

      <div className="min-h-0 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.08),transparent_34%)] px-3 pb-28 pt-4 md:px-8 md:py-8">
        <InlineToolbar disabled={!selection || selection.start === selection.end} onFormat={applyFormat} />
        <div className="mx-auto grid min-h-[560px] max-w-[860px] gap-4 rounded-xl border border-border-subtle bg-surface px-3 py-4 shadow-elevation-1 sm:min-h-[620px] sm:px-6 sm:py-5">
          {blocks.length ? blocks.map((block, index) => (
            <EditableBlock
              key={block.id}
              block={block}
              index={index}
              total={blocks.length}
              uploading={uploading === block.id}
              sectionRef={(node) => { blockRefs.current[block.id] = node; }}
              onUpdate={updateBlock}
              onRemove={() => removeBlock(block.id)}
              onDuplicate={() => duplicateBlock(block)}
              onMove={(direction) => moveBlock(block.id, direction)}
              onReplace={(kind) => pickUpload(kind, block.id)}
              onSelection={(start, end) => setSelection({ blockId: block.id, start, end })}
              shouldFocus={focusedBlockId === block.id}
              onFocused={() => setFocusedBlockId(null)}
            />
          )) : (
            <div className="grid min-h-[360px] place-items-center rounded-xl border border-dashed border-border-subtle bg-surface-hover/60 px-5 text-center sm:min-h-[500px]">
              <div>
                <Plus className="mx-auto mb-3 text-muted" size={24} />
                <p className="text-sm font-semibold text-primary">Start building your article</p>
                <p className="mt-1 text-xs text-muted">Tap Add Block to insert your first section.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-surface/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-elevation-2 backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => setIsBlockSheetOpen(true)}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent px-4 text-sm font-semibold text-black shadow-elevation-1 transition active:scale-[0.98]"
        >
          <Plus size={18} /> Add Block
        </button>
      </div>

      {isBlockSheetOpen ? (
        <div className="fixed inset-x-0 bottom-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Article block picker">
          <button type="button" className="fixed inset-0 -z-10 animate-[cms-fade-in_150ms_ease-out] bg-black/35" aria-label="Close block picker" onClick={() => setIsBlockSheetOpen(false)} />
          <div className="h-[55dvh] max-h-[60dvh] animate-[cms-sheet-up_180ms_ease-out] overflow-hidden rounded-t-2xl border border-border-subtle bg-surface shadow-elevation-2">
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-primary">Article Builder</p>
                <p className="text-xs text-muted">Add one block, then keep writing.</p>
              </div>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border-subtle text-secondary transition hover:bg-surface-hover hover:text-primary"
                aria-label="Close block picker"
                onClick={() => setIsBlockSheetOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="max-h-[calc(55dvh-4.25rem)] overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-2">
              <ArticleBlockMenu addBlock={addBlock} pickUpload={pickUpload} uploading={uploading} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ArticleBlockMenu({
  addBlock,
  pickUpload,
  uploading,
}: {
  addBlock: (kind: Parameters<typeof createBlock>[0]) => void;
  pickUpload: (kind: UploadKind) => void;
  uploading: string | null;
}) {
  return (
    <>
      <p className="hidden text-sm font-semibold text-primary md:block">Article Builder</p>
      <p className="mt-1 hidden text-xs leading-5 text-muted md:block">Add portfolio-supported blocks only.</p>
      <SidebarGroup title="Text">
        <SidebarButton icon={<span className="text-xs font-bold">H1</span>} label="Heading" onClick={() => addBlock("heading")} />
        <SidebarButton icon={<span className="text-xs font-bold">H2</span>} label="Sub Heading" onClick={() => addBlock("subheading")} />
        <SidebarButton icon={<Pilcrow size={16} />} label="Paragraph" onClick={() => addBlock("paragraph")} />
      </SidebarGroup>
      <SidebarGroup title="Content">
        <SidebarButton icon={<Quote size={16} />} label="Quote" onClick={() => addBlock("quote")} />
        <SidebarButton icon={<Code2 size={16} />} label="Code Block" onClick={() => addBlock("code")} />
        <SidebarButton icon={<TableIcon size={16} />} label="Table" onClick={() => addBlock("table")} />
      </SidebarGroup>
      <SidebarGroup title="Media">
        <SidebarButton icon={<ImageIcon size={16} />} label="Image" onClick={() => pickUpload("image")} />
        <SidebarButton icon={<Play size={16} />} label="Video" onClick={() => pickUpload("video")} />
        <SidebarButton icon={<AudioLines size={16} />} label="Audio" onClick={() => pickUpload("audio")} />
        <SidebarButton icon={<File size={16} />} label="Document" onClick={() => pickUpload("document")} />
      </SidebarGroup>
      <SidebarGroup title="Links">
        <SidebarButton icon={<Link size={16} />} label="Link" onClick={() => addBlock("link")} />
      </SidebarGroup>
      {uploading ? <p className="mt-4 rounded-xl border border-accent/30 bg-accent/10 px-3 py-3 text-xs font-medium text-accent">Uploading...</p> : null}
    </>
  );
}

function InlineToolbar({ disabled, onFormat }: { disabled: boolean; onFormat: (format: TextFormat) => void }) {
  return (
    <div className={`sticky top-0 z-10 mx-auto mb-3 max-w-[860px] items-center gap-1 rounded-xl border border-border-subtle bg-surface/95 p-1 shadow-elevation-1 transition sm:mb-4 ${disabled ? "hidden pointer-events-none opacity-0 sm:flex sm:opacity-45" : "flex opacity-100"}`}>
      <ToolbarButton label="Bold" onClick={() => onFormat("bold")}><Bold size={15} /></ToolbarButton>
      <ToolbarButton label="Italic" onClick={() => onFormat("italic")}><Italic size={15} /></ToolbarButton>
      <ToolbarButton label="Underline" onClick={() => onFormat("underline")}><Underline size={15} /></ToolbarButton>
      <ToolbarButton label="Highlight" onClick={() => onFormat("highlight")}><Highlighter size={15} /></ToolbarButton>
      <ToolbarButton label="Inline Code" onClick={() => onFormat("code")}><Code2 size={15} /></ToolbarButton>
      <ToolbarButton label="Link" onClick={() => onFormat("link")}><Link size={15} /></ToolbarButton>
      <span className="ml-2 text-xs text-muted">Select paragraph text to format</span>
    </div>
  );
}

function ToolbarButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" title={label} aria-label={label} onClick={onClick} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-secondary transition hover:bg-surface-hover hover:text-primary">{children}</button>;
}

function SidebarGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="mt-4 md:mt-5"><p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{title}</p><div className="grid gap-2 md:gap-1">{children}</div></div>;
}

function SidebarButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-border-subtle bg-surface px-4 py-3 text-left text-sm font-medium text-secondary shadow-sm transition active:scale-[0.98] hover:border-accent/40 hover:bg-surface-hover hover:text-primary md:min-h-0 md:gap-2 md:rounded-md md:border-transparent md:bg-transparent md:px-3 md:py-2 md:shadow-none">{icon}<span>{label}</span></button>;
}

function BlockShell({ block, index, total, uploading, children, sectionRef, onRemove, onDuplicate, onMove }: {
  block: ArticleBlock;
  index: number;
  total: number;
  uploading: boolean;
  children: React.ReactNode;
  sectionRef: (node: HTMLElement | null) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  return (
    <section ref={sectionRef} className="rounded-xl border border-border-subtle bg-surface-hover/60 p-3 sm:p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{block.type}</p>
        <div className="flex items-center gap-1">
          {uploading ? <span className="mr-2 text-xs font-medium text-accent">Uploading...</span> : null}
          <IconButton label="Move up" disabled={index === 0} onClick={() => onMove(-1)}><ArrowUp size={14} /></IconButton>
          <IconButton label="Move down" disabled={index === total - 1} onClick={() => onMove(1)}><ArrowDown size={14} /></IconButton>
          <IconButton label="Duplicate" onClick={onDuplicate}><Copy size={14} /></IconButton>
          <IconButton label="Delete" onClick={onRemove}><Trash2 size={14} /></IconButton>
        </div>
      </div>
      {children}
    </section>
  );
}

function IconButton({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" title={label} aria-label={label} disabled={disabled} onClick={onClick} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-secondary transition hover:bg-surface hover:text-primary disabled:cursor-not-allowed disabled:opacity-40">{children}</button>;
}

function EditableBlock(props: {
  block: ArticleBlock;
  index: number;
  total: number;
  uploading: boolean;
  shouldFocus: boolean;
  sectionRef: (node: HTMLElement | null) => void;
  onUpdate: (block: ArticleBlock) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMove: (direction: -1 | 1) => void;
  onReplace: (kind: UploadKind) => void;
  onSelection: (start: number, end: number) => void;
  onFocused: () => void;
}) {
  const { block, onUpdate, onReplace, shouldFocus, onFocused } = props;
  const primaryFieldRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const setInputRef = (node: HTMLInputElement | null) => {
    primaryFieldRef.current = node;
  };
  const setTextareaRef = (node: HTMLTextAreaElement | null) => {
    primaryFieldRef.current = node;
  };

  useEffect(() => {
    if (!shouldFocus) return;
    const focusTimer = window.setTimeout(() => {
      primaryFieldRef.current?.focus();
      onFocused();
    }, 50);
    return () => window.clearTimeout(focusTimer);
  }, [onFocused, shouldFocus]);

  return (
    <BlockShell {...props}>
      {block.type === "heading" ? (
        <Textarea ref={setTextareaRef} value={block.text} className={block.level === 1 ? "min-h-20 text-3xl font-bold" : "min-h-16 text-2xl font-bold"} onChange={(event) => onUpdate({ ...block, text: event.target.value })} />
      ) : block.type === "paragraph" || block.type === "markdown" ? (
        <Textarea
          ref={setTextareaRef}
          value={block.type === "paragraph" ? block.text : block.content}
          className="min-h-40 text-base leading-7"
          onSelect={(event) => props.onSelection(event.currentTarget.selectionStart, event.currentTarget.selectionEnd)}
          onKeyUp={(event) => props.onSelection(event.currentTarget.selectionStart, event.currentTarget.selectionEnd)}
          onChange={(event) => onUpdate(block.type === "paragraph" ? { ...block, text: event.target.value } : { ...block, content: event.target.value })}
        />
      ) : block.type === "quote" ? (
        <div className="grid gap-3">
          <Textarea ref={setTextareaRef} value={block.text} className="min-h-28 text-lg italic leading-8" onChange={(event) => onUpdate({ ...block, text: event.target.value })} />
          <Input value={block.author ?? ""} placeholder="Author" onChange={(event) => onUpdate({ ...block, author: event.target.value })} />
        </div>
      ) : block.type === "code" ? (
        <div className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Input ref={setInputRef} value={block.language} placeholder="Language" onChange={(event) => onUpdate({ ...block, language: event.target.value })} />
            <Input value={block.filename ?? ""} placeholder="Filename" onChange={(event) => onUpdate({ ...block, filename: event.target.value })} />
          </div>
          <Textarea value={block.code} className="min-h-72 font-mono text-sm" onChange={(event) => onUpdate({ ...block, code: event.target.value })} />
        </div>
      ) : block.type === "table" ? (
        <TableEditor block={block} onUpdate={onUpdate} />
      ) : block.type === "image" ? (
        <MediaEditor preview={<img src={block.src} alt={block.alt} className="aspect-video w-full rounded-md border border-border-subtle object-cover" />} onReplace={() => onReplace("image")}>
          <Input ref={setInputRef} value={block.alt} placeholder="Alt text" onChange={(event) => onUpdate({ ...block, alt: event.target.value })} />
          <Input value={block.caption ?? ""} placeholder="Caption" onChange={(event) => onUpdate({ ...block, caption: event.target.value })} />
        </MediaEditor>
      ) : block.type === "video" ? (
        <MediaEditor preview={<video src={block.src} controls className="aspect-video w-full rounded-md border border-border-subtle bg-black" poster={block.thumbnailUrl}><track kind="captions" /></video>} onReplace={() => onReplace("video")}>
          <Input ref={setInputRef} value={block.title} placeholder="Video title" onChange={(event) => onUpdate({ ...block, title: event.target.value })} />
          <Input value={block.caption ?? ""} placeholder="Caption" onChange={(event) => onUpdate({ ...block, caption: event.target.value })} />
        </MediaEditor>
      ) : block.type === "audio" ? (
        <MediaEditor preview={<audio src={block.src} controls className="w-full"><track kind="captions" /></audio>} onReplace={() => onReplace("audio")}>
          <Input ref={setInputRef} value={block.title} placeholder="Audio title" onChange={(event) => onUpdate({ ...block, title: event.target.value })} />
          <Input value={block.caption ?? ""} placeholder="Caption" onChange={(event) => onUpdate({ ...block, caption: event.target.value })} />
        </MediaEditor>
      ) : isFileBlock(block) ? (
        <FileEditor block={block} fieldRef={setInputRef} onUpdate={onUpdate} onReplace={() => onReplace("document")} />
      ) : block.type === "documentation" ? (
        <LinkEditor block={block as DocumentationArticleBlock} fieldRef={setInputRef} onUpdate={onUpdate} onReplace={() => onReplace("document")} />
      ) : (
        <p className="text-sm text-muted">This legacy block remains supported in preview but is not editable in the new builder.</p>
      )}
    </BlockShell>
  );
}

function MediaEditor({ preview, children, onReplace }: { preview: React.ReactNode; children: React.ReactNode; onReplace: () => void }) {
  return <div className="grid gap-4">{preview}<div className="grid gap-3 md:grid-cols-2">{children}</div><div><Button type="button" size="sm" variant="secondary" onClick={onReplace}>Replace media</Button></div></div>;
}

function FileEditor({
  block,
  fieldRef,
  onUpdate,
  onReplace,
}: {
  block: FileArticleBlock;
  fieldRef: (node: HTMLInputElement | null) => void;
  onUpdate: (block: ArticleBlock) => void;
  onReplace: () => void;
}) {
  return (
    <div className="grid gap-3">
      <Input ref={fieldRef} value={block.title} placeholder="Document title" onChange={(event) => onUpdate({ ...block, title: event.target.value })} />
      <Input value={block.description ?? ""} placeholder="Description" onChange={(event) => onUpdate({ ...block, description: event.target.value })} />
      <Input value={block.href} placeholder="Document URL" onChange={(event) => onUpdate({ ...block, href: event.target.value })} />
      <div><Button type="button" size="sm" variant="secondary" onClick={onReplace}>Replace document</Button></div>
    </div>
  );
}

function LinkEditor({
  block,
  fieldRef,
  onUpdate,
  onReplace,
}: {
  block: DocumentationArticleBlock;
  fieldRef: (node: HTMLInputElement | null) => void;
  onUpdate: (block: ArticleBlock) => void;
  onReplace: () => void;
}) {
  return (
    <div className="grid gap-3">
      <Input ref={fieldRef} value={block.title} placeholder="Link title" onChange={(event) => onUpdate({ ...block, title: event.target.value } as ArticleBlock)} />
      <Input value={block.description ?? ""} placeholder="Description" onChange={(event) => onUpdate({ ...block, description: event.target.value } as ArticleBlock)} />
      <Input value={block.href} placeholder="https://..." onChange={(event) => onUpdate({ ...block, href: event.target.value } as ArticleBlock)} />
      <div><Button type="button" size="sm" variant="secondary" onClick={onReplace}>Replace with uploaded document</Button></div>
    </div>
  );
}

function TableEditor({ block, onUpdate }: { block: Extract<ArticleBlock, { type: "table" }>; onUpdate: (block: ArticleBlock) => void }) {
  const columns = block.columns.length ? block.columns : ["Column 1", "Column 2"];
  const rows = block.rows.length ? block.rows : [["", ""]];
  return (
    <div className="grid gap-3">
      <div className="overflow-x-auto pb-1">
        <div className="grid min-w-[520px] gap-2" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
          {columns.map((column, index) => <Input key={index} value={column} onChange={(event) => onUpdate({ ...block, columns: columns.map((item, itemIndex) => itemIndex === index ? event.target.value : item) })} />)}
        </div>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="mt-2 grid min-w-[520px] gap-2" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
            {columns.map((_, cellIndex) => <Input key={cellIndex} value={row[cellIndex] ?? ""} onChange={(event) => onUpdate({ ...block, rows: rows.map((item, itemIndex) => itemIndex === rowIndex ? columns.map((__, index) => index === cellIndex ? event.target.value : item[index] ?? "") : item) })} />)}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={() => onUpdate({ ...block, rows: [...rows, columns.map(() => "")] })}>Add row</Button>
        <Button type="button" size="sm" variant="ghost" disabled={rows.length <= 1} onClick={() => onUpdate({ ...block, rows: rows.slice(0, -1) })}>Remove row</Button>
        <Button type="button" size="sm" variant="secondary" disabled={columns.length >= 6} onClick={() => onUpdate({ ...block, columns: [...columns, `Column ${columns.length + 1}`], rows: rows.map((row) => [...row, ""]) })}>Add column</Button>
        <Button type="button" size="sm" variant="ghost" disabled={columns.length <= 2} onClick={() => onUpdate({ ...block, columns: columns.slice(0, -1), rows: rows.map((row) => row.slice(0, -1)) })}>Remove column</Button>
      </div>
    </div>
  );
}
