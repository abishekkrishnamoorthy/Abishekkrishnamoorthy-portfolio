import { invalidatePublicCache } from "@/jobs/cacheInvalidator.js";
import { seoRepository } from "@/modules/seo/seo.repository.js";
import { mediaService } from "@/modules/media/media.service.js";

export const seoService = {
  list: seoRepository.list,
  async create(data: unknown) {
    const result = await seoRepository.create(data);
    await Promise.all([invalidatePublicCache(), mediaService.syncUsageForDocument("seoOverrides", result.id, result.toObject())]);
    return result;
  },
  async update(id: string, data: unknown) {
    const result = await seoRepository.update(id, data);
    await Promise.all([invalidatePublicCache(), mediaService.syncUsageForDocument("seoOverrides", id, result?.toObject() ?? data)]);
    return result;
  },
  async delete(id: string) {
    const result = await seoRepository.delete(id);
    await Promise.all([invalidatePublicCache(), mediaService.clearUsageForDocument("seoOverrides", id)]);
    return result;
  },
};
