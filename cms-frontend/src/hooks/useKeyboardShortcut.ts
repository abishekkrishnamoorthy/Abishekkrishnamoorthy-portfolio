import { useEffect } from "react";
import { useIsDesktop } from "@/hooks/useBreakpoint";

export function useKeyboardShortcut(combo: string, handler: () => void, options: { enabled?: boolean } = {}) {
  const isDesktop = useIsDesktop();
  useEffect(() => {
    if (options.enabled === false || !isDesktop) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      const normalized = combo.toLowerCase();
      const ctrl = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      if ((normalized.includes("ctrl") || normalized.includes("cmd")) && !ctrl) return;
      if (!normalized.endsWith(key)) return;
      event.preventDefault();
      handler();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [combo, handler, isDesktop, options.enabled]);
}
