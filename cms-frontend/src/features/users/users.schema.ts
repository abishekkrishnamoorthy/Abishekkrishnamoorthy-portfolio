import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().max(120),
  password: z.string().min(12).max(128),
  roleName: z.enum(["SUPER_ADMIN", "EDITOR", "VIEWER"]).optional(),
});
export const updateRoleSchema = z.object({
  permissions: z.array(z.object({ module: z.string().min(2), actions: z.array(z.string().min(2)) })),
});
