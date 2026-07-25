"use client";

import { Check, Clipboard, LinkIcon, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Tag } from "@/components/common/Tag";
import { formatDate } from "@/lib/utils";
import type { Article, ArticleReference } from "@/types/blog.types";

export function BlogSidebar({ article, relatedArticles }: { article: Article; relatedArticles: ArticleReference[] }) {
  return (
    <aside className="hidden min-w-0 md:block">
      <div className="custom-scrollbar sticky top-24 max-h-[calc(100dvh-112px)] space-y-8 overflow-y-auto pr-1 transition">
        <AboutArticle article={article} />
        <SidebarRelatedArticles articles={relatedArticles} />
        <SharePanel title={article.title} />
      </div>
    </aside>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function AboutArticle({ article }: { article: Article }) {
  return (
    <SidebarSection title="About this article">
      <dl className="grid gap-3 text-sm">
        <MetaRow label="Published" value={formatDate(article.publishedAt)} />
        <MetaRow label="Updated" value={formatDate(article.updatedAt)} />
        <MetaRow label="Reading Time" value={`${article.readTimeMinutes} min read`} />
        <MetaRow label="Category" value={article.category} />
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        {article.tags.map((tag) => <Tag key={tag} label={tag} />)}
      </div>
    </SidebarSection>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.05)] py-2 first:pt-0 last:border-b-0 last:pb-0">
      <dt className="text-[var(--text-muted)]">{label}</dt>
      <dd className="text-right text-white">{value}</dd>
    </div>
  );
}

function SidebarRelatedArticles({ articles }: { articles: ArticleReference[] }) {
  return (
    <SidebarSection title="Related Articles">
      <div className="grid gap-3">
        {articles.slice(0, 2).map((article) => (
          <Link key={article.slug} href={`/blog/${article.slug}`} className="group grid grid-cols-[72px_1fr] gap-3 rounded-xl border border-[rgba(255,255,255,0.04)] p-2 transition hover:-translate-y-0.5 hover:border-[rgba(212,175,55,0.18)] hover:bg-[rgba(255,255,255,0.02)] motion-reduce:hover:translate-y-0">
            <span className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[var(--bg-surface-alt)]">
              <Image src={article.coverImageUrl ?? "/assets/graphics/mesh-glow.png"} alt="" fill sizes="72px" className="object-cover opacity-[0.82] transition duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100" />
            </span>
            <span className="min-w-0">
              <span className="line-clamp-2 text-sm font-medium leading-5 text-white">{article.title}</span>
              <span className="mt-1 block text-xs text-[var(--text-muted)]">{[article.readTimeMinutes ? `${article.readTimeMinutes} min` : null, article.category].filter(Boolean).join(" · ")}</span>
            </span>
          </Link>
        ))}
      </div>
    </SidebarSection>
  );
}

function SharePanel({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window === "undefined" ? "" : window.location.href;

  const copy = async () => {
    await navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <SidebarSection title="Share">
      <div className="flex gap-2">
        <button type="button" onClick={copy} aria-label={copied ? "Link copied" : "Copy link"} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-transparent text-white transition hover:border-[rgba(212,175,55,0.32)]">
          {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
        </button>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-transparent text-white transition hover:border-[rgba(212,175,55,0.32)]">
          <LinkIcon className="h-4 w-4" />
        </a>
        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-transparent text-white transition hover:border-[rgba(212,175,55,0.32)]">
          <Share2 className="h-4 w-4" />
        </a>
      </div>
    </SidebarSection>
  );
}
