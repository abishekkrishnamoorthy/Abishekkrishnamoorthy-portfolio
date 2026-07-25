import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { ApiError, unwrapEnvelope, type ApiErrorDetail } from "@/lib/api/envelope";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/auth/tokenStore";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
type BackendErrorResponse = { error?: { code: string; message: string; details?: ApiErrorDetail[] } };

export const axiosClient = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let onUnauthenticated: (() => void) | null = null;

export function setUnauthenticatedHandler(handler: () => void) {
  onUnauthenticated = handler;
}

axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => unwrapEnvelope(response.data),
  async (error: AxiosError<BackendErrorResponse>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const status = error.response?.status;
    const apiError = error.response?.data?.error;

    if (status === 401 && original && !original._retried && original.url !== ENDPOINTS.authRefresh && original.url !== ENDPOINTS.authLogin) {
      original._retried = true;
      try {
        const refresh = await axios.post<{ data: { accessToken: string } }>(`${baseURL}${ENDPOINTS.authRefresh}`, {}, { withCredentials: true });
        setAccessToken(refresh.data.data.accessToken);
        original.headers.Authorization = `Bearer ${refresh.data.data.accessToken}`;
        return axiosClient(original);
      } catch {
        clearAccessToken();
        onUnauthenticated?.();
      }
    }

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      throw new ApiError("REQUEST_TIMEOUT", "The request timed out. Please try again.", [], status);
    }
    if (apiError) {
      throw new ApiError(apiError.code, apiError.message, apiError.details ?? [], status);
    }
    if (status === 429) throw new ApiError("RATE_LIMITED", "Too many requests. Please wait before trying again.", [], status);
    throw new ApiError("NETWORK_ERROR", error.message, [], status);
  },
);
