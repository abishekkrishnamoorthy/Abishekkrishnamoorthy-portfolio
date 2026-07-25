import { NavLink } from "react-router-dom";
import { navGroups } from "@/components/layout/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { can } from "@/lib/auth/permissions";
import { useUiStore } from "@/stores/uiStore";

export function Sidebar() {
  const { user } = useAuth();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  return (
    <aside className={`${collapsed ? "w-[72px]" : "w-[260px]"} hidden shrink-0 border-r border-border-subtle bg-surface transition-all lg:block`}>
      <div className="border-b border-border-subtle p-4">
        <span className="block text-sm font-semibold">{collapsed ? "CMS" : "Portfolio CMS"}</span>
      </div>
      <nav className="space-y-5 p-3">
        {navGroups.map((group) => (
          <section key={group.label}>
            {!collapsed ? <h2 className="mb-2 px-2 text-xs font-semibold uppercase text-muted">{group.label}</h2> : null}
            <div className="grid gap-1">
              {group.items.filter((item) => item.module === "profile" || can(user, item.module, "read")).map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition ${isActive ? "bg-accent text-accent-contrast" : "text-secondary hover:bg-surface-hover hover:text-primary"}`}
                >
                  <item.icon size={18} />
                  {!collapsed ? <span>{item.label}</span> : null}
                </NavLink>
              ))}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
}
