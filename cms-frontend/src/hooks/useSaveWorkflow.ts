import { useCallback, useRef, useState } from "react";
import type { FieldErrors, FieldValues } from "react-hook-form";
import { useToast } from "@/app/providers/ToastProvider";
import { saveErrorMessage } from "@/lib/api/saveError";

type ErrorNode = { message?: string } | ErrorNode[] | { [key: string]: ErrorNode | undefined };

function firstValidationMessage(node: ErrorNode | undefined): string | undefined {
  if (!node) return undefined;
  if ("message" in node && typeof node.message === "string") return node.message;
  const children = Array.isArray(node) ? node : Object.values(node);
  for (const child of children) {
    const message = firstValidationMessage(child);
    if (message) return message;
  }
  return undefined;
}

export function useSaveWorkflow(successMessage = "Changes saved successfully") {
  const toast = useToast();
  const lock = useRef(false);
  const [isSaving, setIsSaving] = useState(false);

  const save = useCallback(async (request: () => Promise<unknown>) => {
    if (lock.current) return false;
    lock.current = true;
    setIsSaving(true);
    try {
      await request();
      toast.success(successMessage);
      return true;
    } catch (error: unknown) {
      toast.error(saveErrorMessage(error));
      return false;
    } finally {
      lock.current = false;
      setIsSaving(false);
    }
  }, [successMessage, toast]);

  const validationFailed = useCallback((errors: FieldErrors<FieldValues>) => {
    const detail = firstValidationMessage(errors as ErrorNode);
    toast.error(detail ? `Please fix the highlighted fields: ${detail}` : "Please fix the highlighted fields before saving.");
  }, [toast]);

  const validationError = useCallback((message: string) => {
    toast.error(message);
  }, [toast]);

  return { isSaving, save, validationFailed, validationError };
}
