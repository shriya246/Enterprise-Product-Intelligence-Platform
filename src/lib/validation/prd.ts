import { z } from "zod";

export const generatePrdSchema = z.object({
  orgId: z.string().uuid(),
  featureIdea: z.string().trim().min(10, "Describe the idea in a bit more detail").max(2000),
  persona: z.string().trim().max(80).optional(),
  businessGoal: z.string().trim().max(400).optional(),
  relatedTheme: z.string().trim().max(120).optional(),
});
