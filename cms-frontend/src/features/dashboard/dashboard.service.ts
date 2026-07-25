import { axiosClient } from "@/lib/api/axiosClient";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { DashboardSummary } from "@/types/admin.types";

export const dashboardService = {
  summary: () => axiosClient.get<unknown, DashboardSummary>(ENDPOINTS.dashboardSummary),
};
