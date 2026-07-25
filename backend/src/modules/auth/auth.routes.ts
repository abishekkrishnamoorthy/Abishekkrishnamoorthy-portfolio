import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware.js";
import { loginRateLimit } from "@/middlewares/rateLimit.middleware.js";
import { authController } from "@/modules/auth/auth.controller.js";
import { loginSchema } from "@/modules/auth/auth.validation.js";

export const authRoutes = Router();

authRoutes.post("/login", loginRateLimit, validate({ body: loginSchema }), authController.login);
authRoutes.post("/refresh", authController.refresh);
authRoutes.post("/logout", authController.logout);
