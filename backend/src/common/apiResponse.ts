import type { Response } from "express";

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta: Record<string, unknown> = {}) {
  return res.status(statusCode).json({
    data,
    meta: { requestId: res.locals.requestId, ...meta },
  });
}

export function sendCreated<T>(res: Response, data: T, meta: Record<string, unknown> = {}) {
  return sendSuccess(res, data, 201, meta);
}
