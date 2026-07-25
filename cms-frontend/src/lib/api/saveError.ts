import { ApiError } from "@/lib/api/envelope";

export function saveErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Your session has expired. Please sign in again.";
    if (error.status === 403) return "You do not have permission to save these changes.";
    if (error.code === "REQUEST_TIMEOUT") return "The request timed out. Please try again.";
    if (error.code === "NETWORK_ERROR") return "Unable to reach the server. Check your connection and try again.";
    if (error.status && error.status >= 500) return error.message || "The server could not save your changes. Please try again.";
    const detail = error.details[0]?.message;
    return detail ? `${error.message}: ${detail}` : error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return "Unable to save changes. Please try again.";
}
