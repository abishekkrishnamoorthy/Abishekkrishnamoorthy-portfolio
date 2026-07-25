import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Clock3, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArticleRenderer } from "@/components/blog/ArticleRenderer";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { Tag } from "@/components/common/Tag";
import { cn, formatDate } from "@/lib/utils";
import type { Article, ArticleReference } from "@/types/blog.types";

export function BlogPostHeader({ post }: { post: Article }) {
  return (
    <section className="section-container pb-8">
      <Link href="/blog" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--accent-gold)]">
        <ChevronLeft className="h-4 w-4" />
        Back to Blog
      </Link>
      <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
        <div>
          <p className="mb-4 w-fit rounded-full border border-[rgba(212,175,55,0.22)] bg-[rgba(212,175,55,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-gold)]">{post.category}</p>
          <h1 className="max-w-4xl text-[30px] font-bold leading-10 text-white md:text-[48px] md:leading-[60px]">{post.title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">{post.excerpt}</p>
        </div>
        {post.coverImageUrl ? (
          <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <Image src={post.coverImageUrl} alt={`${post.title} cover`} fill className="object-cover opacity-[0.84]" priority />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,11,15,0.1),rgba(11,11,15,0.68))]" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function BlogMetadata({ post }: { post: Article }) {
  return (
    <section className="section-container pt-0">
      <div className="mx-auto max-w-[920px] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
        <div className="grid gap-4 text-sm text-[var(--text-secondary)] md:grid-cols-4">
          <MetaItem icon={<CalendarDays className="h-4 w-4" />} label="Published" value={formatDate(post.publishedAt)} />
          <MetaItem icon={<CalendarDays className="h-4 w-4" />} label="Updated" value={formatDate(post.updatedAt)} />
          <MetaItem icon={<Clock3 className="h-4 w-4" />} label="Reading Time" value={`${post.readTimeMinutes} min read`} />
          <MetaItem icon={<UserRound className="h-4 w-4" />} label="Author" value={post.author} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags.map((tag) => <Tag key={tag} label={tag} />)}
        </div>
      </div>
    </section>
  );
}

function MetaItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-[var(--accent-gold)]">{icon}</span>
      <span>
        <span className="block text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</span>
        <span className="mt-1 block text-white">{value}</span>
      </span>
    </div>
  );
}

export function BlogArticleContent({ post }: { post: Article }) {
  return (
    <section className="section-container pt-0">
      <ArticleRenderer blocks={post.blocks} />
    </section>
  );
}

export function BlogReadingLayout({ article, relatedArticles, previous, next }: { article: Article; relatedArticles: ArticleReference[]; previous: ArticleReference | null; next: ArticleReference | null }) {
  return (
    <section className="section-container grid gap-10 pt-0 md:grid-cols-[minmax(0,75%)_minmax(240px,25%)] xl:grid-cols-[minmax(0,70%)_minmax(280px,30%)]">
      <div className="min-w-0">
        <ArticleRenderer blocks={article.blocks} />
        <BlogPrevNextNav previous={previous} next={next} />
      </div>
      <BlogSidebar article={article} relatedArticles={relatedArticles} />
    </section>
  );
}

export function BlogPrevNextNav({ previous, next }: { previous: ArticleReference | null; next: ArticleReference | null }) {
  return (
    <nav className="mx-auto mt-14 w-full max-w-[780px]" aria-label="Article navigation">
      <div className="grid gap-4 md:grid-cols-2">
        {previous ? <BlogNavCard direction="Previous Article" href={`/blog/${previous.slug}`} title={previous.title} /> : <div />}
        {next ? <BlogNavCard direction="Next Article" href={`/blog/${next.slug}`} title={next.title} align="right" /> : <div />}
      </div>
      <Link href="/blog" className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 text-sm font-semibold text-white transition hover:border-[rgba(212,175,55,0.36)]">
        <ArrowLeft className="h-4 w-4" />
        Back to Blogs
      </Link>
    </nav>
  );
}

function BlogNavCard({ direction, href, title, align }: { direction: string; href: string; title: string; align?: "right" }) {
  return (
    <Link href={href} className={cn("rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition hover:border-[rgba(212,175,55,0.36)]", align === "right" && "text-right")}>
      <span className={cn("flex items-center gap-2 text-sm text-[var(--text-muted)]", align === "right" && "justify-end")}>
        {align === "right" ? null : <ChevronLeft className="h-4 w-4" />}
        {direction}
        {align === "right" ? <ChevronRight className="h-4 w-4" /> : null}
      </span>
      <span className="mt-2 block font-semibold text-white">{title}</span>
    </Link>
  );
}
