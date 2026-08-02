import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ revalidatePath: vi.fn() }));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { POST } from "@/app/api/revalidate-seo/route";

describe("POST /api/revalidate-seo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SEO_REVALIDATION_SECRET = "test-secret";
  });

  it("rejects missing and invalid secrets", async () => {
    const missing = await POST(new Request("http://localhost/api/revalidate-seo", { method: "POST", body: "{}" }));
    const invalid = await POST(new Request("http://localhost/api/revalidate-seo", { method: "POST", headers: { "x-seo-revalidation-secret": "wrong" }, body: "{}" }));

    expect(missing.status).toBe(401);
    expect(invalid.status).toBe(401);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("deduplicates paths and invalidates the layout", async () => {
    const response = await POST(
      new Request("http://localhost/api/revalidate-seo", {
        method: "POST",
        headers: { "x-seo-revalidation-secret": "test-secret", "content-type": "application/json" },
        body: JSON.stringify({ paths: ["/", "/projects", "/projects"], invalidateLayout: true }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(1, "/", "layout");
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(2, "/", "page");
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(3, "/projects", "page");
  });

  it("rejects malformed paths", async () => {
    const response = await POST(
      new Request("http://localhost/api/revalidate-seo", {
        method: "POST",
        headers: { "x-seo-revalidation-secret": "test-secret", "content-type": "application/json" },
        body: JSON.stringify({ paths: ["https://example.com"] }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
