import * as Dialog from "@radix-ui/react-dialog";
import { X, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { IconButton } from "@/components/ui/IconButton";

export type CmsEditorTab<T extends string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
};

type CmsEditorModalProps<T extends string> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  status?: ReactNode;
  headerActions?: ReactNode;
  tabs: Array<CmsEditorTab<T>>;
  activeTab: T;
  onTabChange: (tab: T) => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function CmsEditorModal<T extends string>({
  open,
  onOpenChange,
  title,
  description,
  status,
  headerActions,
  tabs,
  activeTab,
  onTabChange,
  children,
  footer,
}: CmsEditorModalProps<T>) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 flex h-dvh w-full flex-col overflow-hidden bg-surface shadow-elevation-2 sm:left-1/2 sm:top-1/2 sm:h-[92vh] sm:max-h-[92vh] sm:w-[95vw] sm:max-w-[1700px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:border sm:border-border-subtle">
          <div className="shrink-0 border-b border-border-subtle bg-surface px-4 py-3 sm:px-6 sm:py-5 lg:px-12 lg:py-6">
            <div className="flex items-center justify-between gap-4 sm:items-start sm:gap-5">
              <div className="min-w-0">
                <Dialog.Title asChild>
                  <div className="truncate text-base font-semibold text-primary sm:text-lg lg:text-xl">{title}</div>
                </Dialog.Title>
                {description ? (
                  <Dialog.Description asChild>
                    <div className="mt-1 hidden max-w-3xl text-sm font-normal leading-6 text-secondary sm:block">{description}</div>
                  </Dialog.Description>
                ) : null}
                {status ? <div className="mt-2 flex max-h-7 flex-wrap items-center gap-1.5 overflow-hidden sm:mt-4 sm:max-h-none sm:gap-2">{status}</div> : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {headerActions ? <div className="flex items-center gap-2">{headerActions}</div> : null}
                <Dialog.Close asChild>
                  <IconButton aria-label="Close editor" className="h-11 w-11 shrink-0">
                    <X size={18} />
                  </IconButton>
                </Dialog.Close>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-b border-border-subtle bg-surface px-2 sm:px-6 lg:px-12">
            <div className="flex w-full snap-x items-stretch gap-1 overflow-x-auto py-2 sm:gap-2 sm:py-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.value === activeTab;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => onTabChange(tab.value)}
                    className={`relative flex min-h-11 min-w-max snap-start items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold transition after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full sm:min-h-14 sm:flex-1 sm:px-5 sm:py-4 ${
                      isActive
                        ? "text-primary after:bg-accent sm:bg-accent/10"
                        : "text-secondary after:bg-transparent hover:bg-surface-hover hover:text-primary"
                    }`}
                  >
                    {Icon ? <Icon size={17} /> : null}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-12 lg:py-10">
            {children}
          </div>

          {footer ? (
            <div className="shrink-0 border-t border-border-subtle bg-surface px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 sm:px-6 sm:py-4 lg:px-12">
              {footer}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
