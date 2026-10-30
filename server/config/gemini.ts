import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const GEMINI_MODEL = 'gemini-3.8-flash';

export const hasGeminiApiKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');
