"use client";

import { ErrorState } from "@/components/common/ErrorState";
import { SkeletonBlock } from "@/components/common/SkeletonBlock";
import { ProjectsHero } from "@/components/projects/ProjectsHero";
import { ProjectsPageClient } from "@/components/projects/ProjectsPageClient";
import { useProjectsHeader } from "@/hooks/useProjects";
import { apiErrorMessage } from "@/types/common.types";

export function ProjectsPageContent() {
  const heroQuery = useProjectsHeader();

  return (
    <main>
      {heroQuery.isLoading ? <section className="section-container"><SkeletonBlock variant="row" /></section> : null}
      {heroQuery.isError ? <section className="section-container"><ErrorState message={apiErrorMessage(heroQuery.error)} onRetry={() => heroQuery.refetch()} /></section> : null}
      {heroQuery.data ? <ProjectsHero header={heroQuery.data} /> : null}
      <ProjectsPageClient />
    </main>
  );
}
