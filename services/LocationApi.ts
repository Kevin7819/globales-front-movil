import apiFetch from "./api";

export async function fetchCountries(): Promise<string[]> {
  const res = await apiFetch("/Location/countries", { method: "GET" });
  return res;
}

export async function fetchLanguages(): Promise<string[]> {
  const res = await apiFetch("/Location/languages", { method: "GET" });
  return res;
}