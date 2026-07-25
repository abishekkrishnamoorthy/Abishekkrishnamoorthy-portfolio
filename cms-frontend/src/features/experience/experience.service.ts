import { axiosClient } from "@/lib/api/axiosClient";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ExperienceFormValues } from "@/features/experience/experience.schema";
import type { Experience } from "@/types/admin.types";

export const experienceService = {
  list: () => axiosClient.get<unknown, Experience[]>(ENDPOINTS.cmsExperience),
  create: (body: ExperienceFormValues) => axiosClient.post<unknown, Experience>(ENDPOINTS.cmsExperience, body),
  update: (id: string, body: Partial<ExperienceFormValues>) => axiosClient.put<unknown, Experience>(ENDPOINTS.cmsExperienceItem(id), body),
  delete: (id: string) => axiosClient.delete<unknown, Experience>(ENDPOINTS.cmsExperienceItem(id)),
  reorder: (items: Array<{ id: string; orderIndex: number }>) => axiosClient.patch<unknown, Experience[]>(ENDPOINTS.cmsExperienceReorder, { items }),
};
