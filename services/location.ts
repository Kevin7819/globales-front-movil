import { apiFetch } from "./api";

export async function getCountryBorders(isoCode: string) {
  return apiFetch(`/location/borders/${isoCode}`, { method: "GET" });
}

export async function getCountryIndicators(isoCode: string) {
  return apiFetch(`/location/indicators/${isoCode}`, { method: "GET" });
}
