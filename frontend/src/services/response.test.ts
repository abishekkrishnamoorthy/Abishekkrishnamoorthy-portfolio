import type { AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { responseData } from "@/services/response";
import { ApiError, type ApiResponse } from "@/types/common.types";

describe("responseData", () => {
  it("unwraps the backend envelope", () => {
    const response = { data: { data: "ready", meta: { requestId: "request-1" } } } as AxiosResponse<ApiResponse<string>>;
    expect(responseData(response)).toBe("ready");
  });

  it("rejects a malformed envelope", () => {
    const response = { data: { meta: { requestId: "request-1" } } } as AxiosResponse<ApiResponse<string>>;
    expect(() => responseData(response)).toThrow(ApiError);
  });
});
