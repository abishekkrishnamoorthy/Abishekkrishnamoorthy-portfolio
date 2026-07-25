import { useAuth } from "@/app/providers/AuthProvider";
import { can } from "@/lib/auth/permissions";

export function usePermission(moduleName: string, action: string) {
  const { user } = useAuth();
  return can(user, moduleName, action);
}
