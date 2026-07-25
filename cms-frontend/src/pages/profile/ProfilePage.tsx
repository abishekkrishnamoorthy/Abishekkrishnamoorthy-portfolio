import { useAuth } from "@/app/providers/AuthProvider";
import { Card, CardContent } from "@/components/ui/Card";

export default function ProfilePage() {
  const { user } = useAuth();
  return <Card><CardContent><h1 className="text-2xl font-semibold">Profile</h1><p className="mt-2 text-secondary">{user?.name || user?.role}</p><p className="text-sm text-muted">{user?.email || "Session restored from secure refresh cookie"}</p></CardContent></Card>;
}
