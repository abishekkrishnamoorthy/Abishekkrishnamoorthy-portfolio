import { AuditLogModel } from "@/modules/auditLogs/audit-log.model.js";

export const auditLogRepository = {
  list(limit = 200) {
    return AuditLogModel.find().sort({ createdAt: -1 }).limit(limit).lean();
  },
  create(data: { actor?: string; action: string; collection: string; documentId?: string; diff?: unknown }) {
    return AuditLogModel.create(data);
  },
};
