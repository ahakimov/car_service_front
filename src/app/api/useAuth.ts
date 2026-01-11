// useAuth Hook - React hook for authentication

"use client";

import { useState, useCallback, useEffect } from "react";
import { authService, AuthUser, AuthCredentials } from "./authService";
import {
  LoginRequest,
  RegistrationRequest,
  AuthResponse,
  ApiResponse,
} from "./types";

interface UseAuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface UseAuthActions {
  login: (
    email: string,
    password: string
  ) => Promise<ApiResponse<AuthResponse>>;
  signup: (request: RegistrationRequest) => Promise<ApiResponse<AuthResponse>>;
  logout: () => void;
  getCredentials: () => AuthCredentials | null;
}

export type UseAuthReturn = UseAuthState & UseAuthActions;

/**
 * Custom hook for authentication
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, loading, error, login, logout } = useAuth();
 *
 * // Login
 * await login('user@example.com', 'password123');
 *
 * // Check auth status
 * if (isAuthenticated) {
 *   console.log('Welcome', user?.username);
 * }
 *
 * // Logout
 * logout();
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<UseAuthState>({
    user: null,
    isAuthenticated: false,
    loading: true, // Start with loading true to check initial auth
    error: null,
  });

  // Initialize auth state on mount
  useEffect(() => {
    authService.initializeAuth();
    const user = authService.getUser();
    const isAuthenticated = authService.isAuthenticated();

    setState({
      user,
      isAuthenticated,
      loading: false,
      error: null,
    });
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<ApiResponse<AuthResponse>> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const request: LoginRequest = { email, password };
      const response = await authService.login(request);

      if (response.error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: response.error,
        }));
      } else {
        setState({
          user: response.data
            ? {
                userId: response.data.userId,
                username: response.data.username,
              }
            : null,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
      }

      return response;
    },
    []
  );

  const signup = useCallback(
    async (
      request: RegistrationRequest
    ): Promise<ApiResponse<AuthResponse>> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await authService.signup(request);

      if (response.error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: response.error,
        }));
      } else {
        setState({
          user: response.data
            ? {
                userId: response.data.userId,
                username: response.data.username,
              }
            : null,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
      }

      return response;
    },
    []
  );

  const logout = useCallback(() => {
    authService.logout();
    setState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  }, []);

  const getCredentials = useCallback(() => {
    return authService.getCredentials();
  }, []);

  return {
    ...state,
    login,
    signup,
    logout,
    getCredentials,
  };
}

export default useAuth;
