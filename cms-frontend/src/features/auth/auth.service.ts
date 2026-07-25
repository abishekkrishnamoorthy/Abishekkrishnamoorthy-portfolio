import { axiosClient } from "@/lib/api/axiosClient";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { CurrentUser } from "@/lib/auth/permissions";

export type LoginResponse = { accessToken: string; user: CurrentUser };

export const authService = {
  login(body: { email: string; password: string }) {
    return axiosClient.post<unknown, LoginResponse>(ENDPOINTS.authLogin, body);
  },
  refresh() {
    return axiosClient.post<unknown, { accessToken: string }>(ENDPOINTS.authRefresh, {});
  },
  logout() {
    return axiosClient.post<unknown, { status: string }>(ENDPOINTS.authLogout, {});
  },
};
