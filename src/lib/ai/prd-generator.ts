import { completeJson } from "./groq";

export interface PrdDraft {
  title: string;
  userStories: string[];
  acceptanceCriteria: string[];
  successMetrics: string[];
  risks: string[];
}

const SYSTEM_PROMPT = `You are a senior product manager drafting a starting-point PRD from a short feature idea. Respond as JSON: {"title": string, "userStories": string[], "acceptanceCriteria": string[], "successMetrics": string[], "risks": string[]}. User stories should follow "As a [user], I want [goal] so that [benefit]" format, 3-6 of them. Acceptance criteria should be concrete and testable, 3-6 of them. Success metrics should be measurable (e.g. "X% increase in..."), 2-4 of them. Risks should call out real product/technical/adoption risks, 2-4 of them. This is a draft for a PM to edit, not a finished spec — keep it grounded in the idea given, not generic boilerplate.`;

export async function generatePrd(featureIdea: string): Promise<PrdDraft> {
  return completeJson<PrdDraft>(featureIdea, SYSTEM_PROMPT);
}
