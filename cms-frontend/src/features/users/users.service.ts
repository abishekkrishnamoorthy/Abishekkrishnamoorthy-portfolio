import { axiosClient } from "@/lib/api/axiosClient";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { CmsUser, Role } from "@/types/admin.types";
import type { z } from "zod";
import type { createUserSchema, updateRoleSchema } from "@/features/users/users.schema";

export const usersService = {
  listUsers: () => axiosClient.get<unknown, CmsUser[]>(ENDPOINTS.cmsUsers),
  createUser: (body: z.infer<typeof createUserSchema>) => axiosClient.post<unknown, CmsUser>(ENDPOINTS.cmsUsers, body),
  updateUser: (id: string, body: Partial<Pick<CmsUser, "name" | "email" | "active">> & { roleId?: string }) => axiosClient.patch<unknown, CmsUser>(ENDPOINTS.cmsUser(id), body),
  listRoles: () => axiosClient.get<unknown, Role[]>(ENDPOINTS.cmsRoles),
  updateRole: (id: string, body: z.infer<typeof updateRoleSchema>) => axiosClient.put<unknown, Role>(ENDPOINTS.cmsRole(id), body),
};
