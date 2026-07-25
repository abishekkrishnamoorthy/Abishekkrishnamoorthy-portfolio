import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type ConfirmOptions = { title: string; description: string; confirmLabel?: string };
type ConfirmContextValue = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<(ConfirmOptions & { resolve: (value: boolean) => void }) | null>(null);
  const confirm = useMemo<ConfirmContextValue>(() => (options) => new Promise((resolve) => setRequest({ ...options, resolve })), []);
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={Boolean(request)}
        title={request?.title ?? ""}
        description={request?.description ?? ""}
        confirmLabel={request?.confirmLabel}
        onCancel={() => {
          request?.resolve(false);
          setRequest(null);
        }}
        onConfirm={() => {
          request?.resolve(true);
          setRequest(null);
        }}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const value = useContext(ConfirmContext);
  if (!value) throw new Error("useConfirm must be used inside ConfirmProvider");
  return value;
}
