import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

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

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    const savedAdmin = localStorage.getItem("admin_user");
    if (savedToken && savedAdmin) {
      setToken(savedToken);
      setAdmin(JSON.parse(savedAdmin));
    }
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string) {
    if (email === "admin@test.com" && password === "admin123") {
      const mockAdmin = { id: 1, email: "admin@test.com", name: "Admin", is_staff: true };
      const mockToken = "mock-token-123";
      setToken(mockToken);
      setAdmin(mockAdmin);
      localStorage.setItem("admin_token", mockToken);
      localStorage.setItem("admin_user", JSON.stringify(mockAdmin));
    } else {
      throw new Error("Invalid credentials");
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

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}