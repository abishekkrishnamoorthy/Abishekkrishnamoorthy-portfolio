import type { NextFunction, Request, Response } from "express";
import { AppError } from "@/common/AppError.js";
import { authService } from "@/modules/auth/auth.service.js";
import { usersRepository } from "@/modules/users/users.repository.js";

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return next(new AppError(401, "UNAUTHENTICATED", "Authentication required"));
  try {
    const payload = authService.verifyAccessToken(token);
    const user = await usersRepository.findById(payload.sub);
    if (!user) throw new AppError(401, "UNAUTHENTICATED", "Authentication required");
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}
