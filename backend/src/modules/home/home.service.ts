import { homeRepository } from "@/modules/home/home.repository.js";
import { skillsRepository } from "@/modules/skills/skills.repository.js";
import { projectsService } from "@/modules/projects/projects.service.js";
import { blogService } from "@/modules/blog/blog.service.js";
import { invalidatePublicCache } from "@/jobs/cacheInvalidator.js";
import { mediaService } from "@/modules/media/media.service.js";

export const homeService = {
  async publicHome() {
    const [home, skills, featuredProjectsResult, latestArticles] = await Promise.all([
      homeRepository.getOrSeed(),
      skillsRepository.getOrSeed(),
      projectsService.list({ category: "All", search: "", sort: "newest", page: 1, pageSize: 3, featured: true, limit: 3 }),
      blogService.latest(3),
    ]);
    return {
      hero: home.hero,
      featuredProjects: featuredProjectsResult.items,
      skills: { categories: [...skills.categories].sort((a, b) => a.orderIndex - b.orderIndex).map(({ id, title, items }) => ({ id, title, items })) },
      currentlyLearning: { items: [...skills.learningItems].sort((a, b) => a.orderIndex - b.orderIndex).map(({ label, icon, progressPercent }) => ({ label, icon, progressPercent })) },
      latestArticles,
    };
  },
  getCms: homeRepository.getOrSeed,
  async updateCms(data: Parameters<typeof homeRepository.update>[0]) {
    const result = await homeRepository.update(data);
    await Promise.all([invalidatePublicCache(), mediaService.syncUsageForDocument("homeContent", "singleton", result ?? data)]);
    return result;
  },
};
