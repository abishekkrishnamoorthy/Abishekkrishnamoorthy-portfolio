import { axiosClient } from "@/lib/api/axiosClient";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { HomeFormValues } from "@/features/home/home.schema";

export const homeService = {
  get: () => axiosClient.get<unknown, HomeFormValues & { _id?: string }>(ENDPOINTS.cmsHome),
  update: (body: HomeFormValues) => axiosClient.put<unknown, HomeFormValues>(ENDPOINTS.cmsHome, body),
};
