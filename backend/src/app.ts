import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler } from "@/middlewares/errorHandler.middleware.js";
import { notFoundMiddleware } from "@/middlewares/notFound.middleware.js";
import { requestIdMiddleware } from "@/middlewares/requestId.middleware.js";
import { sanitizeMiddleware } from "@/middlewares/sanitize.middleware.js";
import { publicRateLimit } from "@/middlewares/rateLimit.middleware.js";
import { logger } from "@/config/logger.js";
import { env } from "@/config/env.js";
import { isDbReady } from "@/config/db.js";
import { registerRoutes } from "@/routes.js";

export function createApp() {
  const app = express();

  app.use(requestIdMiddleware);
  app.use((req, res, next) => {
    res.on("finish", () => logger.info({ method: req.method, path: req.path, statusCode: res.statusCode, requestId: res.locals.requestId }, "request completed"));
    next();
  });
  app.use(helmet());
  app.use(cors({ origin: [env.PUBLIC_SITE_ORIGIN, env.CMS_ORIGIN], credentials: true }));
  app.use(compression());
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(express.json({ limit: "8mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(sanitizeMiddleware);
  app.use("/api", publicRateLimit);

  app.get("/health", (_req, res) => res.status(200).json({ data: { status: "ok" }, meta: { requestId: res.locals.requestId } }));
  app.get("/health/ready", (_req, res) => {
    const ready = isDbReady();
    return res.status(ready ? 200 : 503).json({
      data: { status: ready ? "ready" : "not_ready", db: ready },
      meta: { requestId: res.locals.requestId },
    });
  });

  registerRoutes(app);

  app.use(notFoundMiddleware);
  app.use(errorHandler);

  return app;
}
