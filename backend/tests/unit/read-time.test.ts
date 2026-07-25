import { describe, expect, it } from "vitest";
import { calculateReadTimeMinutes } from "@/jobs/readTimeCalculator.js";

describe("calculateReadTimeMinutes", () => {
  it("returns at least one minute", () => {
    expect(calculateReadTimeMinutes([{ id: "p1", type: "paragraph", text: "Short body copy for an article paragraph." }])).toBe(1);
  });
});
