// User types
export interface User {
  userId: number;
  name: string;
  email: string;
  phone?: string;
  countryOfOrigin?: string;
  city?: string;
  travelType?: string;
  bio?: string;
  avatar?: string;
  preferredLanguage?: string;
  preferences?: {
    notifications: boolean;
    culturalAlerts: boolean;
    healthAlerts: boolean;
    language: string;
  };
}

// Trip types
export interface Trip {
  tripId: number;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  flightNumber: string;
  type: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
  reservationCode?: string;
  isUsed?: boolean;
  userId?: number;
}

export interface CreateTripRequest {
  destination: string;
  departureDate: string;
  returnDate: string;
  flightNumber: string;
  type: string;
}

export interface UpdateTripRequest {
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  flightNumber?: string;
  type?: string;
}

export interface ClaimTripRequest {
  reservationCode: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  countryOfOrigin: string;
  preferredLanguage: string;
  birthDate: string; // YYYY-MM-DD format
}

export interface AuthResponse {
  isSuccess: boolean;
  user?: {
    token: string;
    id: number;
    role: string;
    // Add other user fields as needed
  };
  message?: string;
}

// AI types
export type AiAnswer = { answer?: string } | string;

// Location/Map types
export interface HealthInfo {
  // Define based on your backend response
  vaccinations?: string[];
  healthRisks?: string[];
  recommendations?: string[];
  hospitals?: any[];
}

export interface MapData {
  // Define based on your backend response
  category?: string;
  locations?: any[];
  geoJson?: any;
}

// Generic API response types
export interface ApiResponse<T> {
  message?: string;
  trip?: T;
  data?: T;
  isSuccess?: boolean;
}

export interface ErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}

// Alert types (if needed)
export interface Alert {
  alertId: number;
  title: string;
  message: string;
  type: string;
  severity: string;
  countryCode: string;
  createdAt: string;
  isRead: boolean;
}

// Platform types
export interface PlatformConfig {
  apiUrl: string;
  isWeb: boolean;
  isMobile: boolean;
}

export interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: any[];
  };
  properties: {
    [key: string]: any;
  };
}

export interface GeoJSONData {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

// Map Data types
export interface MapData {
  category?: string;
  locations?: any[];
  geoJson?: any;
  rawData?: any;
  cleanData?: any;
  type?: string;
  GeoJson?: GeoJSONData; 
  features?: any[]; 
}

export interface MapTestResult {
  endpoint: string;
  success: boolean;
  data?: any;
  error?: string;
}

// Location types
export interface CountryInfo {
  name: string;
  code: string;
}

export interface HealthInfo {
  vaccinations?: string[];
  healthRisks?: string[];
  recommendations?: string[];
  hospitals?: any[];
}