import { beforeEach, describe, expect, it, vi } from "vitest";
import { settingsService } from "@/modules/settings/settings.service.js";
import { settingsRepository } from "@/modules/settings/settings.repository.js";
import { invalidatePublicCache } from "@/jobs/cacheInvalidator.js";

const mocks = vi.hoisted(() => ({
  redis: {
    keys: vi.fn(),
    del: vi.fn(),
  },
  invalidatePublicCache: vi.fn(),
  getOrSeed: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/config/redis.js", () => ({
  getRedis: () => mocks.redis,
  markRedisUnavailable: vi.fn(),
}));

vi.mock("@/jobs/cacheInvalidator.js", () => ({
  invalidatePublicCache: mocks.invalidatePublicCache,
}));

vi.mock("@/modules/settings/settings.repository.js", () => ({
  settingsRepository: {
    getOrSeed: mocks.getOrSeed,
    update: mocks.update,
  },
}));

const globalSeo = {
  siteName: "Portfolio",
  siteUrl: "https://example.com",
  defaultMetaTitle: "Default SEO Title",
  titleTemplate: "%page% | Portfolio",
  defaultMetaDescription: "Default SEO description.",
  defaultAuthor: "Abishek",
  defaultRobots: "index,follow",
};

describe("settingsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.redis.keys.mockImplementation(async (pattern: string) => {
      if (pattern === "seo:global") return ["seo:global"];
      if (pattern === "seo:resolve:*") return ["seo:resolve:/", "seo:resolve:/contact"];
      return [];
    });
    mocks.redis.del.mockResolvedValue(1);
    mocks.invalidatePublicCache.mockResolvedValue(0);
    mocks.getOrSeed.mockResolvedValue({ _id: "singleton", seo: globalSeo, forms: {}, scheduling: {} });
    mocks.update.mockResolvedValue({
      _id: "singleton",
      seo: { ...globalSeo, defaultMetaTitle: "Updated SEO Title" },
      forms: {},
      scheduling: {},
    });
  });

  it("invalidates global and resolved SEO caches after a Global SEO update", async () => {
    await settingsService.update({ seo: { defaultMetaTitle: "Updated SEO Title" } });

    expect(invalidatePublicCache).toHaveBeenCalled();
    expect(settingsRepository.update).toHaveBeenCalledWith({
      seo: { ...globalSeo, defaultMetaTitle: "Updated SEO Title" },
    });
    expect(mocks.redis.keys).toHaveBeenCalledWith("seo:global");
    expect(mocks.redis.keys).toHaveBeenCalledWith("seo:resolve:*");
    expect(mocks.redis.del).toHaveBeenCalledWith("seo:global");
    expect(mocks.redis.del).toHaveBeenCalledWith("seo:resolve:/", "seo:resolve:/contact");
  });
});
