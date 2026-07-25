import { forwardRef, type TextareaHTMLAttributes } from "react";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className = "", ...props }, ref) => (
  <textarea
    ref={ref}
    className={`min-h-28 w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-primary outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 ${className}`}
    {...props}
  />
));

Textarea.displayName = "Textarea";
