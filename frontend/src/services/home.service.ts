import { apiClient } from "@/services/api";
import { mapArticlePreview, mapProject, type ArticlePreviewDto, type ProjectDto } from "@/services/mappers";
import { responseData } from "@/services/response";
import type { ApiResponse } from "@/types/common.types";
import type { HomeHero, HomePayload } from "@/types/home.types";

type HomeDto = {
  hero: HomeHero;
  featuredProjects: ProjectDto[];
  skills: { categories: Array<{ id: "frontend" | "backend" | "ai-tools-cloud"; title: string; items: string[] }> };
  currentlyLearning: { items: Array<{ label: string; icon: string; progressPercent: number }> };
  latestArticles: ArticlePreviewDto[];
};

export async function getHome(): Promise<HomePayload> {
  const dto = responseData(await apiClient.get<ApiResponse<HomeDto>>("/home"));
  return {
    hero: dto.hero,
    featuredProjects: dto.featuredProjects.map(mapProject),
    skills: {
      categories: dto.skills.categories.map(({ id, title, items }) => ({ category: id, title, items })),
      learningItems: dto.currentlyLearning.items,
    },
    latestArticles: dto.latestArticles.map(mapArticlePreview),
  };
}
