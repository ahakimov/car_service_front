// API Module Barrel Export

export { API_CONFIG } from "./config";
export { httpClient } from "./httpClient";
export { useApi } from "./useApi";
export { authService } from "./authService";
export { useAuth } from "./useAuth";

export type { AuthCredentials, AuthUser } from "./authService";
export type { HttpClient } from "./httpClient";
export type { AuthService } from "./authService";
export type {
  LoginRequest,
  RegistrationRequest,
  AuthResponse,
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
  HttpMethod,
  ApiRequestOptions,
  ApiResponse,
} from "./types";
