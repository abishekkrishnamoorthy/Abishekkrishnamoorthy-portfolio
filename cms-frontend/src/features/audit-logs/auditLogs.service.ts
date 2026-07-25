import { axiosClient } from "@/lib/api/axiosClient";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { AuditLog } from "@/types/admin.types";

export const auditLogsService = {
  list: () => axiosClient.get<unknown, AuditLog[]>(ENDPOINTS.cmsAuditLogs),
};
