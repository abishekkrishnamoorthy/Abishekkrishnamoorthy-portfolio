import { useEffect, useRef, useState } from "react";

export function useAutosave<T>(value: T, saveFn: (value: T) => Promise<unknown>, delay = 2000) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return undefined;
    }
    const id = window.setTimeout(async () => {
      setStatus("saving");
      try {
        await saveFn(value);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, delay);
    return () => window.clearTimeout(id);
  }, [delay, saveFn, value]);

  return status;
}
