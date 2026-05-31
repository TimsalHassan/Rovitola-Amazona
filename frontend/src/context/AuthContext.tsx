import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (name: string, phone: string) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'amazona_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const saveUser = (u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = async (email: string, _password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const mockUser: User = {
      id: 'user-' + Date.now(),
      name: email.split('@')[0],
      email,
      phone: '+358 40 123 4567',
      createdAt: new Date(),
    };
    saveUser(mockUser);
    setIsLoading(false);
    return true;
  };

  const register = async (name: string, email: string, phone: string, _password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const mockUser: User = {
      id: 'user-' + Date.now(),
      name,
      email,
      phone,
      createdAt: new Date(),
    };
    saveUser(mockUser);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    saveUser(null);
  };

  const updateProfile = (name: string, phone: string) => {
    if (user) {
      const updated = { ...user, name, phone };
      saveUser(updated);
    }
  };

  const changePassword = async (_current: string, _new: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 500));
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, changePassword, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
