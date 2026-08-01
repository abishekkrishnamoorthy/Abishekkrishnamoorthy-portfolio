import { axiosClient } from "@/lib/api/axiosClient";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { GlobalSeoFormValues, SeoFormValues } from "@/features/seo/seo.schema";
import type { GlobalSeo, SeoOverride, Settings } from "@/types/admin.types";

export const seoService = {
  list: () => axiosClient.get<unknown, SeoOverride[]>(ENDPOINTS.cmsSeo),
  create: (body: SeoFormValues) => axiosClient.post<unknown, SeoOverride>(ENDPOINTS.cmsSeo, body),
  update: (id: string, body: Partial<SeoFormValues>) => axiosClient.put<unknown, SeoOverride>(ENDPOINTS.cmsSeoItem(id), body),
  delete: (id: string) => axiosClient.delete<unknown, SeoOverride>(ENDPOINTS.cmsSeoItem(id)),
  getGlobalSeo: async () => {
    const settings = await axiosClient.get<unknown, Settings>(ENDPOINTS.cmsSettings);
    return settings.seo;
  },
  updateGlobalSeo: async (body: Partial<GlobalSeoFormValues>) => {
    const settings = await axiosClient.put<unknown, Settings>(ENDPOINTS.cmsSettings, { seo: body });
    return settings.seo as GlobalSeo;
  },
};
