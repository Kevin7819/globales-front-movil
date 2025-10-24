import { CountryInfo, HealthInfo, MapData } from '../types';
import apiFetch from './api';

export const locationService = {
  async fetchCountries(): Promise<CountryInfo[]> {
    return apiFetch("/Location/countries", { method: "GET" });
  },

  async fetchLanguages(): Promise<string[]> {
    return apiFetch("/Location/languages", { method: "GET" });
  },

  async getCountryHealth(countryCode: string): Promise<HealthInfo> {
    return apiFetch(`/Location/health/${countryCode}`, { method: 'GET' });
  },

  async getCountryBorders(isoCode: string): Promise<MapData> {
    return apiFetch(`/Location/geojson/${isoCode}`, { method: "GET" });
  }
};