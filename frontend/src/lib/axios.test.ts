import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { normalizeApiError } from "@/lib/axios";

function httpError(status: number, code: string, message: string) {
  const response = { status, data: { error: { code, message } } } as AxiosResponse<{ error: { code: string; message: string } }>;
  return new AxiosError(message, code, undefined, undefined, response);
}

describe("normalizeApiError", () => {
  it.each([
    [401, "unauthorized"],
    [404, "not-found"],
    [422, "validation"],
    [500, "server"],
  ] as const)("maps HTTP %s to %s", (status, kind) => {
    expect(normalizeApiError(httpError(status, "API_ERROR", "Request failed")).kind).toBe(kind);
  });

  it("maps timeouts and network failures", () => {
    expect(normalizeApiError(new AxiosError("Timed out", "ETIMEDOUT")).kind).toBe("timeout");
    expect(normalizeApiError(new AxiosError("Network error", "ERR_NETWORK")).kind).toBe("network");
  });
});
