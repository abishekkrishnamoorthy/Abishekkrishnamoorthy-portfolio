import { describe, expect, it } from "vitest";
import { can } from "@/lib/auth/permissions";

describe("permissions", () => {
  it("allows SUPER_ADMIN all actions", () => {
    expect(can({ id: "1", name: "Admin", email: "", role: "SUPER_ADMIN" }, "users", "delete")).toBe(true);
  });

  it("keeps VIEWER read-only", () => {
    const user = { id: "1", name: "Viewer", email: "", role: "VIEWER" };
    expect(can(user, "projects", "read")).toBe(true);
    expect(can(user, "projects", "create")).toBe(false);
  });
});
