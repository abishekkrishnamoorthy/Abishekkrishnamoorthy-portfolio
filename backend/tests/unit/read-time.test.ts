import { describe, expect, it } from "vitest";
import { calculateReadTimeMinutes } from "@/jobs/readTimeCalculator.js";
import { articleBlockSchema } from "@/modules/blog/blog.validation.js";

describe("calculateReadTimeMinutes", () => {
  it("returns at least one minute", () => {
    expect(calculateReadTimeMinutes([{ id: "p1", type: "paragraph", text: "Short body copy for an article paragraph." }])).toBe(1);
  });

  it("counts points block items as readable article text", () => {
    const items = Array.from({ length: 20 }, () => "one two three four five six seven eight nine ten eleven twelve");
    expect(calculateReadTimeMinutes([{ id: "points-1", type: "points", items }])).toBe(2);
  });
});

describe("articleBlockSchema", () => {
  it("accepts valid points blocks", () => {
    const legacyResult = articleBlockSchema.safeParse({ id: "points-1", type: "points", items: ["Plan the change", "Ship carefully"] });
    const styledResult = articleBlockSchema.safeParse({ id: "points-1", type: "points", items: ["Plan the change"], style: "letter" });

    expect(legacyResult.success).toBe(true);
    if (!legacyResult.success) throw new Error("Expected legacy points block to parse");
    expect(legacyResult.data).toMatchObject({ style: "bullet" });
    expect(styledResult.success).toBe(true);
  });

  it("rejects empty points blocks", () => {
    expect(articleBlockSchema.safeParse({ id: "points-1", type: "points", items: [] }).success).toBe(false);
    expect(articleBlockSchema.safeParse({ id: "points-1", type: "points", items: [""] }).success).toBe(false);
    expect(articleBlockSchema.safeParse({ id: "points-1", type: "points", items: ["Valid point"], style: "roman" }).success).toBe(false);
  });
});
