import { Menu, Moon, PanelLeftClose, Search, Sun } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/app/providers/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { useUiStore } from "@/stores/uiStore";
import { useMessages, useMeetingRequests } from "@/features/shared/hooks";

export function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const setNavDrawerOpen = useUiStore((state) => state.setNavDrawerOpen);
  const setCommandPaletteOpen = useUiStore((state) => state.setCommandPaletteOpen);
  const messages = useMessages();
  const meetings = useMeetingRequests();
  const unread = (messages.data?.filter((item) => item.status === "received").length ?? 0) + (meetings.data?.filter((item) => item.status === "received").length ?? 0);

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-border-subtle bg-surface/95 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <IconButton className="lg:hidden" aria-label="Open navigation" onClick={() => setNavDrawerOpen(true)}>
          <Menu size={18} />
        </IconButton>
        <IconButton className="hidden lg:inline-flex" aria-label="Toggle sidebar" onClick={toggleSidebar}>
          <PanelLeftClose size={18} />
        </IconButton>
        <div>
          <p className="text-xs text-muted">Portfolio CMS</p>
          <h1 className="text-sm font-semibold capitalize">{location.pathname.split("/").filter(Boolean).join(" / ") || "Dashboard"}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <IconButton aria-label="Open command palette" onClick={() => setCommandPaletteOpen(true)}>
          <Search size={18} />
        </IconButton>
        <span className="hidden rounded-full bg-info/10 px-2 py-1 text-xs text-info sm:inline">Unread {unread}</span>
        <IconButton aria-label="Toggle theme" onClick={toggleTheme}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </IconButton>
        <span className="hidden text-sm text-secondary md:inline">{user?.name || user?.role}</span>
        <Button variant="secondary" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
