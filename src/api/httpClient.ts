// HTTP Client Singleton with optional token authentication

import { API_CONFIG } from "./config";
import { ApiRequestOptions, ApiResponse, HttpMethod } from "./types";

const TOKEN_KEY = "auth_token";

class HttpClient {
  private static instance: HttpClient;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  /**
   * Get token from localStorage if available
   */
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Set token to localStorage
   */
  public setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  /**
   * Remove token from localStorage
   */
  public removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  /**
   * Check if token exists
   */
  public hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Build headers with optional authorization
   */
  private buildHeaders(): Headers {
    const headers = new Headers({
      "Content-Type": "application/json",
    });

    const token = this.getToken();
    if (token) {
      // Using Basic Auth as per Swagger spec
      headers.set("Authorization", `Basic ${token}`);
    }

    return headers;
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  /**
   * Main request method
   */
  public async request<T, B = unknown>(
    options: ApiRequestOptions<B>
  ): Promise<ApiResponse<T>> {
    const { method, endpoint, body, params } = options;

    try {
      const url = this.buildUrl(endpoint, params);
      const fetchOptions: RequestInit = {
        method,
        headers: this.buildHeaders(),
      };

      if (body && (method === "POST" || method === "PUT")) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);

      // Handle empty response
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        return {
          data: null,
          error: data?.message || `HTTP Error: ${response.status}`,
          status: response.status,
        };
      }

      return {
        data: data as T,
        error: null,
        status: response.status,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        status: 0,
      };
    }
  }

  /**
   * Convenience method for GET requests
   */
  public async get<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: "GET", endpoint, params });
  }

  /**
   * Convenience method for POST requests
   */
  public async post<T, B = unknown>(
    endpoint: string,
    body?: B
  ): Promise<ApiResponse<T>> {
    return this.request<T, B>({ method: "POST", endpoint, body });
  }

  /**
   * Convenience method for PUT requests
   */
  public async put<T, B = unknown>(
    endpoint: string,
    body?: B
  ): Promise<ApiResponse<T>> {
    return this.request<T, B>({ method: "PUT", endpoint, body });
  }

  /**
   * Convenience method for DELETE requests
   */
  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>({ method: "DELETE", endpoint });
  }
}

// Export singleton instance
export const httpClient = HttpClient.getInstance();

// Export class for testing purposes
export { HttpClient };
