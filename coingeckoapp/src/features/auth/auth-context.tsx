import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '../../lib/api';
import { clearStoredToken, getStoredToken, setStoredToken } from '../../lib/auth-storage';
import { signInWithGooglePopup } from '../../lib/firebase';
import type { LoginPayload, RegisterPayload, User } from '../../lib/types';
import { AuthContext, type AuthContextValue } from './auth-context-value';

export function AuthProvider({ children }: { children: ReactNode; }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback((nextToken: string, nextUser: User) => {
    setStoredToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = getStoredToken();

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        setToken(storedToken);
        const profile = await api.me();
        setUser(profile);
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [logout]);

  useEffect(() => {
    window.addEventListener('auth:unauthorized', logout);
    return () => window.removeEventListener('auth:unauthorized', logout);
  }, [logout]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await api.login(payload);
      applySession(response.token, response.user);
      toast.success('Sesión iniciada');
    },
    [applySession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await api.register(payload);
      applySession(response.token, response.user);
      toast.success('Cuenta creada');
    },
    [applySession],
  );

  const loginWithGoogle = useCallback(async () => {
    const idToken = await signInWithGooglePopup();
    const response = await api.googleLogin(idToken);
    applySession(response.token, response.user);
    toast.success('Sesión iniciada con Google');
  }, [applySession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      loginWithGoogle,
      logout,
    }),
    [isLoading, login, loginWithGoogle, logout, register, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
