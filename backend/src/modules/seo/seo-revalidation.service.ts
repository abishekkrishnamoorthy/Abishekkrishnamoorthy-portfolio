import { env } from "@/config/env.js";
import { logger } from "@/config/logger.js";

export type SeoRevalidationRequest = {
  paths?: string[];
  invalidateLayout?: boolean;
};

const timeoutMilliseconds = 5000;

export async function notifyFrontendSeoRevalidation(payload: SeoRevalidationRequest) {
  if (!env.FRONTEND_REVALIDATION_URL || !env.FRONTEND_REVALIDATION_SECRET) {
    logger.warn(
      {
        revalidationUrlConfigured: Boolean(env.FRONTEND_REVALIDATION_URL),
        revalidationSecretConfigured: Boolean(env.FRONTEND_REVALIDATION_SECRET),
        paths: payload.paths,
        invalidateLayout: payload.invalidateLayout,
      },
      "Frontend SEO revalidation skipped; runtime configuration is incomplete",
    );
    return;
  }

  logger.info(
    { target: env.FRONTEND_REVALIDATION_URL, paths: payload.paths, invalidateLayout: payload.invalidateLayout },
    "Starting frontend SEO revalidation",
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMilliseconds);
  try {
    const response = await fetch(env.FRONTEND_REVALIDATION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-seo-revalidation-secret": env.FRONTEND_REVALIDATION_SECRET,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`Frontend revalidation returned HTTP ${response.status}`);
    logger.info(
      { target: env.FRONTEND_REVALIDATION_URL, status: response.status, paths: payload.paths, invalidateLayout: payload.invalidateLayout },
      "Frontend SEO revalidation succeeded",
    );
  } catch (error) {
    logger.warn({ error, paths: payload.paths, invalidateLayout: payload.invalidateLayout }, "Frontend SEO revalidation failed; CMS write preserved");
  } finally {
    clearTimeout(timeout);
  }
}
