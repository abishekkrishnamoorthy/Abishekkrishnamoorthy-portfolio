export type Permission = { module: string; actions: string[] };
export type UserRole = "SUPER_ADMIN" | "EDITOR" | "VIEWER" | string;
export type CurrentUser = { id: string; name: string; email: string; role: UserRole; permissions?: Permission[] };

const modules = ["dashboard", "home", "skills", "projects", "blogs", "experience", "about", "contact", "meeting-requests", "messages", "media", "seo", "settings", "users", "roles"];
const allActions = ["create", "read", "update", "delete", "publish"];

function permissionsForRole(role: UserRole): Permission[] {
  if (role === "EDITOR") return modules.filter((module) => !["users", "roles", "settings"].includes(module)).map((module) => ({ module, actions: allActions }));
  if (role === "VIEWER") return modules.map((module) => ({ module, actions: ["read"] }));
  return [];
}

export function can(user: CurrentUser | null, moduleName: string, action: string) {
  if (!user) return false;
  if (moduleName === "profile") return true;
  if (user.role === "SUPER_ADMIN") return true;
  const permissions = user.permissions?.length ? user.permissions : permissionsForRole(user.role);
  return Boolean(permissions.some((permission) => permission.module === moduleName && permission.actions.includes(action)));
}
