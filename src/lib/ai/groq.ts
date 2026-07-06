import Groq from "groq-sdk";

export const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

let client: Groq | null = null;

/** Returns null when no GROQ_API_KEY is configured yet, so callers can fail gracefully. */
export function getGroqClient(): Groq | null {
  if (!isGroqConfigured()) return null;
  if (!client) {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY! });
  }
  return client;
}

/** Asks the model for a single JSON object and parses it, throwing if the model didn't comply. */
export async function completeJson<T>(prompt: string, systemPrompt: string): Promise<T> {
  const groq = getGroqClient();
  if (!groq) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await groq.chat.completions.create({
    model: DEFAULT_MODEL,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Groq returned an empty response");
  }

  return JSON.parse(content) as T;
}
