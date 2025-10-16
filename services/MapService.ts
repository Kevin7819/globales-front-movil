import apiFetch from "./api";

export async function getCountryHealth(countryCode: string) {
  return apiFetch(`/Location/health/${countryCode}`, { method: "GET" });
}

export async function getCountryGeoJson(countryCode: string) {
  return apiFetch(`/Location/geojson/${countryCode}`, { method: "GET" });
}

export async function getGeneralAnswer(question: string, lang: string = "es") {
  return apiFetch(`/Ai/ask?prompt=${encodeURIComponent(question)}&lang=${lang}`, {
    method: "GET",
  });
}

export async function getMapDataRaw(countryCode: string) {
  return apiFetch(`/Ai/mapdata/raw/${countryCode}`, { method: "GET" });
}

export async function getMapDataClean(countryCode: string) {
  return apiFetch(`/Ai/mapdata/clean/${countryCode}`, { method: "GET" });
}

export async function getMapDataGeoJson(countryCode: string) {
  return apiFetch(`/Ai/mapdata/geojson/${countryCode}`, { method: "GET" });
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

export async function getMapDataSalud(countryCode: string) {
  const data = await getMapDataByCategory(countryCode, "salud");
  return typeof data === 'string' ? JSON.parse(data) : data;
}

export async function getMapDataSeguridad(countryCode: string) {
  const data = await getMapDataByCategory(countryCode, "seguridad");
  return typeof data === 'string' ? JSON.parse(data) : data;
}

export async function getMapDataCultura(countryCode: string) {
  const data = await getMapDataByCategory(countryCode, "cultura");
  return typeof data === 'string' ? JSON.parse(data) : data;
}

export async function testAIMapData(countryCode: string = "CRI") {
  try {
    console.log("Probando endpoints de AI para mapa...");
    
    const endpoints = [
      { name: "GeoJSON", func: () => getMapDataGeoJson(countryCode) },
      { name: "Clean", func: () => getMapDataClean(countryCode) },
      { name: "Raw", func: () => getMapDataRaw(countryCode) },
      { name: "Salud", func: () => getMapDataSalud(countryCode) },
      { name: "Seguridad", func: () => getMapDataSeguridad(countryCode) },
      { name: "Cultura", func: () => getMapDataCultura(countryCode) },
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Probando ${endpoint.name}...`);
        const data = await endpoint.func();
        console.log(`${endpoint.name}:`, data ? "Datos recibidos" : "Sin datos");
        results.push({ endpoint: endpoint.name, success: true, data });
      } catch (error: any) {
        console.error(` ${endpoint.name}:`, error.message);
        results.push({ endpoint: endpoint.name, success: false, error: error.message });
      }
    }
    
    return results;
  } catch (error) {
    console.error("Error en testAIMapData:", error);
    throw error;
  }
}