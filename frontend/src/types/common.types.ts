export type ApiResponse<T> = {
  data: T;
  meta: ApiMeta;
};

export type ApiMeta = {
  requestId?: string;
};

export type ApiErrorKind = "network" | "timeout" | "unauthorized" | "not-found" | "validation" | "server" | "not-implemented" | "unknown";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly kind: ApiErrorKind,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
};

export function notImplemented(feature: string): Promise<never> {
  return Promise.reject(new ApiError(`${feature} is not available from the public API.`, "not-implemented", 501, "NOT_IMPLEMENTED"));
}

export function apiErrorMessage(error: Error | null): string {
  if (!(error instanceof ApiError)) return "Something went wrong while loading this content.";
  if (error.kind === "network") return "The API is unreachable. Check the backend connection and try again.";
  if (error.kind === "timeout") return "The request timed out. Please try again.";
  if (error.kind === "unauthorized") return "You are not authorized to access this content.";
  if (error.kind === "not-found") return "The requested content was not found.";
  if (error.kind === "server") return "The server could not complete the request. Please try again.";
  return error.message;
}
