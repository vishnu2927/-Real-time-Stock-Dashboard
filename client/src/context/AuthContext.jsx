import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { authAPI, clearTokens, storeTokens } from '../services/api';

const AuthContext = createContext(null);

/**
 * Provides auth state and actions to the app.
 * @param {{children: import('react').ReactNode}} props
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(accessToken && user);

  /**
   * Logs the current user out.
   */
  function logout() {
    clearTokens();
    setAccessToken(null);
    setUser(null);
    toast.success('Logged out');
  }

  /**
   * Refreshes the access token using the stored refresh token.
   */
  async function refreshToken() {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (!refreshTokenValue) {
      logout();
      return null;
    }

    const { data } = await authAPI.refresh({ refreshToken: refreshTokenValue });
    storeTokens(data);
    setAccessToken(data.accessToken);
    return data.accessToken;
  }

  /**
   * Loads the current authenticated user.
   */
  async function loadMe() {
    const { data } = await authAPI.me();
    setUser(data.user);
    return data.user;
  }

  /**
   * Logs in the user and stores tokens.
   * @param {{email: string, password: string}} payload
   */
  async function login(payload) {
    const { data } = await authAPI.login(payload);
    storeTokens(data);
    setAccessToken(data.accessToken);
    setUser(data.user);
    toast.success('Login successful');
    return data;
  }

  /**
   * Registers a user and stores tokens.
   * @param {{name: string, email: string, password: string}} payload
   */
  async function register(payload) {
    const { data } = await authAPI.register(payload);
    storeTokens(data);
    setAccessToken(data.accessToken);
    setUser(data.user);
    toast.success('Account created');
    return data;
  }

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const savedAccessToken = localStorage.getItem('accessToken');
        if (!savedAccessToken) {
          if (mounted) setIsLoading(false);
          return;
        }

        setAccessToken(savedAccessToken);
        await loadMe();
      } catch (_error) {
        try {
          await refreshToken();
          await loadMe();
        } catch (refreshError) {
          clearTokens();
          setAccessToken(null);
          setUser(null);
          if (mounted) {
            toast.error('Session expired');
          }
          void refreshError;
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({ user, accessToken, isLoading, isAuthenticated, login, register, logout, refreshToken, setUser }),
    [user, accessToken, isLoading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Accesses the auth context.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
