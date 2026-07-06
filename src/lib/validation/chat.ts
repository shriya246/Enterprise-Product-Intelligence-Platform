import { z } from "zod";

export const chatRequestSchema = z.object({
  orgId: z.string().uuid(),
  question: z.string().trim().min(1).max(1000),
});
