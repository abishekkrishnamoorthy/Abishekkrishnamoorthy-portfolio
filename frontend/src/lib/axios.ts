import axios, { AxiosError } from "axios";
import { env } from "@/lib/env";
import type { ApiError } from "@/types/common.types";
import { ApiError as NormalizedApiError } from "@/types/common.types";

type ApiErrorBody = { error?: { message?: string; code?: string } };

export const apiClient = axios.create({
  baseURL: env.API_URL,
  timeout: env.API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => Promise.reject(normalizeApiError(error)),
);

export function normalizeApiError(error: AxiosError<ApiErrorBody>): ApiError {
    const status = error.response?.status;
    const code = error.response?.data?.error?.code || error.code;
    const kind =
      error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
        ? "timeout"
        : !error.response
          ? "network"
          : status === 401
            ? "unauthorized"
            : status === 404
              ? "not-found"
              : status === 400 || status === 422
                ? "validation"
                : status && status >= 500
                  ? "server"
                  : "unknown";
    return new NormalizedApiError(error.response?.data?.error?.message || error.message || "Request failed", kind, status, code);
}
