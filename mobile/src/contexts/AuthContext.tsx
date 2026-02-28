import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, User } from '../services/api';
import { storage } from '../utils/storage';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;       // 试用模式（免登录）
  login: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  enterGuestMode: () => void;
  refreshUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // 启动时从本地存储恢复登录态
  useEffect(() => {
    (async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([
          storage.getToken(),
          storage.getUser<User>(),
        ]);
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (phone: string, code: string) => {
    const res = await authApi.login(phone, code);
    await storage.setToken(res.access_token);
    await storage.setUser(res.user);
    setToken(res.access_token);
    setUser(res.user);
    setIsGuest(false);
  }, []);

  const logout = useCallback(async () => {
    await storage.clearAuth();
    setToken(null);
    setUser(null);
    setIsGuest(false);
  }, []);

  const enterGuestMode = useCallback(() => {
    setIsGuest(true);
  }, []);

  const refreshUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    storage.setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        isGuest,
        login,
        logout,
        enterGuestMode,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
