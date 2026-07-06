import { completeJson } from "./groq";

export interface FeedbackToCluster {
  id: string;
  body: string;
}

export interface FeedbackClusterResult {
  id: string;
  sentiment: "positive" | "neutral" | "negative";
  theme: string;
}

const SYSTEM_PROMPT = `You analyze customer feedback for a product team. For each feedback item, assign:
- sentiment: exactly one of "positive", "neutral", "negative"
- theme: a short (2-4 word) label grouping this feedback with similar items (e.g. "onboarding friction", "pricing concerns", "missing integrations")

Use consistent theme labels across items that describe the same underlying issue. Respond with a JSON object of the shape {"results": [{"id": string, "sentiment": string, "theme": string}, ...]}, one entry per input item, in the same order.`;

/**
 * Clusters a batch of feedback into themes with sentiment via a single Groq
 * chat completion. This stands in for a separate embeddings + k-means
 * pipeline: Groq's free tier doesn't expose an embeddings endpoint, and an
 * LLM classification pass over a batch gets equivalent v1 signal for free.
 */
export async function clusterFeedback(
  items: FeedbackToCluster[]
): Promise<FeedbackClusterResult[]> {
  if (items.length === 0) return [];

  const prompt = JSON.stringify(
    items.map((item) => ({ id: item.id, body: item.body.slice(0, 1000) }))
  );

  const { results } = await completeJson<{ results: FeedbackClusterResult[] }>(
    prompt,
    SYSTEM_PROMPT
  );

  return results;
}
