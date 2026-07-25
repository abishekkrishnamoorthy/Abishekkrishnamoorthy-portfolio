"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Clock3, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { SkeletonBlock } from "@/components/common/SkeletonBlock";
import { Tag } from "@/components/common/Tag";
import { useBlogs } from "@/hooks/useBlogs";
import { cn, formatDate } from "@/lib/utils";
import type { ArticlePreview } from "@/types/blog.types";
import { apiErrorMessage } from "@/types/common.types";

export function BlogIndexClient() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const catalogQuery = useBlogs({ pageSize: 20 });
  const query = useBlogs({ pageSize: 20, search: debouncedSearch || undefined, category: activeFilter === "All" ? undefined : activeFilter });
  const filters = useMemo(() => ["All", ...new Set(catalogQuery.data?.articles.map((post) => post.category) ?? [])], [catalogQuery.data]);
  const posts = query.data?.articles ?? [];
  const featuredPost = query.data?.featuredArticle;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  return (
    <main>
      <BlogHero total={catalogQuery.data?.total ?? 0} categories={filters.slice(1)} />
      <section className="section-container pt-0">
        <div className="grid gap-4">
          <label className="group flex min-h-14 items-center gap-3 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 transition focus-within:border-[rgba(212,175,55,0.42)]">
            <Search className="h-5 w-5 text-[var(--text-muted)] transition group-focus-within:text-[var(--accent-gold)]" />
            <span className="sr-only">Search articles</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search articles..." className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-[var(--text-muted)]" />
          </label>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
                  activeFilter === filter
                    ? "border-[rgba(212,175,55,0.4)] bg-[rgba(212,175,55,0.1)] text-[var(--accent-gold)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[rgba(212,175,55,0.28)] hover:text-white",
                )}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {query.isLoading ? <section className="section-container pt-0"><SkeletonBlock variant="row" count={3} /></section> : null}
      {query.isError ? <section className="section-container pt-0"><ErrorState message={apiErrorMessage(query.error)} onRetry={() => query.refetch()} /></section> : null}
      {!query.isLoading && !query.isError && !posts.length ? <section className="section-container pt-0"><EmptyState title="No posts found" /></section> : null}
      {featuredPost ? <section className="section-container pt-0">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-gold)]">Featured Post</p>
        <FeaturedArticleCard article={featuredPost} />
      </section> : null}

      {posts.length ? <section className="section-container pt-0">
        <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-gold)]">Latest Posts</p>
            <h2 className="text-[24px] font-bold text-white md:text-[32px]">Field notes from recent builds.</h2>
          </div>
          <p className="text-sm text-[var(--text-muted)]">Showing {posts.length} of {query.data?.total ?? posts.length} posts</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post, index) => <ArticleCard key={post.slug} article={post} index={index} />)}
        </div>
      </section> : null}
    </main>
  );
}

function BlogHero({ total, categories }: { total: number; categories: string[] }) {
  return (
    <section className="section-container grid items-end gap-10 md:grid-cols-[1fr_320px]">
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-gold)]">Blog</p>
        <h1 className="max-w-2xl text-[32px] font-bold leading-10 text-white md:text-[52px] md:leading-[64px]">Developer Journal</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
          A collection of project updates, technical articles, deployment guides, AI experiments and learning notes.
        </p>
      </div>
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(18,19,24,0.72)] p-5">
        <div className="grid grid-cols-2 gap-3">
          <Stat value={String(total)} label="Posts" />
          <Stat value={String(categories.length)} label="Categories" />
        </div>
        <div className="mt-5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--bg-surface-alt)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Focus</p>
          <p className="mt-2 text-sm font-medium text-white">{categories.slice(0, 3).join(" • ")}</p>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}

function FeaturedArticleCard({ article }: { article: ArticlePreview }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative grid overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] transition hover:-translate-y-1 hover:border-[rgba(212,175,55,0.38)] motion-reduce:hover:translate-y-0 lg:grid-cols-[0.92fr_1fr]"
    >
      <Link href={`/blog/${article.slug}`} aria-label={`Read ${article.title}`} className="absolute inset-0 z-[1]" />
      <div className="relative min-h-[260px] overflow-hidden bg-[var(--bg-surface-alt)]">
        <Image src={article.coverImageUrl ?? "/assets/graphics/mesh-glow.png"} alt={`${article.title} cover`} fill className="object-cover opacity-80 transition duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,11,15,0.1),rgba(11,11,15,0.72))]" />
      </div>
      <div className="relative z-10 p-6 md:p-8">
        <ArticleCategory category={article.category} />
        <h2 className="mt-5 text-[26px] font-bold leading-9 text-white md:text-[34px] md:leading-[44px]">{article.title}</h2>
        <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)] md:text-base">{article.excerpt}</p>
        <ArticleMeta article={article} className="mt-6" />
        <Tags tags={article.tags} className="mt-5" />
        <div className="mt-7">
          <Button href={`/blog/${article.slug}`} icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">
            Read Article
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

function ArticleCard({ article, index }: { article: ArticlePreview; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.32, delay: Math.min(index * 0.04, 0.18), ease: "easeOut" }}
      className="group relative flex min-h-full flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] transition hover:-translate-y-1 hover:border-[rgba(212,175,55,0.36)] motion-reduce:hover:translate-y-0"
    >
      <Link href={`/blog/${article.slug}`} aria-label={`Read ${article.title}`} className="absolute inset-0 z-[1]" />
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-surface-alt)]">
        <Image src={article.coverImageUrl ?? "/assets/graphics/mesh-glow.png"} alt={`${article.title} cover`} fill className="object-cover opacity-[0.82] transition duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(11,11,15,0.58))]" />
      </div>
      <div className="relative z-10 flex flex-1 flex-col p-5">
        <ArticleCategory category={article.category} />
        <h3 className="mt-4 text-xl font-semibold leading-7 text-white">{article.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--text-secondary)]">{article.excerpt}</p>
        <Tags tags={article.tags} className="mt-5" />
        <div className="mt-auto pt-6">
          <ArticleMeta article={article} compact />
        </div>
      </div>
    </motion.article>
  );
}

function ArticleCategory({ category }: { category: string }) {
  return <span className="w-fit rounded-full border border-[rgba(212,175,55,0.22)] bg-[rgba(212,175,55,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-gold)]">{category}</span>;
}

function ArticleMeta({ article, className }: { article: ArticlePreview; className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--text-muted)]", className)}>
      <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {formatDate(article.publishedAt)}</span>
      <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" /> {article.readTimeMinutes} min read</span>
    </div>
  );
}

function Tags({ tags, className }: { tags: string[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.slice(0, 4).map((tag) => <Tag key={tag} label={tag} />)}
    </div>
  );
}
