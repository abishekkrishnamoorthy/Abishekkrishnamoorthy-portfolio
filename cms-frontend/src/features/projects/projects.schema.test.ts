import { describe, expect, it } from "vitest";
import { projectSchema } from "@/features/projects/projects.schema";

describe("projectSchema", () => {
  it("rejects short project titles and invalid URLs", () => {
    const result = projectSchema.safeParse({ title: "x", liveDemoUrl: "http://bad.test" });
    expect(result.success).toBe(false);
  });
});
