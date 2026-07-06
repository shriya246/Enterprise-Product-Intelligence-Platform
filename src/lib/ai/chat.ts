import { getGroqClient, DEFAULT_MODEL } from "./groq";

const SYSTEM_PROMPT = `You are the product intelligence assistant inside PulseAI. You answer a product manager's questions using ONLY the analytics and feedback summary provided below — never invent numbers. If the data provided doesn't answer the question, say what's missing rather than guessing. Be concise and reference the actual figures given.`;

export async function answerQuestion(question: string, orgContext: string): Promise<string> {
  const groq = getGroqClient();
  if (!groq) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await groq.chat.completions.create({
    model: DEFAULT_MODEL,
    temperature: 0.3,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Org data:\n${orgContext}\n\nQuestion: ${question}` },
    ],
  });

  return response.choices[0]?.message?.content ?? "No answer was returned.";
}
