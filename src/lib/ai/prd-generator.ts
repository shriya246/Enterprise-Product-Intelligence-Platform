import { completeJson } from "./groq";

export interface PrdDraft {
  title: string;
  userStories: string[];
  acceptanceCriteria: string[];
  successMetrics: string[];
  risks: string[];
}

export interface PrdGenerationInput {
  featureIdea: string;
  persona?: string;
  businessGoal?: string;
  relatedFeedback?: string;
}

const SYSTEM_PROMPT = `You are a senior product manager drafting a starting-point PRD from a short feature idea. Respond as JSON: {"title": string, "userStories": string[], "acceptanceCriteria": string[], "successMetrics": string[], "risks": string[]}. User stories should follow "As a [user], I want [goal] so that [benefit]" format, 3-6 of them. Acceptance criteria should be concrete and testable, 3-6 of them. Success metrics should be measurable (e.g. "X% increase in..."), 2-4 of them. Risks should call out real product/technical/adoption risks, 2-4 of them. This is a draft for a PM to edit, not a finished spec — keep it grounded in the idea given, not generic boilerplate. If a primary persona, business goal, or related customer feedback is provided, ground the user stories and success metrics in them specifically.`;

export async function generatePrd(input: PrdGenerationInput): Promise<PrdDraft> {
  const prompt = [
    `Feature idea: ${input.featureIdea}`,
    input.persona && `Primary persona: ${input.persona}`,
    input.businessGoal && `Business goal: ${input.businessGoal}`,
    input.relatedFeedback && `Related customer feedback:\n${input.relatedFeedback}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return completeJson<PrdDraft>(prompt, SYSTEM_PROMPT);
}
