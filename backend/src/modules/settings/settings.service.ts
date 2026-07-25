import { invalidatePublicCache } from "@/jobs/cacheInvalidator.js";
import { settingsRepository } from "@/modules/settings/settings.repository.js";

export const settingsService = {
  get: settingsRepository.getOrSeed,
  async update(data: unknown) {
    const result = await settingsRepository.update(data);
    await invalidatePublicCache();
    return result;
  },
};
