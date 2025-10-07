import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://localhost:5089/api";

// Wrapper genérico
async function apiFetch(endpoint: string, options: RequestInit = {}, requireAuth = false) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (requireAuth) {
    const token = await AsyncStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  try {
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

export default apiFetch;