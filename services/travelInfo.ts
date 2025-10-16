import { apiFetch } from "./api";

export async function getTravelInfo(isoCode: string) {
  return apiFetch(`/travelinfo/${isoCode}`, { method: "GET" });
}
