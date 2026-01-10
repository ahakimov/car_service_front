// Auth Service - handles authentication with the API

import { API_CONFIG } from "./config";
import {
  LoginRequest,
  RegistrationRequest,
  AuthResponse,
  ApiResponse,
  Client,
  User,
} from "./types";

const CREDENTIALS_KEY = "auth_credentials";
const USER_KEY = "auth_user";

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  userId: number;
  username: string;
  role?: string;
}

class AuthService {
  private static instance: AuthService | null = null;

  private constructor() { }

  public static getInstance(): AuthService {
    if (AuthService.instance === null) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Encode credentials to Base64 for Basic Auth
   */
  private encodeCredentials(email: string, password: string): string {
    if (typeof window === "undefined") {
      // Server-side: use Buffer for Node.js
      return Buffer.from(`${email}:${password}`).toString('base64');
    }
    // Client-side: use btoa
    return btoa(`${email}:${password}`);
  }

  /**
   * Save credentials to localStorage
   */
  private saveCredentials(email: string, password: string): void {
    if (typeof window !== "undefined") {
      const credentials: AuthCredentials = { email, password };
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
      // Set the encoded token for API requests - lazy import
      import("./httpClient").then(({ httpClient }) => {
        httpClient.setToken(this.encodeCredentials(email, password));
      });
    }
  }

  /**
   * Get stored credentials
   */
  public getCredentials(): AuthCredentials | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(CREDENTIALS_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as AuthCredentials;
    } catch {
      return null;
    }
  }

  /**
   * Save user info to localStorage
   */
  private saveUser(user: AuthUser): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  /**
   * Get stored user info
   */
  public getUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as AuthUser;
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    // Can't use async here, so check credentials only
    // Token check will be done at actual API call time
    return !!this.getCredentials();
  }

  /**
   * Initialize auth from stored credentials (call on app startup)
   */
  public initializeAuth(): void {
    if (typeof window === "undefined") return; // Skip on server
    const credentials = this.getCredentials();
    if (credentials) {
      // Lazy import to avoid circular dependency
      import("./httpClient").then(({ httpClient }) => {
        httpClient.setToken(
          this.encodeCredentials(credentials.email, credentials.password)
        );
      });
    }
  }

  /**
   * Login with email and password
   */
  public async login(
    request: LoginRequest
  ): Promise<ApiResponse<AuthResponse>> {
    // Lazy import httpClient to avoid circular dependency
    const { httpClient } = await import("./httpClient");

    try {
      // First, try to authenticate using the /auth/authenticate endpoint
      const authResponse = await httpClient.post<AuthResponse, LoginRequest>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        request
      );

      if (authResponse.error || !authResponse.data) {
        // Authentication failed
        httpClient.removeToken();
        return {
          data: null,
          error: authResponse.error || "Invalid email or password",
          status: authResponse.status || 401,
        };
      }

      // Authentication successful, now get user profile to get role
      const testToken = this.encodeCredentials(request.email, request.password);
      httpClient.setToken(testToken);

      // Get user profile to retrieve role information
      const profileResponse = await httpClient.get<User>(
        API_CONFIG.ENDPOINTS.USERS.PROFILE
      );

      // Credentials are valid, save them
      this.saveCredentials(request.email, request.password);

      const user: AuthUser = {
        userId: authResponse.data.userId || profileResponse.data?.id || 0,
        username: authResponse.data.username || request.email,
        role: profileResponse.data?.role || undefined,
      };
      this.saveUser(user);

      return {
        data: user,
        error: null,
        status: 200,
      };
    } catch (error) {
      // Network or other errors
      httpClient.removeToken();
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to connect to server. Please check your connection.";

      return {
        data: null,
        error: errorMessage,
        status: 0,
      };
    }
  }

  /**
   * Register a new user
   */
  public async signup(
    request: RegistrationRequest
  ): Promise<ApiResponse<AuthResponse>> {
    // Lazy import httpClient to avoid circular dependency
    const { httpClient } = await import("./httpClient");

    const response = await httpClient.post<AuthResponse, RegistrationRequest>(
      API_CONFIG.ENDPOINTS.AUTH.SIGNUP,
      request
    );

    if (response.data && request.email) {
      // Auto-login after successful signup
      this.saveCredentials(request.email, request.password);
      this.saveUser({
        userId: response.data.userId,
        username: response.data.username,
      });
    }

    return response;
  }

  /**
   * Logout - clear all stored auth data
   */
  public logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(CREDENTIALS_KEY);
      localStorage.removeItem(USER_KEY);
    }
    // Lazy import to avoid circular dependency
    import("./httpClient").then(({ httpClient }) => {
      httpClient.removeToken();
    });
  }
}

// Lazy singleton - only create when first accessed
let _authServiceInstance: AuthService | null = null;

function getAuthService(): AuthService {
  if (_authServiceInstance === null) {
    _authServiceInstance = AuthService.getInstance();
  }
  return _authServiceInstance;
}

// Export as object with lazy getters
export const authService = {
  login: (request: LoginRequest) => getAuthService().login(request),
  signup: (request: RegistrationRequest) => getAuthService().signup(request),
  logout: () => getAuthService().logout(),
  getUser: () => getAuthService().getUser(),
  getCredentials: () => getAuthService().getCredentials(),
  isAuthenticated: () => getAuthService().isAuthenticated(),
  initializeAuth: () => getAuthService().initializeAuth(),
} as AuthService;

// Export class for testing purposes
export { AuthService };
