import { NavLink } from "react-router-dom";
import { Drawer } from "@/components/ui/Drawer";
import { navGroups } from "@/components/layout/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { can } from "@/lib/auth/permissions";
import { useUiStore } from "@/stores/uiStore";

export function NavDrawer() {
  const { user } = useAuth();
  const open = useUiStore((state) => state.navDrawerOpen);
  const setOpen = useUiStore((state) => state.setNavDrawerOpen);
  return (
    <Drawer open={open} onOpenChange={setOpen} title="Navigation">
      <nav className="space-y-5">
        {navGroups.map((group) => (
          <section key={group.label}>
            <h2 className="mb-2 text-xs font-semibold uppercase text-muted">{group.label}</h2>
            <div className="grid gap-1">
              {group.items.filter((item) => item.module === "profile" || can(user, item.module, "read")).map((item) => (
                <NavLink key={item.path} to={item.path} onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-secondary hover:bg-surface-hover">
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </section>
        ))}
      </nav>
    </Drawer>
  );
}
