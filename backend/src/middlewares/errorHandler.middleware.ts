import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "@/common/AppError.js";
import { logger } from "@/config/logger.js";
import { env } from "@/config/env.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
      },
      meta: { requestId: res.locals.requestId },
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: { code: error.code, message: error.message, details: error.details },
      meta: { requestId: res.locals.requestId },
    });
  }

  logger.error({ error }, "Unhandled error");
  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: env.NODE_ENV === "production" ? "Something went wrong" : error.message,
    },
    meta: { requestId: res.locals.requestId },
  });
};
