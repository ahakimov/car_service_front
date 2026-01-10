// API Types based on Swagger schema

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistrationRequest {
  password: string;
  name: string;
  phone: string;
  email?: string;
}

export interface AuthResponse {
  userId: number;
  username: string;
  role?: string;
}

// User Types
export interface User {
  id?: number;
  email?: string;
  password?: string;
  role?: string;
}

// Client Types
export interface Client {
  id?: number;
  name?: string;
  phone?: string;
  email?: string;
}

// Mechanic Types
export interface Mechanic {
  id?: number;
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
  specialty?: string;
  experience?: number;
}

// Service Types
export interface Service {
  id?: number;
  serviceName?: string;
  description?: string;
  price?: number;
  estimatedDuration?: number;
}

// Car Types
export interface Car {
  id?: number;
  model?: string;
  make?: string;
  year?: number;
  produced?: number;
  licensePlate?: string;
  owner?: Client;
  ownerId?: number;
}

export interface CarDto {
  model?: string;
  make?: string;
  year?: number;
  licensePlate?: string;
  ownerId?: number;
}

// Reservation Types
export interface Reservation {
  id?: number;
  client?: Client;
  car?: Car;
  mechanic?: Mechanic;
  service?: Service;
  dateAdded?: string;
  visitDateTime?: string;  // Start time
  endDateTime?: string;    // End time
  status?: string;
  additionalDetails?: string;
}

export interface ReservationDto {
  clientId?: number;
  carId?: number;
  mechanicId?: number;
  serviceId?: number;
  dateAdded?: string;
  visitDateTime?: string;  // Start time
  endDateTime?: string;    // End time
  status?: string;
  additionalDetails?: string;
}

export interface ReservationFilter {
  dateFrom?: string;
  dateTo?: string;
  clientId?: number;
  carId?: number;
  serviceId?: number;
  mechanicId?: number;
  status?: string;
}

// Repair Job Types
export interface RepairJob {
  id?: number;
  client?: Client;
  mechanic?: Mechanic;
  startDateTime?: string;
  endDateTime?: string;
  service?: Service;
  status?: string;
  additionalDetails?: string;
}

export interface RepairJobDto {
  clientId?: number;
  mechanicId?: number;
  startDateTime?: string;
  endDateTime?: string;
  serviceId?: number;
  status?: string;
  additionalDetails?: string;
}

// Visitor Request Types (for unauthenticated visitors)
export interface VisitorRequest {
  id?: number;
  fullName?: string;
  contactNumber?: string;
  email?: string;
  serviceId?: number;
  serviceName?: string;
  visitDate?: string;
  time?: string;
  description?: string;
  status?: string;
  createdAt?: string;
}

export interface VisitorRequestDto {
  fullName: string;
  contactNumber: string;
  email?: string;
  serviceId?: number;
  serviceName?: string;
  visitDate: string;
  time: string;
  description?: string;
}

// Request/Response Types
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface ApiRequestOptions<T = unknown> {
  method: HttpMethod;
  endpoint: string;
  body?: T;
  params?: Record<string, string>;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}
