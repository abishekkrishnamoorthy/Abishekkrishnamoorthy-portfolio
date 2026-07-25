export type ApiErrorDetail = { field: string; message: string };

export class ApiError extends Error {
  code: string;
  details: ApiErrorDetail[];
  status?: number;

  constructor(code: string, message: string, details: ApiErrorDetail[] = [], status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export type ApiEnvelope<T> = { data: T; meta?: Record<string, unknown> };

export function unwrapEnvelope<T>(payload: ApiEnvelope<T>) {
  return payload.data;
}
