import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "../context/AuthContext";
import type { User } from "../api/auth";

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function useRequiredAuth(): AuthContextValue & { user: User; token: string } {
  const ctx = useAuth();
  if (!ctx.isAuthenticated || !ctx.user || !ctx.token) {
    throw new Error("useRequiredAuth: user is not authenticated");
  }
  return ctx as AuthContextValue & { user: User; token: string };
}