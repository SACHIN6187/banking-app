"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { saveAuth, getToken, getUser, clearAuth } from "@/lib/auth";
import { getAccountApi } from "@/lib/api";

interface Transaction {
  _id: string;
  fromAccount: string | { _id: string };
  toAccount: string | { _id: string };
  amount: number;
  status: "Completed" | "Pending" | "Failed" | "Reversed";
  createdAt: string;
}

interface Account {
  _id: string;
  creditBalance: number;
  debitBalance: number;
  totalBalance: number;
  transactions: Transaction[];
  status: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
  account: Account | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState<Account | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Restore auth from cookies on mount
    const savedToken = getToken();
    const savedUser = getUser();
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!token) {
      setAccount(null);
      return;
    }

    getAccountApi(token)
      .then((res) => setAccount(res.account || res))
      .catch(() => setAccount(null));
  }, [token]);

  const login = async (token: string, user: User) => {
    saveAuth(token, user);
    setToken(token);
    setUser(user);

    try {
      const res = await getAccountApi(token);
      setAccount(res.account || res); // instant availability
    } catch { }

    router.push("/dashboard");
  };

  const logout = () => {
    clearAuth();
    setToken(null);
    setUser(null);
    setAccount(null); // ✅ ADD THIS
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, account, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
