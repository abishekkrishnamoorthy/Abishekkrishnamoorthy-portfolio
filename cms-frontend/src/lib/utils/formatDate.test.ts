import { describe, expect, it } from "vitest";
import { toDateInputValue } from "@/lib/utils/formatDate";

describe("toDateInputValue", () => {
  it("keeps valid date input values unchanged", () => {
    expect(toDateInputValue("2026-08-04")).toBe("2026-08-04");
  });

  it("normalizes persisted date strings for date inputs", () => {
    expect(toDateInputValue("Mon Aug 03 2026 21:01:48 GMT+0000 (Coordinated Universal Time)")).toBe("2026-08-03");
  });

  it("returns an empty string for missing or invalid values", () => {
    expect(toDateInputValue()).toBe("");
    expect(toDateInputValue("not-a-date")).toBe("");
  });
});
