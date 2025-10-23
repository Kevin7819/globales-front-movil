import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Detectar si estamos en web o dispositivo
const LOCAL_API = "http://localhost:5089/api";
const MOBILE_API = "http://192.168.0.104:5089/api"; // sirve solo si están en la misma red

//  Definir API_URL según la plataforma 
const API_URL = Platform.OS === "web" ? LOCAL_API : MOBILE_API;

// Función que obtiene el token según la plataforma
async function getToken() {
  if (Platform.OS === "web") {
    return localStorage.getItem("token");
  } else {
    return await AsyncStorage.getItem("token");
  }
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  requireAuth = false
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (requireAuth) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    console.log("Fetching:", `${API_URL}${endpoint}`); // debug para ver la URL
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", errorText);
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return null;
  } catch (err) {
    console.error("Fetch error:", err);
    throw err;
  }
}

export async function loginUser(data: any) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function registerUser(data: any) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export default apiFetch;