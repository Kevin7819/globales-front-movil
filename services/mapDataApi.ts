import { MapData } from '../types';
import apiFetch from "./api";

export const mapDataService = {
  async getMapDataRaw(countryCode: string): Promise<MapData> {
    return apiFetch(`/Ai/mapdata/raw/${countryCode}`, { method: "GET" });
  },

  async getMapDataClean(countryCode: string): Promise<MapData> {
    return apiFetch(`/Ai/mapdata/clean/${countryCode}`, { method: "GET" });
  },

  async getMapDataGeoJson(countryCode: string): Promise<MapData> {
    return apiFetch(`/Ai/mapdata/geojson/${countryCode}`, { method: "GET" });
  },

  async getMapDataByCategory(countryCode: string, category: "salud" | "seguridad" | "cultura"): Promise<MapData> {
    return apiFetch(`/Ai/mapdata/${category}/${countryCode}`, { method: "GET" });
  },

  async getMapDataSalud(countryCode: string): Promise<MapData> {
    const data = await this.getMapDataByCategory(countryCode, "salud");
    return typeof data === 'string' ? JSON.parse(data) : data;
  },

  async getMapDataSeguridad(countryCode: string): Promise<MapData> {
    const data = await this.getMapDataByCategory(countryCode, "seguridad");
    return typeof data === 'string' ? JSON.parse(data) : data;
  },

  async getMapDataCultura(countryCode: string): Promise<MapData> {
    const data = await this.getMapDataByCategory(countryCode, "cultura");
    return typeof data === 'string' ? JSON.parse(data) : data;
  },
};

export const {
  getMapDataCultura,
  getMapDataSalud,
  getMapDataSeguridad
} = mapDataService;
