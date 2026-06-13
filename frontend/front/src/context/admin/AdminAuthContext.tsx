import {
  createContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { authApi } from "../../api/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: number;
  email: string;
  name: string;
  is_staff: boolean;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    const savedAdmin = localStorage.getItem("admin_user");
    if (savedToken && savedAdmin) {
      try {
        const parsed = JSON.parse(savedAdmin) as AdminUser;
        // Re-validate is_staff in case storage was tampered
        if (parsed.is_staff) {
          setToken(savedToken);
          setAdmin(parsed);
        } else {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_user");
        }
      } catch {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
      }
    }
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string) {
    setIsLoading(true);
    try {
      const data = await authApi.login({ email, password });

      // Guard: only allow staff users into the admin panel
      if (!data.user.is_staff) {
        throw new Error("You do not have permission to access the admin panel.");
      }

      setToken(data.token);
      setAdmin(data.user as AdminUser);
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
  }

  return (
    <AdminAuthContext.Provider value={{ admin, token, login, logout, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

