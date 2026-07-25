import { create } from "zustand";
import { persist } from "zustand/middleware";

type UiState = {
  sidebarCollapsed: boolean;
  navDrawerOpen: boolean;
  commandPaletteOpen: boolean;
  toggleSidebar: () => void;
  setNavDrawerOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      navDrawerOpen: false,
      commandPaletteOpen: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setNavDrawerOpen: (navDrawerOpen) => set({ navDrawerOpen }),
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
    }),
    { name: "portfolio-cms-ui" },
  ),
);
