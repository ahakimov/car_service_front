// HTTP Client Singleton with optional token authentication

import { API_CONFIG } from "./config";
import { ApiRequestOptions, ApiResponse, HttpMethod } from "./types";

const TOKEN_KEY = "auth_token";

class HttpClient {
  private static instance: HttpClient | null = null;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  /**
   * Get singleton instance (lazy initialization)
   */
  public static getInstance(): HttpClient {
    if (HttpClient.instance === null) {
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
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

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
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Build query string
    const queryString = params && Object.keys(params).length > 0
      ? `?${new URLSearchParams(params).toString()}`
      : '';

    // Combine base URL with endpoint and query
    return `${this.baseUrl}${normalizedEndpoint}${queryString}`;
  }

  /**
   * Main request method
   */
  public async request<T, B = unknown>(
    options: ApiRequestOptions<B>
  ): Promise<ApiResponse<T>> {
    // Note: In Next.js 13+, fetch is available on both server and client
    // This method can be called from server components if needed

    const { method, endpoint, body, params } = options;

    try {
      const url = this.buildUrl(endpoint, params);
      const fetchOptions: RequestInit = {
        method,
        headers: this.buildHeaders(),
        // Add mode and credentials for CORS
        mode: 'cors',
        credentials: 'omit', // Don't send cookies, but allow CORS
      };

      if (body && (method === "POST" || method === "PUT")) {
        fetchOptions.body = JSON.stringify(body);
      }


      const response = await fetch(url, fetchOptions);

      // Handle empty response
      const text = await response.text();
      let data = null;

      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          // If response is not JSON but request was successful, treat text as data
          // This handles cases like DELETE returning "Deleted" as plain text
          if (response.ok) {
            return {
              data: text as unknown as T,
              error: null,
              status: response.status,
            };
          }
          // If response is not JSON and request failed, return the text as error
          return {
            data: null,
            error: text.substring(0, 100),
            status: response.status,
          };
        }
      }

      if (!response.ok) {
        return {
          data: null,
          error: data?.message || data?.error || `HTTP Error: ${response.status}`,
          status: response.status,
        };
      }

      return {
        data: data as T,
        error: null,
        status: response.status,
      };
    } catch (error) {
      // Better error handling for network issues
      let errorMessage = "Unknown error occurred";

      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error - likely CORS or server unreachable
        const fullUrl = this.buildUrl(endpoint, params);
        errorMessage = `Failed to connect to backend server at ${fullUrl}. This could be due to:
- CORS policy blocking the request
- Backend server is not accessible
- Network connectivity issues
Please check the browser console for more details.`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error('HTTP Request Error:', {
        url: this.buildUrl(endpoint, params),
        endpoint,
        baseUrl: this.baseUrl,
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      });

      return {
        data: null,
        error: errorMessage,
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

// Lazy singleton - only create when first accessed
let _httpClientInstance: HttpClient | null = null;

function getHttpClient(): HttpClient {
  if (_httpClientInstance === null) {
    _httpClientInstance = HttpClient.getInstance();
  }
  return _httpClientInstance;
}

// Export as object with lazy getters
export const httpClient = {
  get: <T>(endpoint: string, params?: Record<string, string>) => getHttpClient().get<T>(endpoint, params),
  post: <T, B = unknown>(endpoint: string, body?: B) => getHttpClient().post<T, B>(endpoint, body),
  put: <T, B = unknown>(endpoint: string, body?: B) => getHttpClient().put<T, B>(endpoint, body),
  delete: <T>(endpoint: string) => getHttpClient().delete<T>(endpoint),
  request: <T, B = unknown>(options: any) => getHttpClient().request<T, B>(options),
  setToken: (token: string) => getHttpClient().setToken(token),
  removeToken: () => getHttpClient().removeToken(),
  hasToken: () => getHttpClient().hasToken(),
} as HttpClient;

// Export class for testing purposes
export { HttpClient };
