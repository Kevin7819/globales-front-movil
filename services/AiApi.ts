import { AiAnswer } from '../types';
import apiFetch from './api';

export const AiApi = {
  async ask(question: string, lang: string = "es"): Promise<string> {
    const res: AiAnswer = await apiFetch(
      `/ai/ask?question=${encodeURIComponent(question)}&lang=${encodeURIComponent(lang)}`,
      { method: 'GET' },
      true
    );

    if (typeof res === 'string') return res;
    return res?.answer ?? '';
  },
};