export type ErrorDetails = Array<{ field?: string; message: string }>;

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: ErrorDetails;

  constructor(statusCode: number, code: string, message: string, details?: ErrorDetails) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
