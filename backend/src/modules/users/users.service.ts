import bcrypt from "bcryptjs";
import { AppError } from "@/common/AppError.js";
import { usersRepository } from "@/modules/users/users.repository.js";

export const defaultPermissions = [
  "dashboard",
  "home",
  "skills",
  "projects",
  "blogs",
  "experience",
  "about",
  "contact",
  "meeting-requests",
  "messages",
  "media",
  "seo",
  "settings",
  "users",
  "roles",
].map((module) => ({ module, actions: ["create", "read", "update", "delete", "publish"] }));

export const usersService = {
  async seedRoles() {
    const editorPermissions = defaultPermissions.filter((permission) => !["users", "roles", "settings"].includes(permission.module));
    const viewerPermissions = defaultPermissions.map((permission) => ({ module: permission.module, actions: ["read"] }));
    await usersRepository.upsertRole("SUPER_ADMIN", defaultPermissions);
    await usersRepository.upsertRole("EDITOR", editorPermissions);
    await usersRepository.upsertRole("VIEWER", viewerPermissions);
  },
  async createUser(data: { name: string; email: string; password: string; roleName?: string }) {
    const role = await usersRepository.findRoleByName(data.roleName ?? "VIEWER");
    if (!role) throw new AppError(400, "ROLE_NOT_FOUND", "Role not found");
    const passwordHash = await bcrypt.hash(data.password, 12);
    return usersRepository.createUser({ name: data.name, email: data.email, passwordHash, roleId: role.id });
  },
  listUsers: usersRepository.listUsers,
  listRoles: usersRepository.listRoles,
  updateUser: usersRepository.updateUser,
  updateRole: usersRepository.updateRole,
};
