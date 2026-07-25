import { invalidatePublicCache } from "@/jobs/cacheInvalidator.js";
import { mediaService } from "@/modules/media/media.service.js";
import { skillsRepository } from "@/modules/skills/skills.repository.js";

export const skillsService = {
  getCms: skillsRepository.getOrSeed,
  async updateCms(data: Parameters<typeof skillsRepository.update>[0]) {
    const result = await skillsRepository.update(data);
    await Promise.all([invalidatePublicCache(), mediaService.syncUsageForDocument("skillsContent", "singleton", result ?? data)]);
    return result;
  },
};
