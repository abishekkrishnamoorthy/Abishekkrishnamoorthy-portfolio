import { axiosClient } from "@/lib/api/axiosClient";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { SettingsFormValues } from "@/features/settings/settings.schema";
import type { Settings } from "@/types/admin.types";

export const settingsService = {
  get: () => axiosClient.get<unknown, Settings>(ENDPOINTS.cmsSettings),
  update: (body: SettingsFormValues) => axiosClient.put<unknown, Settings>(ENDPOINTS.cmsSettings, body),
};
