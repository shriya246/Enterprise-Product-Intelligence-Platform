import { z } from "zod";

export const manualFeedbackSchema = z.object({
  body: z.string().trim().min(3, "Feedback must be at least 3 characters").max(4000),
  author: z.string().trim().max(200).optional(),
});

export const feedbackImportRowSchema = z.object({
  body: z.string().trim().min(1).max(4000),
  author: z.string().trim().max(200).optional(),
});

export const feedbackImportSchema = z.object({
  rows: z.array(feedbackImportRowSchema).min(1).max(2000),
});

export type FeedbackImportInput = z.infer<typeof feedbackImportSchema>;
