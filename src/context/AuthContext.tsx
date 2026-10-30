import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types/index.ts';
import { api, authStorage } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  quickLogin: (role: UserRole) => Promise<void>;
  isAdmin: boolean;
  isAuditor: boolean;
  isDeveloper: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(authStorage.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = authStorage.getToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.auth.getMe();
        setUser(res.user);
      } catch (err) {
        console.warn('Session expired or invalid, clearing credentials.');
        authStorage.clearToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      authStorage.setToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string, role: UserRole = 'Developer') => {
    setIsLoading(true);
    try {
      const res = await api.auth.register({ email, password, fullName, role });
      authStorage.setToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (role: UserRole) => {
    const email = role === 'Admin'
      ? 'admin@trustshield.ai'
      : role === 'Auditor'
      ? 'auditor@trustshield.ai'
      : 'dev@trustshield.ai';
    await login(email, 'Password123!');
  };

  const logout = () => {
    authStorage.clearToken();
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'Admin';
  const isAuditor = user?.role === 'Auditor' || user?.role === 'Admin';
  const isDeveloper = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        quickLogin,
        isAdmin,
        isAuditor,
        isDeveloper
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
