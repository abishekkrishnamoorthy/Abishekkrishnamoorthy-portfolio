import type { AxiosResponse } from "axios";
import { ApiError, type ApiResponse } from "@/types/common.types";

export function responseData<T>(response: AxiosResponse<ApiResponse<T>>): T {
  if (!response.data || !("data" in response.data)) {
    throw new ApiError("The server returned an invalid response.", "server", 502, "INVALID_API_RESPONSE");
  }
  return response.data.data;
}
