import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, setToken, clearToken, getStoredUser, setStoredUser } from "@/lib/api";
import { toast } from "sonner";

interface User {
  id: number;
  memberId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  points: number;
  freeReadUntil: string | null;
  referralCode: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (login: string, password: string) => Promise<void>;
  register: (data: any) => Promise<string>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [loading, setLoading] = useState(false);

  const refreshUser = async () => {
    setLoading(true);
    try {
      const data = await api.me();
      setUser(data);
      setStoredUser(data);
    } catch {
      setUser(null);
      clearToken();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (getStoredUser()) {
      refreshUser();
    }
  }, []);

  const login = async (loginStr: string, password: string) => {
    setLoading(true);
    try {
      const data = await api.login({ login: loginStr, password });
      setToken(data.token);
      setUser(data.user);
      setStoredUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (regData: any) => {
    setLoading(true);
    try {
      const data = await api.register(regData);
      return data.memberId;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
    localStorage.removeItem("niyaifree_user");
    toast.success("ออกจากระบบแล้ว");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
