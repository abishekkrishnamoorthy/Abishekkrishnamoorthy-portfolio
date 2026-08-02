import { getRedis, markRedisUnavailable } from "@/config/redis.js";
import { invalidatePublicCache } from "@/jobs/cacheInvalidator.js";
import { DEFAULT_GLOBAL_SEO, robotsValues, type GlobalSeo, type RobotsValue } from "@/modules/settings/settings.defaults.js";
import { notifyFrontendSeoRevalidation } from "@/modules/seo/seo-revalidation.service.js";
import { settingsRepository } from "@/modules/settings/settings.repository.js";

const globalSeoRevalidation = {
  paths: ["/", "/projects", "/blog", "/contact", "/sitemap.xml", "/robots.txt"],
  invalidateLayout: true,
};

type SettingsLike = {
  seo?: (Partial<Omit<GlobalSeo, "defaultRobots">> & { defaultRobots?: string | null }) | null;
  forms?: unknown;
  scheduling?: unknown;
  [key: string]: unknown;
};

async function deleteRedisKeysByPattern(pattern: string) {
  const redis = getRedis();
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  } catch (error) {
    markRedisUnavailable(error);
  }
}

async function invalidateGlobalSeoCache() {
  await Promise.all([deleteRedisKeysByPattern("seo:global"), deleteRedisKeysByPattern("seo:resolve:*")]);
}

function cleanOptional(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function robotsValue(value: unknown): RobotsValue {
  return robotsValues.includes(value as RobotsValue) ? (value as RobotsValue) : DEFAULT_GLOBAL_SEO.defaultRobots;
}

function normalizeGlobalSeo(seo?: SettingsLike["seo"]): GlobalSeo {
  return {
    ...DEFAULT_GLOBAL_SEO,
    ...(seo ?? {}),
    defaultRobots: robotsValue(seo?.defaultRobots),
    googleVerificationCode: cleanOptional(seo?.googleVerificationCode),
    defaultOgImageUrl: cleanOptional(seo?.defaultOgImageUrl),
    defaultFaviconUrl: cleanOptional(seo?.defaultFaviconUrl),
  };
}

function withDefaultSeo<T extends SettingsLike | null>(settings: T) {
  if (!settings) return settings;
  return { ...settings, seo: normalizeGlobalSeo(settings.seo) };
}

export const settingsService = {
  async get() {
    return withDefaultSeo((await settingsRepository.getOrSeed()) as SettingsLike | null);
  },
  async update(data: unknown) {
    const payload = data as { seo?: Partial<GlobalSeo>; forms?: unknown; scheduling?: unknown };
    const current = withDefaultSeo((await settingsRepository.getOrSeed()) as SettingsLike | null);
    const nextPayload = {
      ...payload,
      ...(payload.seo ? { seo: { ...current?.seo, ...payload.seo } } : {}),
    };
    const result = withDefaultSeo((await settingsRepository.update(nextPayload)) as SettingsLike | null);
    await Promise.all([
      invalidatePublicCache(),
      payload.seo ? invalidateGlobalSeoCache() : Promise.resolve(),
      payload.seo ? notifyFrontendSeoRevalidation(globalSeoRevalidation) : Promise.resolve(),
    ]);
    return result;
  },
  async getGlobalSeoForPublic() {
    const settings = (await settingsRepository.getOrSeed()) as SettingsLike | null;
    return normalizeGlobalSeo(settings?.seo);
  },
};

export { DEFAULT_GLOBAL_SEO };
export type { GlobalSeo };
