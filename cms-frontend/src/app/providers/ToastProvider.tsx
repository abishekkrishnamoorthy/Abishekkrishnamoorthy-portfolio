import * as Toast from "@radix-ui/react-toast";
import { CheckCircle2, CircleAlert, Info } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type ToastTone = "success" | "error" | "info";
type ToastItem = { id: number; tone: ToastTone; message: string };
type ToastApi = { success: (message: string) => void; error: (message: string) => void; info: (message: string) => void };

const ToastContext = createContext<ToastApi | null>(null);
const icons = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const dismiss = useCallback((id: number) => setItems((value) => value.filter((item) => item.id !== id)), []);
  const push = useCallback((tone: ToastTone, message: string) => {
    const id = ++nextId.current;
    setItems((value) => [...value.slice(-2), { id, tone, message }]);
  }, []);
  const api = useMemo(() => ({
    success: (message: string) => push("success", message),
    error: (message: string) => push("error", message),
    info: (message: string) => push("info", message),
  }), [push]);

  return (
    <Toast.Provider swipeDirection="right" duration={3500}>
      <ToastContext.Provider value={api}>{children}</ToastContext.Provider>
      {items.map((item) => {
        const Icon = icons[item.tone];
        return (
          <Toast.Root
            key={item.id}
            defaultOpen
            duration={3500}
            onOpenChange={(open) => { if (!open) dismiss(item.id); }}
            className="flex items-center gap-2.5 rounded-md border border-border-subtle bg-surface px-3 py-2.5 shadow-elevation-2"
          >
            <Icon size={17} className={item.tone === "error" ? "text-danger" : item.tone === "success" ? "text-success" : "text-info"} aria-hidden="true" />
            <Toast.Description className="text-sm font-medium text-primary">{item.message}</Toast.Description>
          </Toast.Root>
        );
      })}
      <Toast.Viewport className="fixed bottom-4 right-4 z-[80] grid w-[min(360px,calc(100vw-32px))] gap-2 outline-none" />
    </Toast.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside ToastProvider");
  return value;
}
