"use client";

import { Loader2, SearchX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { SkeletonBlock } from "@/components/common/SkeletonBlock";
import { ProjectListItem } from "@/components/projects/ProjectListItem";
import { ProjectsToolbar } from "@/components/projects/ProjectsToolbar";
import { useProjects } from "@/hooks/useProjects";
import type { ProjectCategory, ProjectSort } from "@/types/project.types";
import { apiErrorMessage } from "@/types/common.types";

export function ProjectsPageClient() {
  const [category, setCategory] = useState<"All" | ProjectCategory>("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<ProjectSort>("newest");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const query = useProjects({ category, search: debouncedSearch, sort, pageSize: 5 });
  const projects = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
      },
      { rootMargin: "240px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [query]);

  const clear = () => {
    setCategory("All");
    setSearch("");
    setDebouncedSearch("");
    setSort("newest");
  };

  return (
    <section className="section-container pt-0">
      <ProjectsToolbar category={category} search={search} sort={sort} onCategory={setCategory} onSearch={setSearch} onSort={setSort} />
      {query.isLoading ? <div className="grid gap-5"><SkeletonBlock variant="row" count={5} /></div> : null}
      {query.isError ? <ErrorState message={apiErrorMessage(query.error)} onRetry={() => query.refetch()} /> : null}
      {!query.isLoading && !query.isError && projects.length === 0 ? (
        <EmptyState icon={<SearchX className="h-5 w-5" />} title={category === "All" && !debouncedSearch ? "Projects are being added - check back soon" : "No projects match your search"} description="Try another category, search term, or sort order." action={{ label: "Clear filters", onClick: clear }} />
      ) : null}
      <div className="grid gap-5 opacity-100 transition">
        {projects.map((project) => <ProjectListItem key={project.id} project={project} />)}
      </div>
      <div ref={sentinelRef} className="h-12" />
      {query.isFetchingNextPage ? <div className="flex justify-center py-4 text-[var(--accent-gold)]"><Loader2 className="h-5 w-5 animate-spin" /></div> : null}
      {!query.hasNextPage && projects.length > 0 ? <p className="py-4 text-center text-sm text-[var(--text-muted)]">You&apos;ve reached the end</p> : null}
    </section>
  );
}
