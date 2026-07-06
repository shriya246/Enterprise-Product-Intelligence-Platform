import { completeJson } from "./groq";

export interface RoadmapItemForPrioritization {
  id: string;
  title: string;
  description: string | null;
  status: string;
  adoptionPct: number | null; // adoption of the linked feature, if any
  feedbackMentions: number; // count of feedback items whose theme matches this item's title/theme
}

export interface RoadmapPriorityResult {
  id: string;
  priorityScore: number; // 0-100
  rationale: string;
}

const SYSTEM_PROMPT = `You are a product prioritization assistant. Given a list of roadmap items with their current status, linked feature adoption percentage (if any), and related feedback mention counts, assign each a priorityScore from 0-100 (100 = do this next) and a one-sentence rationale grounded in the engagement/feedback signals provided — not generic advice. Items already "shipped" should score low since they don't need prioritizing. Respond as JSON: {"results": [{"id": string, "priorityScore": number, "rationale": string}, ...]}, one entry per input item.`;

export async function prioritizeRoadmap(
  items: RoadmapItemForPrioritization[]
): Promise<RoadmapPriorityResult[]> {
  if (items.length === 0) return [];

  const prompt = JSON.stringify(items);
  const { results } = await completeJson<{ results: RoadmapPriorityResult[] }>(
    prompt,
    SYSTEM_PROMPT
  );

  return results;
}
