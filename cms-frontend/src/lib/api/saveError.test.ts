import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/envelope";
import { saveErrorMessage } from "@/lib/api/saveError";

describe("saveErrorMessage", () => {
  it.each([
    [new ApiError("UNAUTHENTICATED", "Authentication required", [], 401), "Your session has expired. Please sign in again."],
    [new ApiError("FORBIDDEN", "Forbidden", [], 403), "You do not have permission to save these changes."],
    [new ApiError("NETWORK_ERROR", "Network Error"), "Unable to reach the server. Check your connection and try again."],
    [new ApiError("REQUEST_TIMEOUT", "timeout"), "The request timed out. Please try again."],
    [new ApiError("INTERNAL_SERVER_ERROR", "Database unavailable", [], 500), "Database unavailable"],
  ])("normalizes save failures", (error, message) => {
    expect(saveErrorMessage(error)).toBe(message);
  });

  it("includes backend validation details", () => {
    const error = new ApiError("VALIDATION_ERROR", "Validation failed", [{ field: "hero.headline", message: "Headline is too short" }], 400);
    expect(saveErrorMessage(error)).toBe("Validation failed: Headline is too short");
  });
});
