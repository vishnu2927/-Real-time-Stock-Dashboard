import { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
   * @param {{silent?: boolean}} [options]
   */
  function logout(options = {}) {
    const { silent = false } = options;
    clearTokens();
    setAccessToken(null);
    setUser(null);
    void silent;
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

    try {
      const { data } = await authAPI.refresh({ refreshToken: refreshTokenValue });
      storeTokens(data);
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch (_error) {
      logout({ silent: true });
      return null;
    }
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
    return data;
  }

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const savedAccessToken = localStorage.getItem('accessToken');
      if (!savedAccessToken) {
        if (mounted) setIsLoading(false);
        return;
      }

      setAccessToken(savedAccessToken);

      try {
        await loadMe();
      } catch (_error) {
        const refreshedToken = await refreshToken();
        if (refreshedToken) {
          try {
            await loadMe();
          } catch (_loadError) {
            logout({ silent: true });
          }
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
