// services/AiApi.ts
import apiFetch from "./api";

export type AiAnswer = { answer?: string } | string;

export const AiApi = {
  async ask(question: string, lang: string = "es"): Promise<string> {
    // GET con query params y requireAuth=true para que meta el Bearer token
    const res: AiAnswer = await apiFetch(
      `/ai/ask?question=${encodeURIComponent(question)}&lang=${encodeURIComponent(lang)}`,
      { method: "GET" },
      true
    );

    // El backend devuelve { answer: string } — por si acaso, toleramos string directo
    if (typeof res === "string") return res;
    return res?.answer ?? "";
  },
};