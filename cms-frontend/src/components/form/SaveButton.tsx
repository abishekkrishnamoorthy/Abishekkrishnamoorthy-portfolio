import { Loader2, Save } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/Button";

export function SaveButton({ isSaving, disabled, label = "Save now", ...props }: ButtonProps & { isSaving: boolean; label?: string }) {
  return (
    <Button type="submit" disabled={disabled || isSaving} aria-busy={isSaving} {...props}>
      {isSaving ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Save size={18} aria-hidden="true" />}
      {isSaving ? "Saving..." : label}
    </Button>
  );
}
