"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { SkeletonBlock } from "@/components/common/SkeletonBlock";
import { OnThisPageNav, ProjectHeader, ProjectPrevNextNav, RelatedProjectsSection } from "@/components/project-details/ProjectDetailSections";
import { ProjectQuickStats } from "@/components/project-details/ProjectQuickStats";
import { ProjectTabs } from "@/components/project-details/ProjectTabs";
import { useProjectBySlug, useRelatedProjects } from "@/hooks/useProjects";
import { apiErrorMessage } from "@/types/common.types";

export function ProjectDetailPageClient({ slug }: { slug: string }) {
  const projectQuery = useProjectBySlug(slug);
  const relatedQuery = useRelatedProjects(slug);
  if (projectQuery.isLoading) return <main className="section-container"><SkeletonBlock variant="row" count={3} /></main>;
  if (projectQuery.isError) return <main className="section-container"><ErrorState message={apiErrorMessage(projectQuery.error)} onRetry={() => projectQuery.refetch()} /></main>;
  if (!projectQuery.data) return <main className="section-container"><EmptyState title="Project not found" /></main>;
  const project = projectQuery.data;

  return (
    <main>
      <ProjectHeader project={project} />
      <section className="section-container pt-0"><ProjectQuickStats project={project} /></section>
      <section className="section-container grid gap-8 pt-0 lg:grid-cols-[1fr_280px]">
        <ProjectTabs project={project} />
        <OnThisPageNav project={project} />
      </section>
      {relatedQuery.data ? <RelatedProjectsSection projects={relatedQuery.data} /> : null}
      <ProjectPrevNextNav project={project} />
    </main>
  );
}
