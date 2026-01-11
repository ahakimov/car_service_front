// useApi Hook - React hook for making API requests

"use client";

import { useState, useCallback } from "react";
import { httpClient } from "./httpClient";
import { ApiResponse } from "./types";

interface UseApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

interface UseApiActions<T> {
  get: (
    endpoint: string,
    params?: Record<string, string>
  ) => Promise<ApiResponse<T>>;
  post: <B = unknown>(endpoint: string, body?: B) => Promise<ApiResponse<T>>;
  put: <B = unknown>(endpoint: string, body?: B) => Promise<ApiResponse<T>>;
  del: (endpoint: string) => Promise<ApiResponse<T>>;
  reset: () => void;
  setToken: (token: string) => void;
  removeToken: () => void;
  hasToken: () => boolean;
}

export type UseApiReturn<T> = UseApiState<T> & UseApiActions<T>;

/**
 * Custom hook for making API requests with loading and error states
 *
 * @example
 * ```tsx
 * const { data, loading, error, get, post } = useApi<User[]>();
 *
 * // GET request
 * await get('/api/users');
 *
 * // POST request
 * await post('/api/users', { name: 'John' });
 * ```
 */
export function useApi<T = unknown>(): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const get = useCallback(
    async (
      endpoint: string,
      params?: Record<string, string>
    ): Promise<ApiResponse<T>> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await httpClient.get<T>(endpoint, params);
      setState({
        data: response.data,
        error: response.error,
        loading: false,
      });
      return response;
    },
    []
  );

  const post = useCallback(
    async <B = unknown>(
      endpoint: string,
      body?: B
    ): Promise<ApiResponse<T>> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await httpClient.post<T, B>(endpoint, body);
      setState({
        data: response.data,
        error: response.error,
        loading: false,
      });
      return response;
    },
    []
  );

  const put = useCallback(
    async <B = unknown>(
      endpoint: string,
      body?: B
    ): Promise<ApiResponse<T>> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await httpClient.put<T, B>(endpoint, body);
      setState({
        data: response.data,
        error: response.error,
        loading: false,
      });
      return response;
    },
    []
  );

  const del = useCallback(async (endpoint: string): Promise<ApiResponse<T>> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const response = await httpClient.delete<T>(endpoint);
    setState({
      data: response.data,
      error: response.error,
      loading: false,
    });
    return response;
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      loading: false,
    });
  }, []);

  const setToken = useCallback((token: string) => {
    httpClient.setToken(token);
  }, []);

  const removeToken = useCallback(() => {
    httpClient.removeToken();
  }, []);

  const hasToken = useCallback(() => {
    return httpClient.hasToken();
  }, []);

  return {
    ...state,
    get,
    post,
    put,
    del,
    reset,
    setToken,
    removeToken,
    hasToken,
  };
}

export default useApi;
