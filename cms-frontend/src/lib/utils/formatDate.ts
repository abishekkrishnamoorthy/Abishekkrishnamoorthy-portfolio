import { format, parseISO } from "date-fns";

export function formatDate(value?: string) {
  if (!value) return "Not set";
  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch {
    return value;
  }
}
