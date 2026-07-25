import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { can } from "@/lib/auth/permissions";

export function RequireAuth() {
  const { user, booting } = useAuth();
  const location = useLocation();
  if (booting) return <div className="flex min-h-screen items-center justify-center bg-canvas text-secondary">Checking session...</div>;
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  return <Outlet />;
}

export function RequirePermission({ module, action = "read" }: { module: string; action?: string }) {
  const { user } = useAuth();
  if (module !== "profile" && !can(user, module, action)) return <Navigate to="/403" replace={false} />;
  return <Outlet />;
}
