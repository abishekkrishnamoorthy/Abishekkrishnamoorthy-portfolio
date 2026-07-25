import { BookOpen, BriefcaseBusiness, Home, Image, Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useUiStore } from "@/stores/uiStore";

const tabs = [
  { label: "Dashboard", path: "/dashboard", icon: Home },
  { label: "Projects", path: "/projects", icon: BriefcaseBusiness },
  { label: "Blogs", path: "/blogs", icon: BookOpen },
  { label: "Media", path: "/media", icon: Image },
];

export function MobileTabBar() {
  const setOpen = useUiStore((state) => state.setNavDrawerOpen);
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border-subtle bg-surface lg:hidden">
      {tabs.map((tab) => (
        <NavLink key={tab.path} to={tab.path} className={({ isActive }) => `flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] ${isActive ? "text-accent" : "text-muted"}`}>
          <tab.icon size={18} />
          {tab.label}
        </NavLink>
      ))}
      <button type="button" className="flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] text-muted" onClick={() => setOpen(true)}>
        <Menu size={18} />
        More
      </button>
    </nav>
  );
}
