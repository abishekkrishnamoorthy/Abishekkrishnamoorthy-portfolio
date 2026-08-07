import type { Request, Response } from "express";
import { asyncHandler } from "@/common/asyncHandler.js";
import { sendSuccess } from "@/common/apiResponse.js";
import { env } from "@/config/env.js";
import { authService } from "@/modules/auth/auth.service.js";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 24 * 60 * 60 * 1000,
};

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body.email, req.body.password);
    res.cookie("refreshToken", result.refreshToken, cookieOptions);
    return sendSuccess(res, { accessToken: result.accessToken, user: result.user });
  }),
  refresh: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken ?? req.body.refreshToken;
    const result = await authService.refresh(refreshToken);
    res.cookie("refreshToken", result.refreshToken, cookieOptions);
    return sendSuccess(res, { accessToken: result.accessToken });
  }),
  logout: asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(req.cookies.refreshToken ?? req.body.refreshToken);
    res.clearCookie("refreshToken");
    return sendSuccess(res, { status: "ok" });
  }),
};
