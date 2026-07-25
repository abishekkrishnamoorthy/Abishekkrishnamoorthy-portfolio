"use client";

import { ErrorState } from "@/components/common/ErrorState";
import { SkeletonBlock } from "@/components/common/SkeletonBlock";
import { ContactCTASection, CurrentlyLearningSection, FeaturedProjectsSection, LatestBlogPreviewSection, SkillsSection } from "@/components/home/HomeSections";
import { HeroSection } from "@/components/home/HeroSection";
import { useHome } from "@/hooks/useHome";
import { useContact } from "@/hooks/useContact";
import { apiErrorMessage } from "@/types/common.types";

export function HomePageClient() {
  const query = useHome();
  const contactQuery = useContact();
  if (query.isLoading) return <main className="section-container grid gap-6"><SkeletonBlock variant="row" count={4} /></main>;
  if (query.isError || !query.data) return <main className="section-container"><ErrorState message={apiErrorMessage(query.error)} onRetry={() => query.refetch()} /></main>;

  return (
    <main>
      <HeroSection hero={query.data.hero} />
      <FeaturedProjectsSection projects={query.data.featuredProjects} />
      <SkillsSection skills={query.data.skills} />
      <CurrentlyLearningSection skills={query.data.skills} />
      <LatestBlogPreviewSection posts={query.data.latestArticles} />
      {contactQuery.data ? <ContactCTASection title={contactQuery.data.hero.title} description={contactQuery.data.hero.description} scheduleLabel={contactQuery.data.communicationMethods.find((method) => method.visible)?.actionLabel} /> : null}
    </main>
  );
}
