import { axiosClient } from "@/lib/api/axiosClient";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { AboutFormValues } from "@/features/about/about.schema";
import type { AboutContent } from "@/types/admin.types";

export const aboutService = {
  get: () => axiosClient.get<unknown, AboutContent>(ENDPOINTS.cmsAbout),
  update: (body: AboutFormValues) => axiosClient.put<unknown, AboutContent>(ENDPOINTS.cmsAbout, body),
};
