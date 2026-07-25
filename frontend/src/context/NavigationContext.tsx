"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type NavigationContextValue = {
  isMobileOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  isAssistantOpen: boolean;
  openAssistant: () => void;
  closeAssistant: () => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  useEffect(() => {
    const shouldLockScroll = isMobileOpen || isAssistantOpen;
    if (!shouldLockScroll) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isAssistantOpen, isMobileOpen]);

  const value = useMemo(
    () => ({
      isMobileOpen,
      openMobileNav: () => setIsMobileOpen(true),
      closeMobileNav: () => setIsMobileOpen(false),
      isAssistantOpen,
      openAssistant: () => setIsAssistantOpen(true),
      closeAssistant: () => setIsAssistantOpen(false),
    }),
    [isAssistantOpen, isMobileOpen],
  );
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) throw new Error("useNavigation must be used inside NavigationProvider");
  return context;
}
