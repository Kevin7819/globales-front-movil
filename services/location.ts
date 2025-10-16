import { apiFetch } from "./api";

// GeoJSON Borders
export async function getCountryBorders(isoCode: string) {
  return apiFetch(`/Location/geojson/${isoCode}`, { method: "GET" });
}

// Health Indicators
export async function getCountryIndicators(isoCode: string) {
  return apiFetch(`/Location/health/${isoCode}`, { method: "GET" });
}

export async function getTravelInfo(isoCode: string) {
  return apiFetch(`/TravelInfo/${isoCode}`, { method: "GET" });
}
