import type { Request, Response } from "express";
import { sendSuccess } from "@/common/apiResponse.js";
import { auditLogService } from "@/modules/auditLogs/audit-log.service.js";

export const auditLogController = {
  async list(_req: Request, res: Response) {
    return sendSuccess(res, await auditLogService.list());
  },
};
