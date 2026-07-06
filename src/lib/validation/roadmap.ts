import { z } from "zod";

export const roadmapStatusSchema = z.enum(["backlog", "planned", "in_progress", "shipped"]);

export const createRoadmapItemSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(160),
  description: z.string().trim().max(4000).optional(),
  status: roadmapStatusSchema.default("backlog"),
  targetQuarter: z.string().trim().max(20).optional(),
  linkedFeatureId: z.string().uuid().optional(),
  dependsOnItemIds: z.array(z.string().uuid()).max(20).optional().default([]),
});

export const updateRoadmapStatusSchema = z.object({
  itemId: z.string().uuid(),
  status: roadmapStatusSchema,
});
