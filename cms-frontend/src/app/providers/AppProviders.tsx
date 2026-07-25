import type { ReactNode } from "react";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { ToastProvider } from "@/app/providers/ToastProvider";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { ConfirmProvider } from "@/hooks/useConfirm";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <ConfirmProvider>{children}</ConfirmProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
