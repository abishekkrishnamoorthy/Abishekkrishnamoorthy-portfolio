import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { AppError } from "@/common/AppError.js";
import { env } from "@/config/env.js";
import { authRepository } from "@/modules/auth/auth.repository.js";
import { usersRepository } from "@/modules/users/users.repository.js";

type TokenPayload = { sub: string; role: string };

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function signAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: "1d" });
}

function signRefreshToken(payload: TokenPayload & { familyId: string }) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "1d" });
}

function roleName(user: Awaited<ReturnType<typeof usersRepository.findByEmail>>) {
  const populated = user?.roleId as unknown as { name?: string };
  return populated?.name ?? "VIEWER";
}

export const authService = {
  async login(email: string, password: string) {
    const user = await usersRepository.findByEmail(email);
    if (!user) throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    const familyId = nanoid();
    const payload = { sub: user.id, role: roleName(user) };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ ...payload, familyId });
    await authRepository.createRefreshToken({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      familyId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return { accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: payload.role } };
  },
  async refresh(refreshToken: string) {
    let decoded: TokenPayload & { familyId: string };
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as TokenPayload & { familyId: string };
    } catch {
      throw new AppError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
    }
    const stored = await authRepository.findRefreshToken(hashToken(refreshToken));
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      await authRepository.revokeFamily(decoded.familyId);
      throw new AppError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
    }
    const user = await usersRepository.findById(decoded.sub);
    if (!user) throw new AppError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
    await authRepository.revokeRefreshToken(hashToken(refreshToken));
    const payload = { sub: user.id, role: roleName(user as never) };
    const nextRefreshToken = signRefreshToken({ ...payload, familyId: decoded.familyId });
    await authRepository.createRefreshToken({
      userId: user.id,
      tokenHash: hashToken(nextRefreshToken),
      familyId: decoded.familyId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return { accessToken: signAccessToken(payload), refreshToken: nextRefreshToken };
  },
  async logout(refreshToken?: string) {
    if (refreshToken) await authRepository.revokeRefreshToken(hashToken(refreshToken));
  },
  verifyAccessToken(token: string) {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
    } catch {
      throw new AppError(401, "UNAUTHENTICATED", "Authentication required");
    }
  },
};
