import type { NextFunction, Request, Response } from "express";

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((safe, [key, nested]) => {
      if (key.includes("$") || key.includes(".")) return safe;
      safe[key] = sanitizeValue(nested);
      return safe;
    }, {});
  }
  return value;
}

export function sanitizeMiddleware(req: Request, _res: Response, next: NextFunction) {
  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query) as Request["query"];
  req.params = sanitizeValue(req.params) as Request["params"];
  next();
}
