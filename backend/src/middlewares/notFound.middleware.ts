import type { Request, Response } from "express";

export function notFoundMiddleware(req: Request, res: Response) {
  return res.status(404).json({
    error: { code: "NOT_FOUND", message: `Route ${req.method} ${req.path} not found` },
    meta: { requestId: res.locals.requestId },
  });
}
