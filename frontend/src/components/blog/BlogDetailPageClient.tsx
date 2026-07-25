"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { SkeletonBlock } from "@/components/common/SkeletonBlock";
import { BlogPostHeader, BlogReadingLayout } from "@/components/blog/BlogDetailSections";
import { useBlogBySlug } from "@/hooks/useBlogs";
import { apiErrorMessage } from "@/types/common.types";

export function BlogDetailPageClient({ slug }: { slug: string }) {
  const query = useBlogBySlug(slug);
  if (query.isLoading) return <main className="section-container"><SkeletonBlock variant="row" count={3} /></main>;
  if (query.isError) return <main className="section-container"><ErrorState message={apiErrorMessage(query.error)} onRetry={() => query.refetch()} /></main>;
  if (!query.data) return <main className="section-container"><EmptyState title="Article not found" /></main>;

  return (
    <main>
      <BlogPostHeader post={query.data.article} />
      <BlogReadingLayout article={query.data.article} relatedArticles={query.data.relatedArticles} previous={query.data.previous} next={query.data.next} />
    </main>
  );
}
