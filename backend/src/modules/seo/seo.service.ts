import { AppError } from "@/common/AppError.js";
import { getRedis, markRedisUnavailable } from "@/config/redis.js";
import { seoRepository } from "@/modules/seo/seo.repository.js";
import { mediaService } from "@/modules/media/media.service.js";
import { invalidatePublicCache } from "@/jobs/cacheInvalidator.js";
import { type GlobalSeo, type RobotsValue } from "@/modules/settings/settings.defaults.js";
import { settingsService } from "@/modules/settings/settings.service.js";
import { notifyFrontendSeoRevalidation } from "@/modules/seo/seo-revalidation.service.js";

const seoCacheTtlSeconds = 300;

type SeoOverrideLike = {
  _id?: unknown;
  pagePath: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  robots?: RobotsValue;
  updatedAt?: Date | string;
};

export type ResolvedSeo = {
  path: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  robots: RobotsValue;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl?: string;
  author: string;
  siteName: string;
  siteUrl: string;
  googleVerificationCode?: string;
  defaultFaviconUrl?: string;
  hasPageOverride: boolean;
};

export type SeoPageSummary = {
  pagePath: string;
  robots?: RobotsValue;
  updatedAt: string;
};

function seoCacheKey(path: string) {
  return `seo:resolve:${path}`;
}

async function getCached<T>(key: string) {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const cached = await redis.get(key);
    return cached ? (JSON.parse(cached) as T) : null;
  } catch (error) {
    markRedisUnavailable(error);
    return null;
  }
}

async function setCached(key: string, value: unknown) {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", seoCacheTtlSeconds);
  } catch (error) {
    markRedisUnavailable(error);
  }
}

async function deleteCached(...keys: string[]) {
  const redis = getRedis();
  if (!redis || !keys.length) return;
  try {
    await redis.del(...keys);
  } catch (error) {
    markRedisUnavailable(error);
  }
}

function pageTitle(title: string | undefined, global: GlobalSeo) {
  if (!title) return global.defaultMetaTitle;
  return global.titleTemplate.replace("%page%", title);
}

function canonical(path: string, global: GlobalSeo, override?: SeoOverrideLike | null) {
  return override?.canonicalUrl || `${global.siteUrl}${path === "/" ? "" : path}`;
}

function normalizePageSummary(item: SeoOverrideLike): SeoPageSummary {
  return {
    pagePath: item.pagePath,
    robots: item.robots,
    updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date(0).toISOString(),
  };
}

export const seoService = {
  list: seoRepository.list,
  async getGlobalSeo() {
    const cached = await getCached<GlobalSeo>("seo:global");
    if (cached) return cached;
    const globalSeo = await settingsService.getGlobalSeoForPublic();
    await setCached("seo:global", globalSeo);
    return globalSeo;
  },
  async resolve(path: string): Promise<ResolvedSeo> {
    const key = seoCacheKey(path);
    const cached = await getCached<ResolvedSeo>(key);
    if (cached) return cached;

    const [global, override] = await Promise.all([settingsService.getGlobalSeoForPublic(), seoRepository.findByPagePathLean(path) as Promise<SeoOverrideLike | null>]);
    const metaTitle = pageTitle(override?.metaTitle, global);
    const metaDescription = override?.metaDescription || global.defaultMetaDescription;
    const result: ResolvedSeo = {
      path,
      metaTitle,
      metaDescription,
      canonicalUrl: canonical(path, global, override),
      robots: override?.robots || global.defaultRobots || "index,follow",
      ogTitle: override?.ogTitle || metaTitle,
      ogDescription: override?.ogDescription || metaDescription,
      ...(override?.ogImageUrl || global.defaultOgImageUrl ? { ogImageUrl: override?.ogImageUrl || global.defaultOgImageUrl } : {}),
      author: global.defaultAuthor,
      siteName: global.siteName,
      siteUrl: global.siteUrl,
      ...(global.googleVerificationCode ? { googleVerificationCode: global.googleVerificationCode } : {}),
      ...(global.defaultFaviconUrl ? { defaultFaviconUrl: global.defaultFaviconUrl } : {}),
      hasPageOverride: Boolean(override),
    };
    await setCached(key, result);
    return result;
  },
  async listPages() {
    const pages = (await seoRepository.listPublicIndexablePaths()) as SeoOverrideLike[];
    return pages.map(normalizePageSummary);
  },
  async create(data: unknown) {
    const payload = data as SeoOverrideLike;
    const existing = await seoRepository.findByPagePathLean(payload.pagePath);
    if (existing) throw new AppError(409, "SEO_PAGE_PATH_CONFLICT", "A page override already exists for this path");
    const result = await seoRepository.create(data);
    await Promise.all([
      deleteCached(seoCacheKey(result.pagePath)),
      invalidatePublicCache("cache:public:/seo/pages:*"),
      mediaService.syncUsageForDocument("seoOverrides", result.id, result.toObject()),
      notifyFrontendSeoRevalidation({ paths: [result.pagePath] }),
    ]);
    return result;
  },
  async update(id: string, data: unknown) {
    const current = (await seoRepository.findByIdLean(id)) as SeoOverrideLike | null;
    const payload = data as Partial<SeoOverrideLike>;
    if (payload.pagePath && payload.pagePath !== current?.pagePath) {
      const existing = await seoRepository.findByPagePathLean(payload.pagePath);
      if (existing) throw new AppError(409, "SEO_PAGE_PATH_CONFLICT", "A page override already exists for this path");
    }
    const result = await seoRepository.update(id, data);
    const keys = [current?.pagePath, result?.pagePath].filter(Boolean).map((path) => seoCacheKey(path as string));
    await Promise.all([
      deleteCached(...keys),
      invalidatePublicCache("cache:public:/seo/pages:*"),
      mediaService.syncUsageForDocument("seoOverrides", id, result?.toObject() ?? data),
      notifyFrontendSeoRevalidation({ paths: [current?.pagePath, result?.pagePath].filter(Boolean) as string[] }),
    ]);
    return result;
  },
  async delete(id: string) {
    const current = (await seoRepository.findByIdLean(id)) as SeoOverrideLike | null;
    const result = await seoRepository.delete(id);
    await Promise.all([
      current?.pagePath ? deleteCached(seoCacheKey(current.pagePath)) : Promise.resolve(),
      invalidatePublicCache("cache:public:/seo/pages:*"),
      mediaService.clearUsageForDocument("seoOverrides", id),
      notifyFrontendSeoRevalidation({ paths: current?.pagePath ? [current.pagePath] : [] }),
    ]);
    return result;
  },
};
