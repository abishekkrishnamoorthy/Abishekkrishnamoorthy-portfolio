import { describe, expect, it } from "vitest";
import { articleBlockSchema } from "@/features/blogs/blogs.schema";

describe("articleBlockSchema", () => {
  it("accepts valid points blocks", () => {
    const result = articleBlockSchema.safeParse({ id: "points-1", type: "points", items: ["Plan the feature", "Verify the renderer"] });

    expect(result.success).toBe(true);
  });

  it("rejects empty points blocks", () => {
    expect(articleBlockSchema.safeParse({ id: "points-1", type: "points", items: [] }).success).toBe(false);
    expect(articleBlockSchema.safeParse({ id: "points-1", type: "points", items: [""] }).success).toBe(false);
  });
});
