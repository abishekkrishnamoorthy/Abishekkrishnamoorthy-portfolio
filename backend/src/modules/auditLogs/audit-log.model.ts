import { Schema, model, type InferSchemaType } from "mongoose";

const auditLogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    collection: { type: String, required: true },
    documentId: { type: String },
    diff: { type: Schema.Types.Mixed },
  },
  { timestamps: true, suppressReservedKeysWarning: true },
);

export type AuditLog = InferSchemaType<typeof auditLogSchema>;
export const AuditLogModel = model("AuditLog", auditLogSchema);
