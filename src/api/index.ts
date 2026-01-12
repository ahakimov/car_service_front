// API Module Barrel Export

export { API_CONFIG } from "./config";
export { httpClient, HttpClient } from "./httpClient";
export { useApi } from "./useApi";
export { authService, AuthService } from "./authService";
export { useAuth } from "./useAuth";
export type { AuthCredentials, AuthUser } from "./authService";
export type {
  // Auth
  LoginRequest,
  RegistrationRequest,
  AuthResponse,
  // Entities
  User,
  Client,
  Mechanic,
  Service,
  Car,
  CarDto,
  Reservation,
  ReservationDto,
  ReservationFilter,
  RepairJob,
  RepairJobDto,
  // Request/Response
  HttpMethod,
  ApiRequestOptions,
  ApiResponse,
} from "./types";
