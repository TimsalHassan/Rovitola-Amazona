// src/context/admin/AdminStatsContext.tsx
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface AdminStatsContextValue {
  /** Running delta applied on top of the server-fetched confirmed_orders count */
  confirmedOrdersDelta: number;
  /**
   * Call with +1 when an order is confirmed (pending → confirmed)
   * Call with -1 when a confirmed order moves to any next status
   */
  adjustConfirmedOrders: (delta: number) => void;
  /** Reset delta back to 0 (called by dashboard after it re-fetches fresh stats) */
  resetDelta: () => void;
}

const AdminStatsContext = createContext<AdminStatsContextValue | null>(null);

export function AdminStatsProvider({ children }: { children: ReactNode }) {
  const [confirmedOrdersDelta, setConfirmedOrdersDelta] = useState(0);

  const adjustConfirmedOrders = useCallback((delta: number) => {
    setConfirmedOrdersDelta((prev) => prev + delta);
  }, []);

  const resetDelta = useCallback(() => {
    setConfirmedOrdersDelta(0);
  }, []);

  return (
    <AdminStatsContext.Provider
      value={{ confirmedOrdersDelta, adjustConfirmedOrders, resetDelta }}
    >
      {children}
    </AdminStatsContext.Provider>
  );
}

export function useAdminStats(): AdminStatsContextValue {
  const ctx = useContext(AdminStatsContext);
  if (!ctx) throw new Error("useAdminStats must be used inside <AdminStatsProvider>");
  return ctx;
}