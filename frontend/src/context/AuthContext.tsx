import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiFetch, getStoredToken, setStoredToken } from "../lib/api";
import type { User } from "../lib/types";

type AuthResponse = {
  status: string;
  token: string;
  data: { user: User };
};

type MeResponse = {
  status: string;
  data: User;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  /** Set when GET /users/me fails (e.g. expired token) */
  profileError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
    phoneNumber?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  const {
    data: user,
    status: meStatus,
    isError,
    error: meQueryError,
  } = useQuery({
    queryKey: ["me", token],
    queryFn: async () => {
      const res = await apiFetch<MeResponse>("/api/v1/users/me", { auth: true });
      return res.data;
    },
    enabled: Boolean(token),
    staleTime: 60_000,
  });

  const profileError =
    isError && meQueryError instanceof Error
      ? meQueryError.message
      : isError
        ? "Could not load your profile."
        : null;

  useEffect(() => {
    if (!token) return;
    if (meQueryError instanceof ApiError && meQueryError.status === 401) {
      setStoredToken(null);
      setTimeout(() => setToken(null), 0);
      queryClient.removeQueries({ queryKey: ["me"] });
      queryClient.removeQueries({ queryKey: ["cart"] });
    }
  }, [token, meQueryError, queryClient]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiFetch<AuthResponse>("/api/v1/users/Login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setStoredToken(res.token);
      setToken(res.token);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    [queryClient],
  );

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      passwordConfirm: string;
      phoneNumber?: string;
    }) => {
      const res = await apiFetch<AuthResponse>("/api/v1/users/Signup", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setStoredToken(res.token);
      setToken(res.token);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/v1/users/Logout", {
        method: "POST",
      });
    } catch {
      // best effort: always clear local session
    }
    setStoredToken(null);
    setToken(null);
    queryClient.removeQueries({ queryKey: ["me"] });
    queryClient.removeQueries({ queryKey: ["cart"] });
  }, [queryClient]);

  const profileSettled = meStatus === "success" || meStatus === "error";

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      token,
      // Wait until /me has finished (success or error), not only v5 isPending/isLoading quirks
      isLoading: Boolean(token) && !profileSettled,
      profileError,
      login,
      register,
      logout,
    }),
    [user, token, profileSettled, profileError, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
