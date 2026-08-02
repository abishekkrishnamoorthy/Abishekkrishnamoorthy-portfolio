import { beforeEach, describe, expect, it, vi } from "vitest";
import { seoService } from "@/modules/seo/seo.service.js";

const mocks = vi.hoisted(() => ({
  redis: { del: vi.fn(), get: vi.fn(), set: vi.fn() },
  invalidatePublicCache: vi.fn(),
  mediaSync: vi.fn(),
  mediaClear: vi.fn(),
  notify: vi.fn(),
  findByPagePathLean: vi.fn(),
  findByIdLean: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("@/config/redis.js", () => ({ getRedis: () => mocks.redis, markRedisUnavailable: vi.fn() }));
vi.mock("@/jobs/cacheInvalidator.js", () => ({ invalidatePublicCache: mocks.invalidatePublicCache }));
vi.mock("@/modules/media/media.service.js", () => ({ mediaService: { syncUsageForDocument: mocks.mediaSync, clearUsageForDocument: mocks.mediaClear } }));
vi.mock("@/modules/seo/seo.repository.js", () => ({
  seoRepository: {
    list: vi.fn(),
    listPublicIndexablePaths: vi.fn(),
    findByPagePathLean: mocks.findByPagePathLean,
    findByIdLean: mocks.findByIdLean,
    create: mocks.create,
    update: mocks.update,
    delete: mocks.delete,
  },
}));
vi.mock("@/modules/seo/seo-revalidation.service.js", () => ({ notifyFrontendSeoRevalidation: mocks.notify }));
vi.mock("@/modules/settings/settings.service.js", () => ({ settingsService: { getGlobalSeoForPublic: vi.fn() } }));

const documentFor = (pagePath: string) => ({
  id: `${pagePath}-id`,
  pagePath,
  toObject: () => ({ pagePath }),
});

describe("seoService revalidation hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.redis.get.mockResolvedValue(null);
    mocks.redis.set.mockResolvedValue(undefined);
    mocks.redis.del.mockResolvedValue(1);
    mocks.invalidatePublicCache.mockResolvedValue(0);
    mocks.mediaSync.mockResolvedValue(undefined);
    mocks.mediaClear.mockResolvedValue(undefined);
    mocks.notify.mockResolvedValue(undefined);
  });

  it("revalidates a newly created page path and public page summaries", async () => {
    const document = documentFor("/projects/qconnect");
    mocks.findByPagePathLean.mockResolvedValue(null);
    mocks.create.mockResolvedValue(document);

    await seoService.create({ pagePath: document.pagePath });

    expect(mocks.notify).toHaveBeenCalledWith({ paths: ["/projects/qconnect"] });
    expect(mocks.invalidatePublicCache).toHaveBeenCalledWith("cache:public:/seo/pages:*");
  });

  it("revalidates both paths when a page override moves", async () => {
    const current = documentFor("/old");
    const updated = documentFor("/new");
    mocks.findByIdLean.mockResolvedValue(current);
    mocks.findByPagePathLean.mockResolvedValue(null);
    mocks.update.mockResolvedValue(updated);

    await seoService.update("old-id", { pagePath: "/new" });

    expect(mocks.notify).toHaveBeenCalledWith({ paths: ["/old", "/new"] });
  });

  it("revalidates the deleted page path", async () => {
    const current = documentFor("/projects/qconnect");
    mocks.findByIdLean.mockResolvedValue(current);
    mocks.delete.mockResolvedValue(current);

    await seoService.delete("project-id");

    expect(mocks.notify).toHaveBeenCalledWith({ paths: ["/projects/qconnect"] });
  });
});
