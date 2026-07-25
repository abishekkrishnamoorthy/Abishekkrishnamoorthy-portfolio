import { Schema, model, type InferSchemaType } from "mongoose";
import { roles } from "@/config/constants.js";

const permissionSchema = new Schema(
  {
    module: { type: String, required: true },
    actions: { type: [String], required: true, default: [] },
  },
  { _id: false },
);

const roleSchema = new Schema(
  {
    name: { type: String, enum: roles, required: true, unique: true },
    permissions: { type: [permissionSchema], default: [] },
  },
  { timestamps: true },
);

export type Role = InferSchemaType<typeof roleSchema>;
export const RoleModel = model("Role", roleSchema);
