import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: "",
  baseURL: import.meta.env.VITE_OPENAI_BASE_URL || "http://localhost:8080/v1",
  dangerouslyAllowBrowser: true,
});
