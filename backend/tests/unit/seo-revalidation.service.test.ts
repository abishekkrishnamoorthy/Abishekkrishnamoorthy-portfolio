import { beforeEach, describe, expect, it, vi } from "vitest";
import { notifyFrontendSeoRevalidation } from "@/modules/seo/seo-revalidation.service.js";

const mocks = vi.hoisted(() => ({
  logger: { info: vi.fn(), warn: vi.fn() },
  env: {
    FRONTEND_REVALIDATION_URL: "https://portfolio.example.com/api/revalidate-seo",
    FRONTEND_REVALIDATION_SECRET: "test-secret-value",
  },
}));

vi.mock("@/config/env.js", () => ({ env: mocks.env }));
vi.mock("@/config/logger.js", () => ({ logger: mocks.logger }));

describe("notifyFrontendSeoRevalidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.env.FRONTEND_REVALIDATION_URL = "https://portfolio.example.com/api/revalidate-seo";
    mocks.env.FRONTEND_REVALIDATION_SECRET = "test-secret-value";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
  });

  it("posts the invalidation request with the internal secret", async () => {
    await notifyFrontendSeoRevalidation({ paths: ["/contact"], invalidateLayout: true });

    expect(fetch).toHaveBeenCalledWith(
      "https://portfolio.example.com/api/revalidate-seo",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-seo-revalidation-secret": "test-secret-value" }),
        body: JSON.stringify({ paths: ["/contact"], invalidateLayout: true }),
      }),
    );
    expect(mocks.logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ target: "https://portfolio.example.com/api/revalidate-seo", status: 200, paths: ["/contact"] }),
      "Frontend SEO revalidation succeeded",
    );
    expect(mocks.logger.warn).not.toHaveBeenCalled();
  });

  it("swallows frontend failures so CMS writes are preserved", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("frontend unavailable")));

    await expect(notifyFrontendSeoRevalidation({ paths: ["/"] })).resolves.toBeUndefined();
    expect(mocks.logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ paths: ["/"] }),
      "Frontend SEO revalidation failed; CMS write preserved",
    );
  });

  it("does nothing when revalidation is not configured", async () => {
    mocks.env.FRONTEND_REVALIDATION_URL = undefined;

    await notifyFrontendSeoRevalidation({ paths: ["/"] });

    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ revalidationUrlConfigured: false, revalidationSecretConfigured: true }),
      "Frontend SEO revalidation skipped; runtime configuration is incomplete",
    );
  });
});
