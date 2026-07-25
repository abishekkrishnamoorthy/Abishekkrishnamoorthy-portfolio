import { axiosClient } from "@/lib/api/axiosClient";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { SkillsFormValues } from "@/features/skills/skills.schema";

export const skillsService = {
  get: () => axiosClient.get<unknown, SkillsFormValues & { _id?: string }>(ENDPOINTS.cmsSkills),
  update: (body: SkillsFormValues) => axiosClient.put<unknown, SkillsFormValues>(ENDPOINTS.cmsSkills, body),
};
