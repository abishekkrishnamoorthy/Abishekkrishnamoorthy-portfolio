import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { setUnauthenticatedHandler } from "@/lib/api/axiosClient";
import { clearAccessToken, setAccessToken } from "@/lib/auth/tokenStore";
import type { CurrentUser } from "@/lib/auth/permissions";
import { authService, type LoginResponse } from "@/features/auth/auth.service";

type AuthContextValue = {
  user: CurrentUser | null;
  booting: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
let bootRefreshPromise: Promise<{ accessToken: string }> | null = null;
let loginPromise: Promise<LoginResponse> | null = null;

function userFromToken(token: string): CurrentUser {
  const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
  return { id: payload.sub, name: payload.role, email: "", role: payload.role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [booting, setBooting] = useState(true);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearAccessToken();
      setUser(null);
      window.location.assign(`/login?redirect=${encodeURIComponent(location.pathname)}`);
    }
  }, []);

  useEffect(() => setUnauthenticatedHandler(() => void logout()), [logout]);

  useEffect(() => {
    let active = true;
    bootRefreshPromise ??= authService.refresh().finally(() => {
      bootRefreshPromise = null;
    });
    bootRefreshPromise
      .then((result) => {
        if (!active) return;
        setAccessToken(result.accessToken);
        setUser(userFromToken(result.accessToken));
      })
      .catch(() => {
        clearAccessToken();
        setUser(null);
      })
      .finally(() => active && setBooting(false));
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    loginPromise ??= authService.login({ email, password }).finally(() => {
      loginPromise = null;
    });
    const result = await loginPromise;
    setAccessToken(result.accessToken);
    setUser(result.user);
  }, []);

  const value = useMemo(() => ({ user, booting, login, logout }), [booting, login, logout, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
