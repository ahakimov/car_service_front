// Auth Service - handles authentication with the API

import { httpClient } from "./httpClient";
import { API_CONFIG } from "./config";
import {
  LoginRequest,
  RegistrationRequest,
  AuthResponse,
  ApiResponse,
  Client,
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
}

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Encode credentials to Base64 for Basic Auth
   */
  private encodeCredentials(email: string, password: string): string {
    return btoa(`${email}:${password}`);
  }

  /**
   * Save credentials to localStorage
   */
  private saveCredentials(email: string, password: string): void {
    if (typeof window !== "undefined") {
      const credentials: AuthCredentials = { email, password };
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
      // Set the encoded token for API requests
      httpClient.setToken(this.encodeCredentials(email, password));
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
    return !!this.getCredentials() && httpClient.hasToken();
  }

  /**
   * Initialize auth from stored credentials (call on app startup)
   */
  public initializeAuth(): void {
    const credentials = this.getCredentials();
    if (credentials) {
      httpClient.setToken(
        this.encodeCredentials(credentials.email, credentials.password)
      );
    }
  }

  /**
   * Login with email and password
   */
  public async login(
    request: LoginRequest
  ): Promise<ApiResponse<AuthResponse>> {
    // First, test credentials by fetching profile
    const testToken = this.encodeCredentials(request.email, request.password);
    httpClient.setToken(testToken);

    // Try to get dashboard profile to verify credentials
    const profileResponse = await httpClient.get<Client>(
      API_CONFIG.ENDPOINTS.CLIENTS.PROFILE
    );

    if (profileResponse.error) {
      // Clear the token if login failed
      httpClient.removeToken();
      return {
        data: null,
        error: profileResponse.error,
        status: profileResponse.status,
      };
    }

    // Credentials are valid, save them
    this.saveCredentials(request.email, request.password);

    const user: AuthUser = {
      userId: profileResponse.data?.id || 0,
      username: profileResponse.data?.email || request.email,
    };
    this.saveUser(user);

    return {
      data: user,
      error: null,
      status: 200,
    };
  }

  /**
   * Register a new user
   */
  public async signup(
    request: RegistrationRequest
  ): Promise<ApiResponse<AuthResponse>> {
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
    httpClient.removeToken();
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// Export class for testing purposes
export { AuthService };
