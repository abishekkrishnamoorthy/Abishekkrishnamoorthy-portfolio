import { invalidatePublicCache } from "@/jobs/cacheInvalidator.js";
import { experienceRepository } from "@/modules/experience/experience.repository.js";
import { mediaService } from "@/modules/media/media.service.js";

export const experienceService = {
  list: experienceRepository.list,
  async create(data: unknown) {
    const result = await experienceRepository.create(data);
    await Promise.all([invalidatePublicCache(), mediaService.syncUsageForDocument("experience", result.id, result.toObject())]);
    return result;
  },
  async update(id: string, data: unknown) {
    const result = await experienceRepository.update(id, data);
    await Promise.all([invalidatePublicCache(), mediaService.syncUsageForDocument("experience", id, result?.toObject() ?? data)]);
    return result;
  },
  async delete(id: string) {
    const result = await experienceRepository.delete(id);
    await Promise.all([invalidatePublicCache(), mediaService.clearUsageForDocument("experience", id)]);
    return result;
  },
  async reorder(items: Array<{ id: string; orderIndex: number }>) {
    const result = await experienceRepository.reorder(items);
    await invalidatePublicCache();
    return result;
  },
};
