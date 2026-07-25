import type { NextFunction, Request, Response } from "express";
import { AppError } from "@/common/AppError.js";

export function rbac(moduleName: string, action: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.roleId as unknown as { name?: string; permissions?: Array<{ module: string; actions: string[] }> };
    if (role?.name === "SUPER_ADMIN") return next();
    const allowed = role?.permissions?.some((permission) => permission.module === moduleName && permission.actions.includes(action));
    if (!allowed) return next(new AppError(403, "FORBIDDEN", "You do not have permission to perform this action"));
    return next();
  };
}
