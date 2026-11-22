import React, { useCallback, useEffect, useState } from 'react';
import { getMe, login as apiLogin, signup as apiSignup } from '../api/auth';
import { AUTH_TOKEN_KEY } from '../api/http';
import { LoginPayload, SignupPayload, User } from '../types/auth';
import { AuthContext } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(AUTH_TOKEN_KEY)
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Listen for unauthorized 401 events dispatched from http layer
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  // Validate existing token and restore session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const { user: profile } = await getMe();
        setUser(profile);
        setToken(storedToken);
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    void initializeAuth();
  }, [logout]);

  const login = async (data: LoginPayload) => {
    const res = await apiLogin(data);
    localStorage.setItem(AUTH_TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const signup = async (data: SignupPayload) => {
    const res = await apiSignup(data);
    localStorage.setItem(AUTH_TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
