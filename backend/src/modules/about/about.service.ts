import { invalidatePublicCache } from "@/jobs/cacheInvalidator.js";
import { aboutRepository } from "@/modules/about/about.repository.js";
import { mediaService } from "@/modules/media/media.service.js";

export const aboutService = {
  get: aboutRepository.getOrSeed,
  async update(data: unknown) {
    const result = await aboutRepository.update(data);
    await Promise.all([invalidatePublicCache(), mediaService.syncUsageForDocument("aboutContent", "singleton", result ?? data)]);
    return result;
  },
};
