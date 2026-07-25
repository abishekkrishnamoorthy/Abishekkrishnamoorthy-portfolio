import type { NextFunction, Request, Response } from "express";
import { nanoid } from "nanoid";

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = req.header("x-request-id") ?? nanoid();
  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
}
