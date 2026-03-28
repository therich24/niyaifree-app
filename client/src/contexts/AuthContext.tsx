import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, setToken, clearToken, getStoredUser, setStoredUser } from "@/lib/api";

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
    try {
      const data = await api.me();
      setUser(data);
      setStoredUser(data);
    } catch {
      setUser(null);
      clearToken();
    }
  };

  useEffect(() => {
    if (getStoredUser()) {
      refreshUser();
    }
  }, []);

  const login = async (loginStr: string, password: string) => {
    const data = await api.login({ login: loginStr, password });
    setToken(data.token);
    setUser(data.user);
    setStoredUser(data.user);
  };

  const register = async (regData: any) => {
    const data = await api.register(regData);
    return data.memberId;
  };

  const logout = () => {
    clearToken();
    setUser(null);
    localStorage.removeItem("niyaifree_user");
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
