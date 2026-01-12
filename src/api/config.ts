// API Configuration

export const API_CONFIG = {
  BASE_URL: "http://57.128.249.133:9341",
  ENDPOINTS: {
    // Auth
    AUTH: {
      LOGIN: "/auth/authenticate",
      SIGNUP: "/auth/signup",
    },
    // Users
    USERS: {
      LIST: "/api/users",
      GET: (id: number) => `/api/users/${id}`,
      UPDATE: "/api/users",
      DELETE: (id: number) => `/api/users/${id}`,
      PROFILE: "/api/users/profile",
    },
    // Clients
    CLIENTS: {
      LIST: "/api/clients",
      GET: (id: string) => `/api/clients/${id}`,
      UPDATE: "/api/clients",
      DELETE: (id: string) => `/api/clients/${id}`,
      PROFILE: "/api/clients/profile",
      RESERVATIONS: (id: number) => `/api/clients/${id}/reservations`,
    },
    // Mechanics
    MECHANICS: {
      LIST: "/api/mechanics",
      GET: (id: string) => `/api/mechanics/${id}`,
      CREATE: "/api/mechanics/new",
      UPDATE: "/api/mechanics",
      DELETE: (id: string) => `/api/mechanics/${id}`,
      REPAIR_JOBS: (id: number) => `/api/mechanics/${id}/repair-jobs`,
    },
    // Services
    SERVICES: {
      LIST: "/api/services",
      GET: (id: string) => `/api/services/${id}`,
      CREATE: "/api/services/new",
      UPDATE: "/api/services",
      DELETE: (id: string) => `/api/services/${id}`,
    },
    // Reservations
    RESERVATIONS: {
      LIST: "/api/reservations",
      GET: (id: string) => `/api/reservations/${id}`,
      CREATE: "/api/reservations/new",
      UPDATE: (id: number) => `/api/reservations/${id}`,
      DELETE: (id: string) => `/api/reservations/${id}`,
      SCHEDULE: "/api/reservations/schedule",
      FILTER: "/api/reservations/filter",
    },
    // Repair Jobs
    REPAIR_JOBS: {
      LIST: "/api/repair-jobs",
      GET: (id: string) => `/api/repair-jobs/${id}`,
      CREATE: "/api/repair-jobs/new",
      UPDATE: (id: number) => `/api/repair-jobs/${id}`,
      DELETE: (id: string) => `/api/repair-jobs/${id}`,
    },
    // Cars
    CARS: {
      LIST: "/api/cars",
      GET: (id: string) => `/api/cars/${id}`,
      CREATE: "/api/cars/new",
      UPDATE: (id: number) => `/api/cars/${id}`,
      DELETE: (id: string) => `/api/cars/${id}`,
    },
  },
} as const;
