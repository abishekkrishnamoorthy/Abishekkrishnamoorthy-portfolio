import type { Request } from "express";
import { auditLogRepository } from "@/modules/auditLogs/audit-log.repository.js";

export async function writeAuditLog(req: Request, action: string, collection: string, documentId?: string, diff?: unknown) {
  if (!req.user) return;
  await auditLogRepository.create({ actor: req.user.id, action, collection, documentId, diff });
}

export const auditLogService = {
  list: auditLogRepository.list,
};
