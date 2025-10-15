import apiFetch from "./api";

// ============================
// LOCATION ENDPOINTS
// ============================


export async function getCountryHealth(countryCode: string) {
  return apiFetch(`/Location/health/${countryCode}`, { method: "GET" });
}

export async function getCountryGeoJson(countryCode: string) {
  return apiFetch(`/Location/geojson/${countryCode}`, { method: "GET" });
}

// ============================
// AI ENDPOINTS (públicos)
// ============================

/**
 * Get a general AI answer
 * @param question - La pregunta
 * @param lang - Idioma (default: "es")
 */
export async function getGeneralAnswer(question: string, lang: string = "es") {
  return apiFetch(`/Ai/ask?prompt=${encodeURIComponent(question)}&lang=${lang}`, {
    method: "GET",
  });
}

/**
 * Get raw map data (sin procesar)
 * @param countryCode - Código ISO (ej: "CRI")
 */
export async function getMapDataRaw(countryCode: string) {
  return apiFetch(`/Ai/mapdata/raw/${countryCode}`, { method: "GET" });
}

/**
 * Get map data by category
 * @param countryCode - Código ISO
 * @param category - "salud" | "seguridad" | "cultura"
 */
export async function getMapDataByCategory(countryCode: string, category: string) {
  const validCategories = ["salud", "seguridad", "cultura"];
  if (!validCategories.includes(category)) {
    throw new Error(`Category must be one of: ${validCategories.join(", ")}`);
  }
  
  return apiFetch(`/Ai/mapdata/${category}/${countryCode}`, { method: "GET" });
}

/**
 * Shortcuts para cada categoría
 */
export async function getMapDataSalud(countryCode: string) {
  return getMapDataByCategory(countryCode, "salud");
}

export async function getMapDataSeguridad(countryCode: string) {
  return getMapDataByCategory(countryCode, "seguridad");
}

export async function getMapDataCultura(countryCode: string) {
  return getMapDataByCategory(countryCode, "cultura");
}