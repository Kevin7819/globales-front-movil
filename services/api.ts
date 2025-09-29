import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://localhost:5089/api";

async function apiFetch(endpoint: string, options: RequestInit = {}, requireAuth = false) {
  const headers: Record<string, string> = {
  "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (requireAuth) {
    const token = await AsyncStorage.getItem("authToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Error en la solicitud");
  }

  return await response.json();
}

//login y register
export async function loginUser(data: any) {
  return apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) });
}

export async function registerUser(data: any) {
  return apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) });
}

/*
export async function getUserProfile() {
  return apiFetch("/users/profile", { method: "GET" }, true);
}

export async function getUserTrips() {
  return apiFetch("/trips", { method: "GET" }, true);
}

export async function getUserAlerts() {
  return apiFetch("/alerts", { method: "GET" }, true);
}*/